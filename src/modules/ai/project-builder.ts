/**
 * AI Project Builder Service
 * ADR-018: Provider-agnostic AI with structured output parsing
 *
 * Takes a brief description from an employer and generates a
 * structured project draft (title, description, skills, budget, duration, etc.)
 */

import { db } from '@/lib/db';
import { getAIProvider, parseAIJSON, AIError } from './provider';
import type { AICompletionResult } from './provider';

export interface ProjectBuildInput {
  brief: string;
  categoryId?: string;
  budgetType?: 'FIXED' | 'HOURLY';
  workType?: 'REMOTE' | 'ONSITE' | 'HYBRID';
}

export interface ProjectBuildResult {
  title: string;
  description: string;
  skillSlugs: string[];
  budgetType: 'FIXED' | 'HOURLY';
  budgetMinRial?: number;
  budgetMaxRial?: number;
  fixedPriceRial?: number;
  estimatedDuration: string;
  experienceLevel: 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'EXPERT';
}

const DURATION_OPTIONS = [
  'LESS_THAN_1_WEEK',
  'ONE_TO_TWO_WEEKS',
  'TWO_TO_FOUR_WEEKS',
  'ONE_TO_TWO_MONTHS',
  'TWO_TO_THREE_MONTHS',
  'THREE_TO_SIX_MONTHS',
  'MORE_THAN_6_MONTHS',
];

const SYSTEM_PROMPT = `
You are DevJoo's AI Project Builder assistant. Your job is to take a brief project
description from an employer (in Persian or English) and generate a structured
project posting suitable for a Persian freelance marketplace.

CRITICAL RULES:
1. The generated title and description MUST be in Persian (Farsi).
2. The description should be detailed (at least 3 paragraphs), professional,
   and clearly explain the project scope, requirements, and expected deliverables.
3. Budget must be in Iranian Rial (IRR). Typical rates:
   - Junior: 200,000-500,000 IRR/hour or 5-15M IRR fixed
   - Mid-level: 500,000-1,200,000 IRR/hour or 15-40M IRR fixed
   - Senior: 1,200,000-2,500,000 IRR/hour or 40-100M IRR fixed
   - Expert: 2,500,000-5,000,000 IRR/hour or 100M+ IRR fixed
4. Return valid JSON matching the required schema exactly.
5. Skill slugs must match the provided skill list. Choose the 3-8 most relevant skills.
`;

/**
 * Build the skill context for the prompt from the database.
 */
async function getSkillContext(): Promise<string> {
  const skills = await db.skill.findMany({
    where: { isActive: true },
    select: { name: true, slug: true, category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  return skills
    .map((s) => `  - ${s.slug} (${s.name}${s.category ? ` / ${s.category.name}` : ''})`)
    .join('\n');
}

/**
 * Build the user message with the employer's brief and constraints.
 */
function buildUserMessage(
  input: ProjectBuildInput,
  skillContext: string
): string {
  const constraints: string[] = [];
  if (input.budgetType) {
    constraints.push(
      `Budget type: ${input.budgetType === 'FIXED' ? 'ثابت (Fixed)' : 'ساعتی (Hourly)'}`
    );
  }
  if (input.workType) {
    const labels: Record<string, string> = {
      REMOTE: 'دورکاری',
      ONSITE: 'حضوری',
      HYBRID: 'ترکیبی',
    };
    constraints.push(`Work type: ${labels[input.workType] ?? input.workType}`);
  }

  return `Available skills (use slugs from this list):
${skillContext}

Duration options: ${DURATION_OPTIONS.join(', ')}

${constraints.length > 0 ? `Employer constraints:\n${constraints.join('\n')}` : 'No specific constraints from employer.'}

Employer's brief:
"""
${input.brief}
"""

Generate the project. Return JSON with this exact schema:
{
  "title": "Persian project title (concise, descriptive)",
  "description": "Detailed Persian project description (3+ paragraphs)",
  "skillSlugs": ["skill-slug-1", "skill-slug-2", ...],
  "budgetType": "FIXED" or "HOURLY",
  "budgetMinRial": <number, for hourly budget>,
  "budgetMaxRial": <number, for hourly budget>,
  "fixedPriceRial": <number, for fixed budget>,
  "estimatedDuration": "<one of the duration options>",
  "experienceLevel": "JUNIOR" | "MID_LEVEL" | "SENIOR" | "EXPERT"
}`;
}

/**
 * Generate a structured project from an employer's brief.
 */
export async function buildProject(
  input: ProjectBuildInput
): Promise<{ result: ProjectBuildResult; meta: AICompletionResult['usage'] }> {
  const provider = getAIProvider();

  // Fetch available skills for context
  const skillContext = await getSkillContext();

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: buildUserMessage(input, skillContext) },
  ];

  const completion = await provider.complete({
    messages,
    maxTokens: 2048,
    temperature: 0.6,
    responseFormat: 'json',
  });

  const parsed = parseAIJSON<ProjectBuildResult>(completion.content);

  // Validate required fields
  if (!parsed.title || !parsed.description || !parsed.skillSlugs?.length) {
    throw new AIError(
      'AI generated incomplete project data',
      'INVALID_OUTPUT'
    );
  }

  // Validate skill slugs exist in DB
  const existingSkills = await db.skill.findMany({
    where: { slug: { in: parsed.skillSlugs }, isActive: true },
    select: { slug: true },
  });
  const validSlugs = new Set(existingSkills.map((s) => s.slug));
  parsed.skillSlugs = parsed.skillSlugs.filter((s) => validSlugs.has(s));

  // Validate budget fields based on type
  if (parsed.budgetType === 'HOURLY') {
    parsed.fixedPriceRial = undefined;
    if (!parsed.budgetMinRial || !parsed.budgetMaxRial) {
      throw new AIError(
        'بودجه ساعتی باید حداقل و حداکثر داشته باشد',
        'INVALID_BUDGET'
      );
    }
  } else {
    parsed.budgetMinRial = undefined;
    parsed.budgetMaxRial = undefined;
    if (!parsed.fixedPriceRial) {
      throw new AIError(
        'بودجه ثابت باید مبلغ مشخصی داشته باشد',
        'INVALID_BUDGET'
      );
    }
  }

  // Validate duration
  if (!DURATION_OPTIONS.includes(parsed.estimatedDuration)) {
    parsed.estimatedDuration = 'TWO_TO_FOUR_WEEKS';
  }

  // Validate experience level
  const validLevels = ['JUNIOR', 'MID_LEVEL', 'SENIOR', 'EXPERT'];
  if (!validLevels.includes(parsed.experienceLevel)) {
    parsed.experienceLevel = 'MID_LEVEL';
  }

  return {
    result: parsed,
    meta: completion.usage,
  };
}
