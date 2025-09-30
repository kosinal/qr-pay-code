import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService, createGeminiService } from '../geminiService';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent
    }
  }))
}));

describe('GeminiService', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-api-key';
  const mockPrompt = 'Test payment information';

  beforeEach(() => {
    vi.clearAllMocks();
    geminiService = new GeminiService(mockApiKey);
  });

  describe('constructor', () => {
    it('creates instance with API key', () => {
      expect(geminiService).toBeInstanceOf(GeminiService);
    });
  });

  describe('generateContent', () => {
    it('returns text response on successful API call', async () => {
      const mockText = 'Generated response text';

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: mockText }
              ]
            }
          }
        ]
      });

      const result = await geminiService.generateContent(mockPrompt);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: mockPrompt
      });
      expect(result).toEqual({ text: mockText });
      expect(result.error).toBeUndefined();
    });

    it('returns error response on API failure', async () => {
      const mockError = new Error('API Error');

      mockGenerateContent.mockRejectedValue(mockError);

      const result = await geminiService.generateContent(mockPrompt);

      expect(result).toEqual({
        text: '',
        error: 'API Error'
      });
    });

    it('handles unknown error types', async () => {
      mockGenerateContent.mockRejectedValue('Unknown error');

      const result = await geminiService.generateContent(mockPrompt);

      expect(result).toEqual({
        text: '',
        error: 'Unknown error occurred'
      });
    });

    it('handles empty response', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: []
      });

      const result = await geminiService.generateContent(mockPrompt);

      expect(result).toEqual({ text: '' });
    });

    it('uses custom model when provided', async () => {
      const mockText = 'Generated response text';
      const customModel = 'gemini-2.5-pro';

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: mockText }
              ]
            }
          }
        ]
      });

      const result = await geminiService.generateContent(mockPrompt, customModel);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: customModel,
        contents: mockPrompt
      });
      expect(result).toEqual({ text: mockText });
    });

    it('defaults to gemini-2.5-flash when no model provided', async () => {
      const mockText = 'Generated response text';

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: mockText }
              ]
            }
          }
        ]
      });

      await geminiService.generateContent(mockPrompt);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: mockPrompt
      });
    });
  });

  describe('createGeminiService', () => {
    it('creates and returns GeminiService instance', () => {
      const service = createGeminiService(mockApiKey);
      expect(service).toBeInstanceOf(GeminiService);
    });
  });
});