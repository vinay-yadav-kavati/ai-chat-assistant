import { GoogleGenAI } from '@google/genai';
import { Message } from '../types/api.types.js';
import { config } from '../lib/config.js';

let geminiClient: GoogleGenAI | null = null;

/**
 * Server-side assistant personality/system instruction.
 * Kept strictly server-side and applied across all chat generations.
 */
export const SYSTEM_INSTRUCTION = `You are a helpful, clear, and friendly AI assistant. Answer the user's questions accurately and concisely. Maintain context from the current conversation.`;

/**
 * Returns the lazily initialized GoogleGenAI client.
 */
export function getGeminiClient(): GoogleGenAI {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing on the server.');
  }

  geminiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return geminiClient;
}

/**
 * Transforms stored database messages into the contents format expected by Gemini.
 */
export function formatConversationHistory(
  messages: Message[],
  latestUserContent: string
) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (!msg.content || !msg.content.trim()) continue;

    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }],
    });
  }

  // Append the current incoming user message
  contents.push({
    role: 'user',
    parts: [{ text: latestUserContent.trim() }],
  });

  return contents;
}

/**
 * Helper to sleep for ms
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls the Google Gemini API with the conversation history and system instructions.
 * Follows an explicit ordered priority list of verified models:
 * 1. Primary Model (e.g. gemini-3.7-flash)
 * 2. Fallback Model 1 (gemini-3.6-flash)
 * 3. Fallback Model 2 (gemini-3.5-flash)
 * 4. Fallback Model 3 (gemini-flash-latest)
 *
 * For each model:
 * - Attempts generation.
 * - If successful, returns response immediately.
 * - If a transient/retryable error occurs (503 high demand / 429 quota / UNAVAILABLE),
 *   retries after backoff.
 * - If failures persist, moves to the next fallback model in the list.
 */
export async function generateChatResponse(
  existingMessages: Message[],
  latestUserContent: string
): Promise<string> {
  const ai = getGeminiClient();
  const contents = formatConversationHistory(existingMessages, latestUserContent);

  // Ordered list of models: Primary model followed by fallback models
  const candidateModels: string[] = [
    config.geminiModel || 'gemini-3.7-flash',
    ...config.geminiModelPriority.filter(
      (m) => m !== (config.geminiModel || 'gemini-3.7-flash')
    ),
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Attempt generation with retry for temporary failures
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        const replyText = response.text;
        if (!replyText || !replyText.trim()) {
          throw new Error('Received an empty response from the Gemini model.');
        }

        return replyText.trim();
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || '';
        const status = err?.status || err?.code;
        const isTransient =
          status === 503 ||
          status === 429 ||
          errMessage.includes('503') ||
          errMessage.includes('429') ||
          errMessage.includes('high demand') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 1) {
          // Brief backoff before second attempt on this model
          await sleep(1000);
          continue;
        }

        // If non-transient or second attempt failed, move to next model in priority order
        break;
      }
    }
  }

  // If all candidate models failed, throw the captured error
  console.error('All Gemini model candidates in priority list failed:', lastError);
  throw (
    lastError ||
    new Error('Failed to generate response from Gemini API after checking all models.')
  );
}
