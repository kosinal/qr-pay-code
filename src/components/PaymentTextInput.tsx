import { useState } from 'preact/hooks';

interface PaymentTextInputProps {
  onPaymentTextChange: (text: string) => void;
}

export function PaymentTextInput({ onPaymentTextChange }: PaymentTextInputProps) {
  const [paymentText, setPaymentText] = useState('');

  const handleTextChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    setPaymentText(value);
    onPaymentTextChange(value);
  };

  const handleClear = () => {
    setPaymentText('');
    onPaymentTextChange('');
  };

  return (
    <div className="payment-text-input">
      <textarea
        value={paymentText}
        onInput={handleTextChange}
        placeholder="Enter payment information here...&#10;&#10;Example format:&#10;Amount: 50.00&#10;Currency: EUR&#10;Recipient: John Doe&#10;Description: Payment for services&#10;Reference: INV-001"
        rows={8}
        cols={50}
        className="payment-textarea"
      />
      <div className="text-actions">
        <button
          type="button"
          onClick={handleClear}
          className="clear-button"
          disabled={!paymentText}
        >
          Clear
        </button>
        <span className="text-counter">
          {paymentText.length} characters
        </span>
      </div>
    </div>
  );
}