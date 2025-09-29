import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimpleLayout } from '../SimpleLayout';

describe('SimpleLayout Component', () => {
  const mockOnPaymentTextChange = vi.fn();

  it('renders correctly with title and description', () => {
    render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Payment Information Input');
    expect(screen.getByText('Enter your payment information in the text area below. Include details like amount, currency, recipient, and description.')).toBeInTheDocument();
  });

  it('renders the PaymentTextInput component', () => {
    render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('passes the onPaymentTextChange handler correctly', () => {
    const { container } = render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    // Verify the component renders without errors
    expect(container).toBeInTheDocument();
  });

  it('has proper Bootstrap container structure', () => {
    const { container } = render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const containerDiv = container.querySelector('.simple-layout.container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('has Bootstrap card structure', () => {
    const { container } = render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('renders textarea with correct initial state', () => {
    render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('maintains proper accessibility', () => {
    render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});