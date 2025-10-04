interface FAQItem {
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    question: 'What is a QR Code Payment Generator?',
    answer:
      'A QR Code Payment Generator creates scannable QR codes containing payment information in the SPAYD format (Short Payment Descriptor). Recipients can scan these codes with their banking app to automatically fill in payment details.',
  },
  {
    question: 'Why is this better than ChatGPT?',
    answer:
      "Running a prompt directly in ChatGPT was my initial idea for solving this process. After a few tries, I found that the QR code information format requires specific transformations that were difficult to communicate consistently to ChatGPT. That's why I decided to create this dedicated tool.",
  },
  {
    question: 'What information do I need to generate a payment QR code?',
    answer:
      "You need basic payment details including the recipient's account number, bank code, amount (optional), currency, and optionally a payment message or variable symbol. Just describe the payment in natural language and the AI will extract the relevant information.",
  },
  {
    question: 'Why do I need a Gemini API key?',
    answer:
      "The Gemini API key allows the application to use Google's AI to intelligently parse your payment description and extract structured payment information. You can obtain a free API key from Google AI Studio.",
  },
  {
    question: 'Where can I get a Gemini API key?',
    answer: 'You can create a new API key at https://aistudio.google.com/api-keys .',
  },
  {
    question: 'How much does it cost?',
    answer:
      'It depends on your usage. For the vast majority of users, the free tier of Gemini is more than enough. For more details, visit https://ai.google.dev/gemini-api/docs/pricing .',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      "Yes! Your API key and payment information are processed locally in your browser and sent directly to Google's Gemini API. No payment data is stored on our servers. The API key is only kept in your browser's memory during the session.",
  },
  {
    question: 'How can I trust this site?',
    answer:
      "Never trust anyone on the internet just because they say so. I built this project primarily for myself and made it open source for others to use. You can always inspect the complete code hosted at https://github.com/kosinal/qr-pay-code . If you're still in doubt, you can generate a separate Gemini API key and remove it immediately after use.",
  },
  {
    question: 'What payment formats are supported?',
    answer:
      'The generator supports Czech banking standards (IBAN format) and creates SPAYD-compatible QR codes. These codes work with most Czech banking applications that support QR code payments.',
  },
  {
    question: 'Can I use this for international payments?',
    answer:
      'Currently no, the application is optimized for Czech banking systems (CZ IBAN format).',
  },
];
