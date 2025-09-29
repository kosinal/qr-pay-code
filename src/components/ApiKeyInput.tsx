import { useState, useEffect } from 'preact/hooks';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '../utils/localStorage';

interface ApiKeyInputProps {
  onApiKeyChange?: (apiKey: string) => void;
  placeholder?: string;
  className?: string;
}

export const ApiKeyInput = ({
  onApiKeyChange,
  placeholder = "Enter your API key",
  className = ""
}: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const STORAGE_KEY = 'qr-pay-api-key';

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange?.(storedKey);
    }
  }, []);

  const handleApiKeyChange = (event: Event) => {
    if (event.target && event.target instanceof HTMLInputElement) {
      const newKey = event.target.value;
      setApiKey(newKey);
      localStorage.setItem(STORAGE_KEY, newKey);
      onApiKeyChange?.(newKey);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEY);
    onApiKeyChange?.('');
  };

  return (
    <div class={`api-key-input ${className}`}>
      <label htmlFor="api-key-input" class="api-key-label">
        API Key
      </label>
      <div class="api-key-input-container">
        <input
          id="api-key-input"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={placeholder}
          class="api-key-input-field"
          aria-label="API Key"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          class="api-key-toggle-btn"
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? '👁️' : '👁‍️'}
        </button>
        {apiKey && (
          <button
            type="button"
            onClick={clearApiKey}
            class="api-key-clear-btn"
            aria-label="Clear API key"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  );
};