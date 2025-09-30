import { GoogleGenAI } from '@google/genai';
import type {PaymentData} from '../types/paymentData';

export interface GeminiResponse {
  text: string;
  paymentData?: PaymentData;
  error?: string;
}

// ============================================================================
// PROMPT TEMPLATE - Edit this to customize the prompt sent to Gemini
// ============================================================================
// The {user_input} placeholder will be replaced with the actual user text
const PROMPT_TEMPLATE = `You are a expert in reading banking information and converting them into JSON format. You will receive information about the payment, that should be performed and you will extract following information needed: account number, bank code, amount, currency, payment date in ISO format, message, variable symbol (used for identification of payment in Czech banking).
If any part of the required information is missing, you will input null value instead.
If there is no account number and bank code number, do not extract message.
The message can by in any language.
You must return only valid JSON in format eg:
{
account_number: "",
bank_code: "",
amount: 0,
currency: "",
payment_date: "1900-01-01",
message: "",
variable_symbol: 0
}

The message that should be converted is in <user_input></user_input> tags.

<example>
<input>
Pojistné je osvobozeno od daně z přidané hodnoty dle §51 a §55 zákona č.235/2004 Sb., o dani z přidané hodnoty, ve znění pozdějších předpisů.
Bankovní spojení:
datum splatnosti: 24. 10. 2025
číslo účtu příjemce: 129307011/0100
konstantní symbol: 3558
variabilni symbol: 6962100430
splátka pojistného: 680 Kč
celkem k úhradě: 680 Kč
</input>
<output>
{
account_number: "129307011",
bank_code: "0100"
amount: 680 ,
currency: "CZK",
payment_date: "2025-10-24",
message: "",
variable_symbol: 6962100430
}
</output>
</example>


<user_input>
{user_input}
</user_input>`;
// ============================================================================

export class GeminiService {
  private genai: GoogleGenAI;

  constructor(apiKey: string) {
    this.genai = new GoogleGenAI({ apiKey });
  }

  async generateContent(userInput: string, model: string = 'gemini-2.5-flash'): Promise<GeminiResponse> {
    try {
      // Replace {user_input} placeholder with actual user input
      const finalPrompt = PROMPT_TEMPLATE.replace('{user_input}', userInput);

      const result = await this.genai.models.generateContent({
        model,
        contents: finalPrompt
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON response
      let paymentData: PaymentData | undefined;
      if (text) {
        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : text;

          paymentData = JSON.parse(jsonString.trim()) as PaymentData;
        } catch (parseError) {
          console.warn('Failed to parse payment data from response:', parseError);
        }
      }

      return { text, paymentData };
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