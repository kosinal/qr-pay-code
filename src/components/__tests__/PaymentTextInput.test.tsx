import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentTextInput } from '../PaymentTextInput';

describe('PaymentTextInput Component', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with textarea', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('Enter payment information'));
  });

  it('updates text when text is entered', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: 'Test payment info' } });

    expect(textarea).toHaveValue('Test payment info');
  });

  it('calls onChange with updated text', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox');
    const testText = 'Payment for services rendered';
    fireEvent.input(textarea, { target: { value: testText } });

    expect(mockOnChange).toHaveBeenCalledWith(testText);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });


  it('handles empty text correctly', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'some text' } });
    expect(mockOnChange).toHaveBeenCalledWith('some text');

    mockOnChange.mockClear();

    fireEvent.change(textarea, { target: { value: '' } });

    expect(textarea).toHaveValue('');
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('handles special characters and formatting', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const specialText = 'Amount: $100.00\nCurrency: USD\nRecipient: John Smith\nDescription: Invoice #12345';
    fireEvent.input(textarea, { target: { value: specialText } });

    expect(textarea).toHaveValue(specialText);
    expect(mockOnChange).toHaveBeenCalledWith(specialText);
  });

  it('handles very long text input', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const longText = 'A'.repeat(1000);
    fireEvent.input(textarea, { target: { value: longText } });

    expect(textarea).toHaveValue(longText);
    expect(mockOnChange).toHaveBeenCalledWith(longText);
  });

  it('displays validation error when isInvalid is true', () => {
    render(
      <PaymentTextInput onChange={mockOnChange} isInvalid={true} />
    );

    expect(screen.getByText('Payment text is required')).toBeInTheDocument();
  });

  it('accepts controlled value prop', () => {
    const { rerender } = render(
      <PaymentTextInput value="Initial value" onChange={mockOnChange} />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toHaveValue('Initial value');

    rerender(
      <PaymentTextInput value="Updated value" onChange={mockOnChange} />
    );

    expect(textarea).toHaveValue('Updated value');
  });

  it('disables textarea when disabled prop is true', () => {
    render(<PaymentTextInput disabled={true} onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
  });


  it('allows interaction when disabled prop is false', () => {
    render(<PaymentTextInput disabled={false} onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).not.toBeDisabled();

    fireEvent.input(textarea, { target: { value: 'test' } });
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });
});