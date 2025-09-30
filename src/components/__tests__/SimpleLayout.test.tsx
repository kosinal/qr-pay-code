import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleLayout } from '../SimpleLayout';

describe('SimpleLayout Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the PaymentTextInput and ApiKeyInput components', () => {
    render(<SimpleLayout />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
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

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty fields', () => {
    render(<SimpleLayout />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    expect(screen.getByText('API Key is required')).toBeInTheDocument();
    expect(screen.getByText('Payment text is required')).toBeInTheDocument();
  });

  it('logs payment text when submitting with valid data', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<SimpleLayout />);

    const apiKeyInput = screen.getByLabelText('API Key');
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });
    fireEvent.change(textarea, { target: { value: 'Test payment text' } });
    fireEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Test payment text');
    expect(screen.queryByText('API Key is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment text is required')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not show validation errors initially', () => {
    render(<SimpleLayout />);

    expect(screen.queryByText('API Key is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment text is required')).not.toBeInTheDocument();
  });
});