import { logger } from "../../../lib/logger/structured-logger";
import { aiConfig } from "../config/ai.config";
import type { AIJsonResponse, AIUsage } from "../types";
import { parseJsonWithFallback } from "../utils/json";

interface JsonCompletionInput {
  prompt: string;
  model?: string;
  temperature?: number;
}

export class AIClientService {
  async completeJson<T>(input: JsonCompletionInput): Promise<AIJsonResponse<T>> {
    if (!aiConfig.apiKey) {
      throw new Error("OPENAI_API_KEY is required for AI content processing");
    }

    let lastError: unknown;
    const model = input.model ?? aiConfig.model;

    for (let attempt = 1; attempt <= aiConfig.maxRetries; attempt += 1) {
      const selectedModel = attempt === aiConfig.maxRetries ? aiConfig.fallbackModel : model;

      try {
        const rawResponse = await this.requestResponsesApi(input.prompt, selectedModel, input.temperature ?? 0.1);
        const rawText = this.extractText(rawResponse);
        const parsed = parseJsonWithFallback<T>(rawText);

        return {
          data: parsed,
          raw: rawText,
          model: selectedModel,
          usage: this.extractUsage(rawResponse),
        };
      } catch (error) {
        lastError = error;
        logger.warn("OpenAI JSON completion attempt failed", {
          attempt,
          maxRetries: aiConfig.maxRetries,
          model: selectedModel,
          error: error instanceof Error ? error.message : String(error),
        });

        if (attempt < aiConfig.maxRetries) {
          await this.sleep(1_000 * 2 ** (attempt - 1));
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async requestResponsesApi(prompt: string, model: string, temperature: number): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.requestTimeoutMs);

    try {
      const response = await fetch(`${aiConfig.baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature,
          input: [
            {
              role: "system",
              content:
                "You return only valid JSON for a food and beverage intelligence platform. You follow strict extraction rules and never invent facts.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}: ${await response.text()}`);
      }

      return (await response.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractText(response: Record<string, unknown>): string {
    if (typeof response.output_text === "string") return response.output_text;

    const output = response.output;
    if (Array.isArray(output)) {
      const texts = output.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const content = (item as { content?: unknown }).content;
        if (!Array.isArray(content)) return [];
        return content.flatMap((part) => {
          if (!part || typeof part !== "object") return [];
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? [text] : [];
        });
      });

      if (texts.length > 0) return texts.join("\n");
    }

    throw new Error("OpenAI response did not include output text");
  }

  private extractUsage(response: Record<string, unknown>): AIUsage {
    const usage = response.usage && typeof response.usage === "object" ? (response.usage as Record<string, unknown>) : {};
    const promptTokens = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0);
    const completionTokens = Number(usage.output_tokens ?? usage.completion_tokens ?? 0);

    return {
      promptTokens,
      completionTokens,
      totalTokens: Number(usage.total_tokens ?? promptTokens + completionTokens),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const aiClientService = new AIClientService();
