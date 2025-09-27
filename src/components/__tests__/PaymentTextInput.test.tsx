import { render, fireEvent, screen } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { PaymentTextInput } from '../PaymentTextInput';

describe('PaymentTextInput Component', () => {
  const mockOnPaymentTextChange = vi.fn();

  afterEach(() => {
    mockOnPaymentTextChange.mockClear();
  });

  it('renders correctly with textarea and buttons', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByText('0 characters')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('Enter payment information'));
  });

  it('updates character counter when text is entered', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: 'Test payment info' } });

    expect(screen.getByText('17 characters')).toBeInTheDocument();
  });

  it('calls onPaymentTextChange with updated text', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    const testText = 'Payment for services rendered';
    fireEvent.input(textarea, { target: { value: testText } });

    expect(mockOnPaymentTextChange).toHaveBeenCalledWith(testText);
    expect(mockOnPaymentTextChange).toHaveBeenCalledTimes(1);
  });

  it('clears text when clear button is clicked', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.input(textarea, { target: { value: 'Test text to clear' } });
    expect(screen.getByText('19 characters')).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
    expect(screen.getByText('0 characters')).toBeInTheDocument();
    expect(mockOnPaymentTextChange).toHaveBeenCalledWith('');
  });

  it('disables clear button when textarea is empty', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: 'some text' } });
    expect(clearButton).not.toBeDisabled();
  });

  it('handles empty text correctly', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: '' } });

    expect(screen.getByText('0 characters')).toBeInTheDocument();
    expect(mockOnPaymentTextChange).toHaveBeenCalledWith('');
  });

  it('handles special characters and formatting', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    const specialText = '
Amount: $100.00
Currency: USD
Recipient: John Smith
Description: Invoice #12345
';
    fireEvent.input(textarea, { target: { value: specialText } });

    expect(screen.getByText(`${specialText.length} characters`)).toBeInTheDocument();
    expect(mockOnPaymentTextChange).toHaveBeenCalledWith(specialText);
  });

  it('handles very long text input', () => {
    render(
      <PaymentTextInput onPaymentTextChange={mockOnPaymentTextChange} />
    );

    const textarea = screen.getByRole('textbox');
    const longText = 'A'.repeat(1000);
    fireEvent.input(textarea, { target: { value: longText } });

    expect(screen.getByText('1000 characters')).toBeInTheDocument();
    expect(mockOnPaymentTextChange).toHaveBeenCalledWith(longText);
  });
});