import React from 'react';
import { Accordion } from 'react-bootstrap';
import './FAQAccordion.css';
import { faqData } from '../utils/faqDef.ts';

const renderAnswerWithLinks = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="faq-link">
          {part}
        </a>
      );
    }
    return part;
  });
};

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
