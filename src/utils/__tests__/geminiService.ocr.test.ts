import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '../geminiService';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('GeminiService - OCR Functionality', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    geminiService = new GeminiService(mockApiKey);
  });

  describe('processImageOCR', () => {
    const createMockImageFile = (type: string = 'image/png'): File => {
      const blob = new Blob(['fake image data'], { type });
      return new File([blob], 'test-image.png', { type });
    };

    it('processes image and returns extracted text', async () => {
      const mockExtractedText = 'Account: 123456789/0100\nAmount: 1000 CZK';
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe(mockExtractedText);
      expect(result.error).toBeUndefined();
      expect(mockGenerateContent).toHaveBeenCalled();

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash');
      expect(callArgs.contents).toHaveLength(1);
      expect(callArgs.contents[0].parts).toHaveLength(2);
      expect(callArgs.contents[0].parts[0].text).toContain('OCR expert');
      expect(callArgs.contents[0].parts[1].inlineData).toBeDefined();
      expect(callArgs.contents[0].parts[1].inlineData.mimeType).toBe('image/png');
    });

    it('handles JPEG images correctly', async () => {
      const mockExtractedText = 'Payment information';
      const mockImageFile = createMockImageFile('image/jpeg');

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe(mockExtractedText);
      expect(result.error).toBeUndefined();

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts[1].inlineData.mimeType).toBe('image/jpeg');
    });

    it('handles WebP images correctly', async () => {
      const mockExtractedText = 'Payment details';
      const mockImageFile = createMockImageFile('image/webp');

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe(mockExtractedText);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts[1].inlineData.mimeType).toBe('image/webp');
    });

    it('uses custom model when provided', async () => {
      const mockExtractedText = 'Extracted text';
      const mockImageFile = createMockImageFile();
      const customModel = 'gemini-2.5-pro';

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile, customModel);

      expect(result.text).toBe(mockExtractedText);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe(customModel);
    });

    it('defaults to gemini-2.5-flash when no model provided', async () => {
      const mockExtractedText = 'Extracted text';
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      await geminiService.processImageOCR(mockImageFile);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash');
    });

    it('handles API errors gracefully', async () => {
      const mockError = new Error('API processing failed');
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockRejectedValue(mockError);

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe('');
      expect(result.error).toBe('API processing failed');
    });

    it('handles unknown error types', async () => {
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockRejectedValue('Unknown error');

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe('');
      expect(result.error).toBe('OCR processing failed');
    });

    it('handles empty response from API', async () => {
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockResolvedValue({
        candidates: [],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('handles missing text in response parts', async () => {
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('converts file to base64 correctly', async () => {
      const mockExtractedText = 'Text from image';
      const mockImageFile = createMockImageFile();

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockExtractedText }],
            },
          },
        ],
      });

      const result = await geminiService.processImageOCR(mockImageFile);

      expect(result.text).toBe(mockExtractedText);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts[1].inlineData.data).toBeDefined();
      expect(typeof callArgs.contents[0].parts[1].inlineData.data).toBe('string');
    });

    it('handles FileReader errors during base64 conversion', async () => {
      const mockImageFile = createMockImageFile();

      const originalFileReader = global.FileReader;
      global.FileReader = class {
        onerror: ((error: Error) => void) | null = null;
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('FileReader error'));
            }
          }, 0);
        }
      } as any;

      const resultPromise = geminiService.processImageOCR(mockImageFile);

      await expect(resultPromise).resolves.toEqual({
        text: '',
        error: 'FileReader error',
      });

      global.FileReader = originalFileReader;
    });
  });
});
