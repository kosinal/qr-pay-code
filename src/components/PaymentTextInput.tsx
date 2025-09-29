import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Form, Button } from 'react-bootstrap';

interface PaymentTextInputProps {
  onPaymentTextChange: (text: string) => void;
}

export const PaymentTextInput: React.FC<PaymentTextInputProps> = ({ onPaymentTextChange }) => {
  const [paymentText, setPaymentText] = useState('');

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPaymentText(value);
    onPaymentTextChange(value || '');
  };

  const handleClear = () => {
    setPaymentText('');
    onPaymentTextChange('');
  };

  return (
    <Form.Group className="payment-text-input">
      <Form.Control
        as="textarea"
        value={paymentText}
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
      />
      <div className="d-flex justify-content-between align-items-center mt-2">
        <Button
          variant="outline-secondary"
          onClick={handleClear}
          disabled={!paymentText}
        >
          Clear
        </Button>
        <span className="text-muted">
          {paymentText.length} characters
        </span>
      </div>
    </Form.Group>
  );
};