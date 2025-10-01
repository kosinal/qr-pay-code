import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Form, Button } from 'react-bootstrap';

interface PaymentTextInputProps {
  value?: string;
  onChange?: (text: string) => void;
  isInvalid?: boolean;
  disabled?: boolean;
}

export const PaymentTextInput: React.FC<PaymentTextInputProps> = ({
  value: externalValue,
  onChange,
  isInvalid = false,
  disabled = false
}) => {
  const [paymentText, setPaymentText] = useState('');
  const value = externalValue !== undefined ? externalValue : paymentText;

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (externalValue === undefined) {
      setPaymentText(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (externalValue === undefined) {
      setPaymentText('');
    }
    onChange?.('');
  };

  return (
    <Form.Group className="payment-text-input">
      <Form.Control
        as="textarea"
        value={value}
        onChange={handleTextChange}
        placeholder={`Enter payment information here...

Example format:
Amount: 50.00
Currency: EUR
Recipient: John Doe
Description: Payment for services
Reference: INV-001`}
        rows={8}
        className="payment-textarea"
        isInvalid={isInvalid}
        disabled={disabled}
      />
      <div className="d-flex justify-content-between align-items-center mt-2">
        <Button
          variant="outline-secondary"
          onClick={handleClear}
          disabled={!value || disabled}
        >
          Clear
        </Button>
        <span className="text-muted">
          {value.length} characters
        </span>
      </div>
      {isInvalid && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          Payment text is required
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};