import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ApiKeyInput } from '../ApiKeyInput';

describe('ApiKeyInput Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders correctly with default props', () => {
    render(<ApiKeyInput />);

    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your API key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show api key/i })).toBeInTheDocument();
  });

  it('initializes with empty input when no stored key exists', () => {
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('loads API key from localStorage on mount', () => {
    const storedKey = 'test-api-key-123';
    localStorage.setItem('qr-pay-api-key', storedKey);

    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input.value).toBe(storedKey);
  });

  it('updates API key and saves to localStorage', () => {
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    const newValue = 'new-api-key-456';

    fireEvent.change(input, { target: { value: newValue } });

    expect(input.value).toBe(newValue);
    expect(localStorage.getItem('qr-pay-api-key')).toBe(newValue);
  });

  it('calls onApiKeyChange callback when key changes', () => {
    const mockCallback = vi.fn();
    render(<ApiKeyInput onApiKeyChange={mockCallback} />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    const newValue = 'updated-key-789';

    fireEvent.change(input, { target: { value: newValue } });

    expect(mockCallback).toHaveBeenCalledWith(newValue);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('toggles between password and text input types', () => {
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show api key/i });

    expect(input.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
    expect(toggleButton).toBeInTheDocument();
  });

  it('clears API key and removes from localStorage', () => {
    const storedKey = 'stored-key-123';
    localStorage.setItem('qr-pay-api-key', storedKey);

    render(<ApiKeyInput />);

    const clearButton = screen.getByRole('button', { name: /clear api key/i });
    fireEvent.click(clearButton);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(localStorage.getItem('qr-pay-api-key')).toBeNull();
  });

  it('shows clear button only when key is present', () => {
    render(<ApiKeyInput />);

    expect(screen.queryByRole('button', { name: /clear api key/i })).not.toBeInTheDocument();

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test-key' } });

    expect(screen.getByRole('button', { name: /clear api key/i })).toBeInTheDocument();
  });

  it('accepts custom placeholder text', () => {
    const customPlaceholder = 'Enter your OpenAI API key';
    render(<ApiKeyInput placeholder={customPlaceholder} />);

    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'my-custom-class';
    const { container } = render(<ApiKeyInput className={customClass} />);

    const div = container.querySelector('.api-key-input');
    expect(div).toHaveClass(customClass);
  });

  it('handles multiple keystrokes correctly', () => {
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'key1' } });
    expect(input.value).toBe('key1');
    expect(localStorage.getItem('qr-pay-api-key')).toBe('key1');

    fireEvent.change(input, { target: { value: 'key2' } });
    expect(input.value).toBe('key2');
    expect(localStorage.getItem('qr-pay-api-key')).toBe('key2');
  });

  it('handles edge cases with empty strings', () => {
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });

    expect(input.value).toBe('');
    expect(localStorage.getItem('qr-pay-api-key')).toBeNull();
  });

  it('handles special characters in API key', () => {
    const specialCharsKey = 'sk-proj-!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(<ApiKeyInput />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: specialCharsKey } });

    expect(input.value).toBe(specialCharsKey);
    expect(localStorage.getItem('qr-pay-api-key')).toBe(specialCharsKey);
  });

  it('disables input field when disabled prop is true', () => {
    render(<ApiKeyInput disabled={true} />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('disables show/hide button when disabled prop is true', () => {
    render(<ApiKeyInput disabled={true} />);

    const toggleButton = screen.getByRole('button', { name: /show api key/i });
    expect(toggleButton).toBeDisabled();
  });

  it('disables clear button when disabled prop is true', () => {
    localStorage.setItem('qr-pay-api-key', 'test-key');
    render(<ApiKeyInput disabled={true} />);

    const clearButton = screen.getByRole('button', { name: /clear api key/i });
    expect(clearButton).toBeDisabled();
  });

  it('allows interaction when disabled prop is false', () => {
    render(<ApiKeyInput disabled={false} />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show api key/i });

    expect(input).not.toBeDisabled();
    expect(toggleButton).not.toBeDisabled();

    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
  });
});
