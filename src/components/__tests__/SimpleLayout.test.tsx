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

  describe('IBAN Generation with Branch Code', () => {
    it('generates correct IBAN for account with branch code', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '123456-7890',
          bank_code: '0800',
          amount: 1000,
          currency: 'CZK',
          message: 'Test payment',
          payment_date: null,
          variable_symbol: null
        }
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
        const ibanCalls = consoleSpy.mock.calls.filter(call =>
          call[0] === 'Generated IBAN:' && typeof call[1] === 'string'
        );
        expect(ibanCalls.length).toBeGreaterThan(0);
        const generatedIban = ibanCalls[0][1];
        expect(generatedIban).toContain('1234560000007890');
      });

      consoleSpy.mockRestore();
    });

    it('generates correct IBAN for account without branch code', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '1234567890',
          bank_code: '0800',
          amount: 500,
          currency: 'CZK',
          message: null,
          payment_date: null,
          variable_symbol: null
        }
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
        const ibanCalls = consoleSpy.mock.calls.filter(call =>
          call[0] === 'Generated IBAN:' && typeof call[1] === 'string'
        );
        expect(ibanCalls.length).toBeGreaterThan(0);
        const generatedIban = ibanCalls[0][1];
        expect(generatedIban).toContain('0000001234567890');
      });

      consoleSpy.mockRestore();
    });

    it('generates correct IBAN for short account with branch code', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '123-45',
          bank_code: '0800',
          amount: 250,
          currency: 'CZK',
          message: 'Short account test',
          payment_date: null,
          variable_symbol: 12345
        }
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
        const ibanCalls = consoleSpy.mock.calls.filter(call =>
          call[0] === 'Generated IBAN:' && typeof call[1] === 'string'
        );
        expect(ibanCalls.length).toBeGreaterThan(0);
        const generatedIban = ibanCalls[0][1];
        expect(generatedIban).toContain('0001230000000045');
      });

      consoleSpy.mockRestore();
    });

    it('handles minimal branch code correctly', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '1-999',
          bank_code: '0800',
          amount: 100,
          currency: 'CZK',
          message: null,
          payment_date: null,
          variable_symbol: null
        }
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
        const ibanCalls = consoleSpy.mock.calls.filter(call =>
          call[0] === 'Generated IBAN:' && typeof call[1] === 'string'
        );
        expect(ibanCalls.length).toBeGreaterThan(0);
        const generatedIban = ibanCalls[0][1];
        expect(generatedIban).toContain('0000010000000999');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component Disabled State During Loading', () => {
    it('disables all input components when isLoading is true', async () => {
      const mockGenerateContent = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ text: 'Response' }), 100))
      );

      vi.mocked(geminiService.createGeminiService).mockReturnValue({
        generateContent: mockGenerateContent
      } as any);

      render(<SimpleLayout />);

      const apiKeyInput = screen.getByLabelText('API Key') as HTMLInputElement;
      const modelSelect = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Initially all components should be enabled
      expect(apiKeyInput).not.toBeDisabled();
      expect(modelSelect).not.toBeDisabled();
      expect(textarea).not.toBeDisabled();

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(textarea, { target: { value: 'Test payment text' } });
      fireEvent.click(submitButton);

      // During loading, all components should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
      });

      expect(apiKeyInput).toBeDisabled();
      expect(modelSelect).toBeDisabled();
      expect(textarea).toBeDisabled();

      // After loading completes, components should be enabled again
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });

      expect(apiKeyInput).not.toBeDisabled();
      expect(modelSelect).not.toBeDisabled();
      expect(textarea).not.toBeDisabled();
    });

    it('disables ApiKeyInput buttons when isLoading is true', async () => {
      const mockGenerateContent = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ text: 'Response' }), 100))
      );

      vi.mocked(geminiService.createGeminiService).mockReturnValue({
        generateContent: mockGenerateContent
      } as any);

      render(<SimpleLayout />);

      const apiKeyInput = screen.getByLabelText('API Key') as HTMLInputElement;
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(textarea, { target: { value: 'Test payment text' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
      });

      const showButton = screen.getByRole('button', { name: /show api key/i });
      const clearButton = screen.getByRole('button', { name: /clear api key/i });

      expect(showButton).toBeDisabled();
      expect(clearButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });
    });

    it('disables PaymentTextInput clear button when isLoading is true', async () => {
      const mockGenerateContent = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ text: 'Response' }), 100))
      );

      vi.mocked(geminiService.createGeminiService).mockReturnValue({
        generateContent: mockGenerateContent
      } as any);

      render(<SimpleLayout />);

      const apiKeyInput = screen.getByLabelText('API Key') as HTMLInputElement;
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(textarea, { target: { value: 'Test payment text' } });

      const clearButton = screen.getByRole('button', { name: 'Clear' });
      expect(clearButton).not.toBeDisabled();

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
      });

      expect(clearButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });
    });
  });

  describe('QR Code Display Integration', () => {
    it('does not show QR code initially', () => {
      render(<SimpleLayout />);

      const qrCode = screen.queryByTestId('qr-code');
      expect(qrCode).not.toBeInTheDocument();
    });

    it('displays QR code after successful SPAYD generation', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '1234567890',
          bank_code: '0800',
          amount: 500,
          currency: 'CZK',
          message: null,
          payment_date: null,
          variable_symbol: null
        }
      });

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

      await waitFor(() => {
        const qrCode = screen.queryByTestId('qr-code');
        expect(qrCode).toBeInTheDocument();
      });

      expect(screen.getByText('Payment QR Code')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code to make the payment')).toBeInTheDocument();
    });

    it('QR code component is rendered in layout', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: 'Gemini API response',
        paymentData: {
          account_number: '1234567890',
          bank_code: '0800',
          amount: 500,
          currency: 'CZK',
          message: null,
          payment_date: null,
          variable_symbol: null
        }
      });

      vi.mocked(geminiService.createGeminiService).mockReturnValue({
        generateContent: mockGenerateContent
      } as any);

      const { container } = render(<SimpleLayout />);

      const apiKeyInput = screen.getByLabelText('API Key');
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
      fireEvent.change(textarea, { target: { value: 'Test payment text' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const qrCode = screen.queryByTestId('qr-code');
        expect(qrCode).toBeInTheDocument();
      });

      const qrCodeDisplay = container.querySelector('.qr-code-display');
      expect(qrCodeDisplay).toBeInTheDocument();
      expect(screen.getByText('Payment QR Code')).toBeInTheDocument();
    });
  });
});