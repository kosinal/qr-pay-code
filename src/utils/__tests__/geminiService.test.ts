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
    it('returns text response with prompt template applied', async () => {
      const mockText = 'Generated response text';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash');
      expect(callArgs.contents).toContain(mockPrompt);
      expect(callArgs.contents).toContain('banking information');
      expect(result).toEqual({ text: mockText, paymentData: undefined });
      expect(result.error).toBeUndefined();

      consoleWarnSpy.mockRestore();
    });

    it('parses JSON payment data from response', async () => {
      const mockPaymentData = {
        account_number: '129307011',
        bank_code: '0100',
        amount: 680,
        currency: 'CZK',
        payment_date: '2025-10-24',
        message: '',
        variable_symbol: 6962100430
      };
      const mockText = JSON.stringify(mockPaymentData);

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

      expect(result.text).toBe(mockText);
      expect(result.paymentData).toEqual(mockPaymentData);
      expect(result.error).toBeUndefined();
    });

    it('parses JSON from markdown code blocks', async () => {
      const mockPaymentData = {
        account_number: '129307011',
        bank_code: '0100',
        amount: 680,
        currency: 'CZK',
        payment_date: '2025-10-24',
        message: '',
        variable_symbol: 6962100430
      };
      const mockText = '```json\n' + JSON.stringify(mockPaymentData, null, 2) + '\n```';

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

      expect(result.text).toBe(mockText);
      expect(result.paymentData).toEqual(mockPaymentData);
      expect(result.error).toBeUndefined();
    });

    it('handles invalid JSON gracefully', async () => {
      const mockText = 'This is not valid JSON';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

      expect(result.text).toBe(mockText);
      expect(result.paymentData).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to parse payment data from response:', expect.any(Error));

      consoleWarnSpy.mockRestore();
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

      expect(result).toEqual({ text: '', paymentData: undefined });
    });

    it('uses custom model when provided', async () => {
      const mockText = 'Generated response text';
      const customModel = 'gemini-2.5-pro';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe(customModel);
      expect(callArgs.contents).toContain(mockPrompt);
      expect(callArgs.contents).toContain('banking information');
      expect(result).toEqual({ text: mockText, paymentData: undefined });

      consoleWarnSpy.mockRestore();
    });

    it('defaults to gemini-2.5-flash when no model provided', async () => {
      const mockText = 'Generated response text';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash');
      expect(callArgs.contents).toContain(mockPrompt);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('createGeminiService', () => {
    it('creates and returns GeminiService instance', () => {
      const service = createGeminiService(mockApiKey);
      expect(service).toBeInstanceOf(GeminiService);
    });
  });
});