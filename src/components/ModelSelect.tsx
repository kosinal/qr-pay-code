import React from 'react';
import { Form } from 'react-bootstrap';

export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash';

interface ModelSelectProps {
  value?: GeminiModel;
  onChange?: (model: GeminiModel) => void;
  className?: string;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({
  value = 'gemini-2.5-pro',
  onChange,
  className = ''
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value as GeminiModel);
  };

  return (
    <Form.Group className={`model-select ${className}`}>
      <Form.Label htmlFor="model-select">
        Gemini Model
      </Form.Label>
      <Form.Select
        id="model-select"
        value={value}
        onChange={handleChange}
        aria-label="Select Gemini model"
      >
        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
      </Form.Select>
    </Form.Group>
  );
};