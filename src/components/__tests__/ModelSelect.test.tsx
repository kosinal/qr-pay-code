import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModelSelect } from '../ModelSelect';

describe('ModelSelect Component', () => {
  it('renders with default value', () => {
    render(<ModelSelect />);

    const select = screen.getByLabelText('Gemini Model');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('gemini-2.5-pro');
  });

  it('renders with provided value', () => {
    render(<ModelSelect value="gemini-2.5-flash" />);

    const select = screen.getByLabelText('Gemini Model');
    expect(select).toHaveValue('gemini-2.5-flash');
  });

  it('displays both model options', () => {
    render(<ModelSelect />);

    expect(screen.getByRole('option', { name: 'Gemini 2.5 Pro' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gemini 2.5 Flash' })).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<ModelSelect onChange={handleChange} />);

    const select = screen.getByLabelText('Gemini Model');
    fireEvent.change(select, { target: { value: 'gemini-2.5-flash' } });

    expect(handleChange).toHaveBeenCalledWith('gemini-2.5-flash');
  });

  it('has proper accessibility attributes', () => {
    render(<ModelSelect />);

    const select = screen.getByRole('combobox', { name: 'Select Gemini model' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select Gemini model');
  });

  it('applies custom className', () => {
    const { container } = render(<ModelSelect className="custom-class" />);

    const modelSelect = container.querySelector('.model-select.custom-class');
    expect(modelSelect).toBeInTheDocument();
  });

  it('maintains controlled component behavior', () => {
    const { rerender } = render(<ModelSelect value="gemini-2.5-pro" />);

    let select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
    expect(select.value).toBe('gemini-2.5-pro');

    rerender(<ModelSelect value="gemini-2.5-flash" />);

    select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
    expect(select.value).toBe('gemini-2.5-flash');
  });

  it('defaults to gemini-2.5-pro when no value provided', () => {
    render(<ModelSelect />);

    const select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
    expect(select.value).toBe('gemini-2.5-pro');
  });

  it('disables select when disabled prop is true', () => {
    render(<ModelSelect disabled={true} />);

    const select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
    expect(select).toBeDisabled();
  });

  it('allows interaction when disabled prop is false', () => {
    const handleChange = vi.fn();
    render(<ModelSelect disabled={false} onChange={handleChange} />);

    const select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;
    expect(select).not.toBeDisabled();

    fireEvent.change(select, { target: { value: 'gemini-2.5-flash' } });
    expect(handleChange).toHaveBeenCalledWith('gemini-2.5-flash');
  });

  it('prevents selection change when disabled', () => {
    const handleChange = vi.fn();
    render(<ModelSelect disabled={true} onChange={handleChange} />);

    const select = screen.getByLabelText('Gemini Model') as HTMLSelectElement;

    // Attempt to change value (should not work since disabled)
    fireEvent.change(select, { target: { value: 'gemini-2.5-flash' } });

    // onChange should not be called when disabled
    expect(handleChange).not.toHaveBeenCalled();
  });
});