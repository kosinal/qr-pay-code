import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService, createGeminiService } from '../geminiService';
import type { PaymentData } from '../../types/paymentData.ts';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
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
              parts: [{ text: mockText }],
            },
          },
        ],
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

    it('parses tot thought response', async () => {
      const response = `
<discussion>
**Expert 1:** My first step is to scan the \`<user_input>\` text for keywords that correspond to the required data fields. I've spotted: "datum splatnosti:", "číslo účtu příjemce:", "konstantní symbol:", "variabilni symbol:", and lines containing "Kč" which indicate amount and currency.
**Expert 2:** I will prepare the final JSON structure with all values set to \`null\`. This ensures we start with a valid base that conforms to the required output format.
**Expert 3:** I'm noting the rules. The most complex one is the \`message\` extraction, which depends on finding both \`account_number\` and \`bank_code\`. I'll also be watching for any fields that are not present in the text, like \`specific_symbol\`, to ensure they remain \`null\`.
</discussion>
<discussion>
**Expert 1:** I'm extracting the account details from the line "číslo účtu příjemce: 129307011/0100". The account number is "129307011" and the bank code is "0100".
**Expert 2:** I will format these values as strings, as required. The JSON will be updated with \`"account_number": "129307011"\` and \`"bank_code": "0100"\`.
**Expert 3:** Now that both \`account_number\` and \`bank_code\` have been found, the \`message\` rule is active. I will scan the text for a relevant message, excluding the introductory/concluding pleasantries and the financial details. The legal disclaimer "Pojistné je osvobozeno..." is general information, not a specific payment message. Following the example's precedent, the message should be an empty string \`""\`.
</discussion>
<discussion>
**Expert 1:** Next, I'll extract the date from "datum splatnosti: 24. 10. 2025". The raw value is "24. 10. 2025".
**Expert 2:** I need to convert this date into the ISO 8601 format (YYYY-MM-DD). "24. 10. 2025" becomes "2025-10-24". I'll add this to our JSON object.
**Expert 3:** The date conversion is correct and follows the specified format. The process is on track.
</discussion>
<discussion>
**Expert 1:** I see two lines for the amount: "splátka pojistného: 680 Kč" and "celkem k úhradě: 680 Kč". The amount is consistently 680 and the currency indicator is "Kč".
**Expert 2:** I will format the amount as a number, \`680\`, and convert the currency "Kč" to its standard ISO code, "CZK".
**Expert 3:** The extraction is correct. Using "celkem k úhradě" (total to be paid) is a reliable source for the \`amount\`. The currency standardization to "CZK" is accurate.
</discussion>
<discussion>
**Expert 1:** Now for the symbols. I've found "konstantní symbol: 3558" and "variabilni symbol: 6862403405". I do not see a "specific symbol" mentioned anywhere.
**Expert 2:** The variable and constant symbols must be numbers. I will add \`variable_symbol: 6862403405\` and \`constant_symbol: 3558\` to the JSON. Since \`specific_symbol\` was not found, its value will remain \`null\`.
**Expert 3:** I confirm that \`specific_symbol\` is missing from the input, so \`null\` is the correct value according to the "Missing Information" rule. All other extracted data and their types are correct. The JSON is now complete.
</discussion>

\`\`\`json
{
    "account_number": "129307011",
    "bank_code": "0100",
    "amount": 680,
    "currency": "CZK",
    "payment_date": "2025-10-24",
    "message": "",
    "variable_symbol": 6862403405,
    "constant_symbol": 3558,
    "specific_symbol": null
}
\`\`\``;

      expect(geminiService.parseJsonFromLLMResponse<PaymentData>(response)).toStrictEqual({
        account_number: '129307011',
        bank_code: '0100',
        amount: 680,
        currency: 'CZK',
        payment_date: '2025-10-24',
        message: '',
        variable_symbol: 6862403405,
        constant_symbol: 3558,
        specific_symbol: null,
      });
    });
    it('parses raw response', async () => {
      const response = `
{
    "account_number": "129307011",
    "bank_code": "0100",
    "amount": 680,
    "currency": "CZK",
    "payment_date": "2025-10-24",
    "message": "",
    "variable_symbol": 6862403405,
    "constant_symbol": 3558,
    "specific_symbol": null
}`;

      expect(geminiService.parseJsonFromLLMResponse<PaymentData>(response)).toStrictEqual({
        account_number: '129307011',
        bank_code: '0100',
        amount: 680,
        currency: 'CZK',
        payment_date: '2025-10-24',
        message: '',
        variable_symbol: 6862403405,
        constant_symbol: 3558,
        specific_symbol: null,
      });
    });

    it('parses JSON payment data from response', async () => {
      const mockPaymentData = {
        account_number: '129307011',
        bank_code: '0100',
        amount: 680,
        currency: 'CZK',
        payment_date: '2025-10-24',
        message: '',
        variable_symbol: 6862403405,
      };
      const mockText = JSON.stringify(mockPaymentData);

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockText }],
            },
          },
        ],
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
        variable_symbol: 6862403405,
      };
      const mockText = '```json\n' + JSON.stringify(mockPaymentData, null, 2) + '\n```';

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockText }],
            },
          },
        ],
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
              parts: [{ text: mockText }],
            },
          },
        ],
      });

      const result = await geminiService.generateContent(mockPrompt);

      expect(result.text).toBe(mockText);
      expect(result.paymentData).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to parse payment data from response:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('returns error response on API failure', async () => {
      const mockError = new Error('API Error');

      mockGenerateContent.mockRejectedValue(mockError);

      const result = await geminiService.generateContent(mockPrompt);

      expect(result).toEqual({
        text: '',
        error: 'API Error',
      });
    });

    it('handles unknown error types', async () => {
      mockGenerateContent.mockRejectedValue('Unknown error');

      const result = await geminiService.generateContent(mockPrompt);

      expect(result).toEqual({
        text: '',
        error: 'Unknown error occurred',
      });
    });

    it('handles empty response', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [],
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
              parts: [{ text: mockText }],
            },
          },
        ],
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
              parts: [{ text: mockText }],
            },
          },
        ],
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
