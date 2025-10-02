import React from 'react';
import { Accordion } from 'react-bootstrap';
import './FAQAccordion.css';

interface FAQItem {
  question: string;
  answer: string;
}

const renderAnswerWithLinks = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="faq-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const faqData: FAQItem[] = [
  {
    question: "What is a QR Code Payment Generator?",
    answer: "A QR Code Payment Generator creates scannable QR codes containing payment information in the SPAYD format (Short Payment Descriptor). Recipients can scan these codes with their banking app to automatically fill in payment details."
  },
  {
    question: "What information do I need to generate a payment QR code?",
    answer: "You need basic payment details including the recipient's account number, bank code, amount (optional), currency, and optionally a payment message or variable symbol. Just describe the payment in natural language and the AI will extract the relevant information."
  },
  {
    question: "Why do I need a Gemini API key?",
    answer: "The Gemini API key allows the application to use Google's AI to intelligently parse your payment description and extract structured payment information. You can obtain a free API key from Google AI Studio."
  },
  {
    question: "Where can I get Gemini API?",
    answer: "You can create new API key at https://aistudio.google.com/api-keys ."
  },
  {
    question: "How much does it cost?",
    answer: "It mostly depends on your usage. For vast majority of users, Free limit of Gemini is more than enough. For more details, visit https://ai.google.dev/gemini-api/docs/pricing ."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes! Your API key and payment information are processed locally in your browser and sent directly to Google's Gemini API. No payment data is stored on our servers. The API key is only kept in your browser's memory during the session."
  },
  {
    question: "What payment formats are supported?",
    answer: "The generator supports Czech banking standards (IBAN format) and creates SPAYD-compatible QR codes. These codes work with most Czech banking applications that support QR code payments."
  },
  {
    question: "Can I use this for international payments?",
    answer: "Currently no, the application is optimized for Czech banking (CZ IBAN format)."
  }
];

export const FAQAccordion: React.FC = () => {
  return (
    <div className="faq-section">
      <h2 className="text-center mb-4">Frequently Asked Questions</h2>
      <Accordion defaultActiveKey="0" className="faq-accordion">
        {faqData.map((faq, index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>
              <span className="faq-question">{faq.question}</span>
            </Accordion.Header>
            <Accordion.Body>
              <p className="faq-answer">{renderAnswerWithLinks(faq.answer)}</p>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};
