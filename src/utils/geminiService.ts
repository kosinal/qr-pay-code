import { GoogleGenAI } from '@google/genai';

export interface GeminiResponse {
  text: string;
  error?: string;
}

export class GeminiService {
  private genai: GoogleGenAI;

  constructor(apiKey: string) {
    this.genai = new GoogleGenAI({ apiKey });
  }

  async generateContent(prompt: string): Promise<GeminiResponse> {
    try {
      const result = await this.genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return { text };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        text: '',
        error: errorMessage
      };
    }
  }
}

export const createGeminiService = (apiKey: string): GeminiService => {
  return new GeminiService(apiKey);
};