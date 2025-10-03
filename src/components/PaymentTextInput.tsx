import React, { useState, type ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

interface PaymentTextInputProps {
  value?: string;
  onChange?: (text: string) => void;
  isInvalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PaymentTextInput: React.FC<PaymentTextInputProps> = ({
  value: externalValue,
  onChange,
  isInvalid = false,
  disabled = false,
  className = '',
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

  return (
    <Form.Group className={`payment-text-input ${className}`}>
      <Form.Control
        as="textarea"
        value={value}
        onChange={handleTextChange}
        placeholder={`Enter payment information here...`}
        rows={8}
        className="payment-textarea"
        isInvalid={isInvalid}
        disabled={disabled}
      />
      {isInvalid && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          Payment text is required
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};
