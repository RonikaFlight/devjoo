/**
 * AI Proposal Assistant Service
 * ADR-018: Provider-agnostic AI with structured output parsing
 *
 * Generates a personalized cover letter, suggests price, and estimates
 * duration based on the project details and freelancer's profile.
 */

import { db } from '@/lib/db';
import { getAIProvider, parseAIJSON, AIError } from './provider';
import type { AICompletionResult } from './provider';

export interface ProposalGenerateInput {
  projectId: string;
  freelancerId: string;
  additionalNotes?: string;
  proposedPriceRial?: number;
}

export interface ProposalGenerateResult {
  coverLetter: string;
  suggestedPriceRial?: number;
  estimatedDuration: string;
  keyPoints: string[];
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
You are DevJoo's AI Proposal Assistant. Your job is to help a freelancer write a
compelling, personalized proposal for a project on a Persian freelance marketplace.

CRITICAL RULES:
1. The cover letter MUST be in Persian (Farsi) — professional, concise, and persuasive.
2. The cover letter should be 2-4 paragraphs covering:
   - Understanding of the project and why the freelancer is a great fit
   - Relevant experience and approach
   - Timeline and availability
   - Call to action (e.g., requesting a conversation)
3. Extract 3-5 key points that show the freelancer's relevant qualifications.
4. Suggest a competitive price in Iranian Rial (IRR) based on the project budget
   and the freelancer's profile. If the freelancer provides their own price,
   respect it and don't override.
5. Return valid JSON matching the required schema exactly.
6. Do not include fabricated claims about the freelancer's experience.
   Only reference what is provided in the freelancer profile context.
`;

/**
 * Build freelancer context from the database.
 */
async function getFreelancerContext(freelancerId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: freelancerId },
    select: {
      displayName: true,
      profile: {
        select: {
          bio: true,
          city: true,
          freelancerProfile: {
            select: {
              headline: true,
              hourlyRateRial: true,
              availability: true,
              experienceLevel: true,
              totalCompletedProjects: true,
              averageRating: true,
            },
          },
          userSkills: {
            select: {
              proficiencyLevel: true,
              skill: { select: { name: true } },
            },
          },
          portfolioItems: {
            take: 5,
            orderBy: { displayOrder: 'asc' },
            select: { title: true, description: true },
          },
        },
      },
    },
  });

  if (!user?.profile) {
    return 'اطلاعات فریلنسر در دسترس نیست.';
  }

  const fp = user.profile.freelancerProfile;
  const skills = user.profile.userSkills
    .map((us) => `${us.skill.name} (${us.proficiencyLevel ?? 'نامشخص'})`)
    .join('، ');

  const portfolio = user.profile.portfolioItems
    .map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ''}`)
    .join('\n');

  const lines = [
    `نام: ${user.displayName ?? 'نامشخص'}`,
    fp?.headline ? `عنوان شغلی: ${fp.headline}` : '',
    user.profile.bio ? `بیوگرافی: ${user.profile.bio}` : '',
    `مهارت‌ها: ${skills || 'نامشخص'}`,
    fp ? `نرخ ساعتی: ${fp.hourlyRateRial?.toLocaleString('fa-IR') ?? 'تنظیم نشده'} ریال` : '',
    fp ? `امتیاز: ${fp.averageRating ?? 'بدون امتیاز'} از ۵` : '',
    fp ? `پروژه‌های تکمیل شده: ${fp.totalCompletedProjects}` : '',
    user.profile.city ? `شهر: ${user.profile.city}` : '',
    portfolio ? `نمونه کارها:\n${portfolio}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Build project context from the database.
 */
async function getProjectContext(projectId: string): Promise<string> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      title: true,
      description: true,
      budgetType: true,
      budgetMinRial: true,
      budgetMaxRial: true,
      fixedPriceRial: true,
      experienceLevel: true,
      estimatedDuration: true,
      workType: true,
      skills: {
        select: { skill: { select: { name: true } } },
      },
      employer: {
        select: {
          displayName: true,
          profile: {
            select: {
              employerProfile: {
                select: {
                  companyName: true,
                  totalHired: true,
                  hireRate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) throw new AIError('پروژه یافت نشد', 'PROJECT_NOT_FOUND');

  const skills = project.skills
    .map((s) => s.skill.name)
    .join('، ');

  const budgetStr = project.budgetType === 'FIXED'
    ? `ثابت: ${project.fixedPriceRial?.toLocaleString('fa-IR')} ریال`
    : `ساعتی: ${project.budgetMinRial?.toLocaleString('fa-IR')} - ${project.budgetMaxRial?.toLocaleString('fa-IR')} ریال`;

  const ep = project.employer?.profile?.employerProfile;

  const lines = [
    `عنوان پروژه: ${project.title}`,
    `توضیحات:\n${project.description}`,
    `بودجه: ${budgetStr}`,
    `نوع بودجه: ${project.budgetType}`,
    `مهارت‌های مورد نیاز: ${skills}`,
    project.experienceLevel ? `سطح تجربه مورد نیاز: ${project.experienceLevel}` : '',
    project.estimatedDuration ? `مدت تخمینی: ${project.estimatedDuration}` : '',
    `نوع کار: ${project.workType}`,
    project.employer?.displayName ? `کارفرما: ${project.employer.displayName}` : '',
    ep?.companyName ? `شرکت: ${ep.companyName}` : '',
    ep ? `تعداد استخدام: ${ep.totalHired}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Generate a personalized proposal for a freelancer.
 */
export async function generateProposal(
  input: ProposalGenerateInput
): Promise<{ result: ProposalGenerateResult; meta: AICompletionResult['usage'] }> {
  const provider = getAIProvider();

  // Fetch project and freelancer context in parallel
  const [projectCtx, freelancerCtx] = await Promise.all([
    getProjectContext(input.projectId),
    getFreelancerContext(input.freelancerId),
  ]);

  const userMessage = `
Duration options: ${DURATION_OPTIONS.join(', ')}

${input.proposedPriceRial ? `The freelancer wants to propose: ${input.proposedPriceRial.toLocaleString('fa-IR')} Rial. Respect this price.` : 'Suggest a competitive price based on the project budget and freelancer profile.'}
${input.additionalNotes ? `\nFreelancer's additional notes:\n"${input.additionalNotes}"` : ''}

=== PROJECT CONTEXT ===
${projectCtx}

=== FREELANCER CONTEXT ===
${freelancerCtx}

Generate the proposal. Return JSON with this exact schema:
{
  "coverLetter": "Persian cover letter (2-4 paragraphs, professional and persuasive)",
  "suggestedPriceRial": <number, in IRR. Omit if freelancer provided their own price>,
  "estimatedDuration": "<one of the duration options>",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: userMessage },
  ];

  const completion = await provider.complete({
    messages,
    maxTokens: 1500,
    temperature: 0.7,
    responseFormat: 'json',
  });

  const parsed = parseAIJSON<ProposalGenerateResult>(completion.content);

  // Validate cover letter
  if (!parsed.coverLetter || parsed.coverLetter.length < 50) {
    throw new AIError(
      'متن پیشنهاد بسیار کوتاه است. لطفاً توضیحات بیشتری ارائه دهید.',
      'SHORT_COVER_LETTER'
    );
  }

  // If freelancer specified a price, use it
  if (input.proposedPriceRial) {
    parsed.suggestedPriceRial = input.proposedPriceRial;
  }

  // Validate duration
  if (parsed.estimatedDuration && !DURATION_OPTIONS.includes(parsed.estimatedDuration)) {
    parsed.estimatedDuration = 'TWO_TO_FOUR_WEEKS';
  }

  // Validate key points
  if (!Array.isArray(parsed.keyPoints) || parsed.keyPoints.length === 0) {
    parsed.keyPoints = ['تجربه مرتبط', 'تعهد به کیفیت', 'تحویل به‌موقع'];
  }
  parsed.keyPoints = parsed.keyPoints.slice(0, 5);

  return {
    result: parsed,
    meta: completion.usage,
  };
}
