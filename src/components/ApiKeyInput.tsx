import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

interface ApiKeyInputProps {
  onApiKeyChange?: (apiKey: string) => void;
  placeholder?: string;
  className?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeyChange,
  placeholder = "Enter your API key",
  className = ""
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const STORAGE_KEY = 'qr-pay-api-key';

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange?.(storedKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newKey = event.target.value;
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem(STORAGE_KEY, newKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    onApiKeyChange?.(newKey);
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEY);
    onApiKeyChange?.('');
  };

  return (
    <Form.Group className={`api-key-input ${className}`}>
      <Form.Label htmlFor="api-key-input" className="api-key-label">
        API Key
      </Form.Label>
      <InputGroup>
        <Form.Control
          id="api-key-input"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={placeholder}
          className="api-key-input-field"
          aria-label="API Key"
        />
        <Button
          variant="outline-secondary"
          onClick={() => setShowKey(!showKey)}
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? '👁️' : '👁‍️'}
        </Button>
        {apiKey && (
          <Button
            variant="outline-danger"
            onClick={clearApiKey}
            aria-label="Clear API key"
          >
            ❌
          </Button>
        )}
      </InputGroup>
    </Form.Group>
  );
};