/**
 * AI Provider Abstraction Layer
 * ADR-018: Provider-agnostic AI with structured output parsing
 *
 * Supports: OpenAI-compatible APIs (OpenAI, local LLMs, etc.)
 * Future: Anthropic, Google Gemini
 */

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface AICompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  readonly name: string;
  complete(options: AICompletionOptions): Promise<AICompletionResult>;
}

// ============ Error Types ============

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// ============ OpenAI-Compatible Provider ============

export class OpenAIProvider implements AIProvider {
  readonly name: string;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.name = config.baseUrl ? 'OpenAI-Compatible' : 'OpenAI';
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const url = `${this.config.baseUrl ?? 'https://api.openai.com'}/v1/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1024,
      temperature: options.temperature ?? this.config.temperature ?? 0.7,
    };

    if (options.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new AIError(
        `AI request failed (${response.status}): ${errorBody}`,
        'PROVIDER_ERROR',
        this.name,
        response.status
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice?.message?.content) {
      throw new AIError(
        'AI returned empty response',
        'EMPTY_RESPONSE',
        this.name
      );
    }

    return {
      content: choice.message.content,
      model: data.model ?? this.config.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}

// ============ Provider Factory ============

let _defaultProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_defaultProvider) return _defaultProvider;

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new AIError(
      'AI_API_KEY is not configured',
      'CONFIG_MISSING'
    );
  }

  const config: AIProviderConfig = {
    apiKey,
    baseUrl: process.env.AI_BASE_URL || undefined,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS, 10) : 2048,
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
  };

  _defaultProvider = new OpenAIProvider(config);
  return _defaultProvider;
}

/**
 * Check if AI is configured and available.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/**
 * Parse JSON from AI response, handling potential markdown wrapping.
 */
export function parseAIJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIError(
      'Failed to parse AI JSON response',
      'PARSE_ERROR'
    );
  }
}
