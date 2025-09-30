import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleLayout } from '../SimpleLayout';
import * as geminiService from '../../utils/geminiService';

vi.mock('../../utils/geminiService', () => ({
  createGeminiService: vi.fn()
}));

describe('SimpleLayout Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the PaymentTextInput, ApiKeyInput, and ModelSelect components', () => {
    render(<SimpleLayout />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Gemini Model')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<SimpleLayout />);

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('has proper Bootstrap container structure', () => {
    const { container } = render(<SimpleLayout />);

    const containerDiv = container.querySelector('.simple-layout.container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('has Bootstrap card structure', () => {
    const { container } = render(<SimpleLayout />);

    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('renders textarea with correct initial state', () => {
    render(<SimpleLayout />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('maintains proper accessibility', () => {
    render(<SimpleLayout />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Gemini Model')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty fields', () => {
    render(<SimpleLayout />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    expect(screen.getByText('API Key is required')).toBeInTheDocument();
    expect(screen.getByText('Payment text is required')).toBeInTheDocument();
  });

  it('calls Gemini API with default model and logs response when submitting with valid data', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: 'Gemini API response',
      error: undefined
    });

    vi.mocked(geminiService.createGeminiService).mockReturnValue({
      generateContent: mockGenerateContent
    } as any);

    const consoleSpy = vi.spyOn(console, 'log');
    render(<SimpleLayout />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
    fireEvent.change(textarea, { target: { value: 'Test payment text' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalledWith('Test payment text', 'gemini-2.5-pro');
      expect(consoleSpy).toHaveBeenCalledWith('Gemini API Response:', 'Gemini API response');
    });

    expect(screen.queryByText('API Key is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment text is required')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls Gemini API with selected model when model is changed', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: 'Gemini API response',
      error: undefined
    });

    vi.mocked(geminiService.createGeminiService).mockReturnValue({
      generateContent: mockGenerateContent
    } as any);

    const consoleSpy = vi.spyOn(console, 'log');
    render(<SimpleLayout />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const modelSelect = screen.getByLabelText('Gemini Model');
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
    fireEvent.change(modelSelect, { target: { value: 'gemini-2.5-flash' } });
    fireEvent.change(textarea, { target: { value: 'Test payment text' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalledWith('Test payment text', 'gemini-2.5-flash');
      expect(consoleSpy).toHaveBeenCalledWith('Gemini API Response:', 'Gemini API response');
    });

    consoleSpy.mockRestore();
  });

  it('shows loading state during API call', async () => {
    const mockGenerateContent = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ text: 'Response' }), 100))
    );

    vi.mocked(geminiService.createGeminiService).mockReturnValue({
      generateContent: mockGenerateContent
    } as any);

    render(<SimpleLayout />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
    fireEvent.change(textarea, { target: { value: 'Test payment text' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
    });
  });

  it('logs error when Gemini API returns error', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: '',
      error: 'API Error'
    });

    vi.mocked(geminiService.createGeminiService).mockReturnValue({
      generateContent: mockGenerateContent
    } as any);

    const consoleErrorSpy = vi.spyOn(console, 'error');
    render(<SimpleLayout />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
    fireEvent.change(textarea, { target: { value: 'Test payment text' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Gemini API Error:', 'API Error');
    });

    consoleErrorSpy.mockRestore();
  });

  it('does not show validation errors initially', () => {
    render(<SimpleLayout />);

    expect(screen.queryByText('API Key is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment text is required')).not.toBeInTheDocument();
  });
});