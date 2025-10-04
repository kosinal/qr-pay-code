import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { FAQAccordion } from '../FAQAccordion';
import { faqData } from '../../utils/faqDef.ts';

describe('FAQAccordion Component', () => {
  it('renders the FAQ section title', () => {
    render(<FAQAccordion />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders with Bootstrap Accordion structure', () => {
    const { container } = render(<FAQAccordion />);
    expect(container.querySelector('.accordion')).toBeInTheDocument();
    expect(container.querySelectorAll('.accordion-item').length).toEqual(faqData.length);
  });

  it('first accordion item is open by default', () => {
    const { container } = render(<FAQAccordion />);

    const firstAccordionButton = container.querySelector('.accordion-button');
    expect(firstAccordionButton).not.toHaveClass('collapsed');
  });

  it('toggles accordion items on click', async () => {
    const user = userEvent.setup();
    const { container } = render(<FAQAccordion />);

    const accordionButtons = container.querySelectorAll('.accordion-button');
    const secondButton = accordionButtons[1] as HTMLElement;

    expect(secondButton).toHaveClass('collapsed');

    await user.click(secondButton);

    expect(secondButton).not.toHaveClass('collapsed');
  });

  it('renders links as clickable elements', () => {
    render(<FAQAccordion />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    const apiLink = links.find((link) =>
      link.getAttribute('href')?.includes('aistudio.google.com')
    );
    expect(apiLink).toBeInTheDocument();
    expect(apiLink).toHaveAttribute('target', '_blank');
    expect(apiLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders pricing documentation link', () => {
    render(<FAQAccordion />);

    const pricingLink = screen.getByRole('link', {
      name: /ai\.google\.dev\/gemini-api\/docs\/pricing/,
    });
    expect(pricingLink).toBeInTheDocument();
    expect(pricingLink).toHaveAttribute('href', 'https://ai.google.dev/gemini-api/docs/pricing');
  });

  it('applies custom CSS classes', () => {
    const { container } = render(<FAQAccordion />);

    expect(container.querySelector('.faq-section')).toBeInTheDocument();
    expect(container.querySelector('.faq-accordion')).toBeInTheDocument();
  });

  it('renders answers with proper text content', () => {
    render(<FAQAccordion />);

    expect(
      screen.getByText(/scannable QR codes containing payment information/)
    ).toBeInTheDocument();
    expect(screen.getByText(/processed locally in your browser/)).toBeInTheDocument();
  });

  it('has proper heading hierarchy', () => {
    render(<FAQAccordion />);

    const heading = screen.getByRole('heading', { name: 'Frequently Asked Questions' });
    expect(heading.tagName).toBe('H2');
  });

  it('renders multiple FAQ items', () => {
    const { container } = render(<FAQAccordion />);

    const accordionItems = container.querySelectorAll('.accordion-item');
    expect(accordionItems.length).toBeGreaterThan(5);
  });

  it('renders security-related FAQ correctly', () => {
    render(<FAQAccordion />);

    expect(
      screen.getByText(/Your API key and payment information are processed locally/)
    ).toBeInTheDocument();
    expect(screen.getByText(/No payment data is stored on our servers/)).toBeInTheDocument();
  });

  it('handles multiple links in single answer', () => {
    render(<FAQAccordion />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
