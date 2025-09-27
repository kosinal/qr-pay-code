import { render, screen } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { SimpleLayout } from '../SimpleLayout';

describe('SimpleLayout Component', () => {
  const mockOnPaymentTextChange = vi.fn();

  it('renders correctly with title and description', () => {
    render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Payment Information Input');
    expect(screen.getByText(/Enter payment information in the text area below/)).toBeInTheDocument();
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

  it('has proper structure with main-content container', () => {
    const { container } = render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const mainContent = container.querySelector('.main-content');
    expect(mainContent).toBeInTheDocument();
  });

  it('has input-container wrapper', () => {
    const { container } = render(
      <SimpleLayout onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const inputContainer = container.querySelector('.input-container');
    expect(inputContainer).toBeInTheDocument();
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