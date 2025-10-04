import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Copyright } from '../Copyright';
import packageJson from '../../../package.json';

describe('Copyright Component', () => {
  it('renders copyright symbol and author name', () => {
    render(<Copyright />);
    expect(screen.getByText(/© .* Lukas Kosina/)).toBeInTheDocument();
  });

  it('displays current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Copyright />);
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('displays version from package.json', () => {
    render(<Copyright />);
    expect(screen.getByText(new RegExp(`v${packageJson.version}`))).toBeInTheDocument();
  });

  it('displays correct format with all elements', () => {
    const currentYear = new Date().getFullYear();
    render(<Copyright />);
    expect(
      screen.getByText(`© ${currentYear} Lukas Kosina · v${packageJson.version}`)
    ).toBeInTheDocument();
  });

  it('applies copyright className', () => {
    const { container } = render(<Copyright />);
    expect(container.querySelector('.copyright')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Copyright />);
    const copyrightDiv = container.querySelector('.copyright');
    expect(copyrightDiv?.tagName).toBe('DIV');
  });

  it('uses current year from Date object', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));

    const { rerender } = render(<Copyright />);
    expect(screen.getByText(/© 2024/)).toBeInTheDocument();

    vi.setSystemTime(new Date('2025-03-20'));
    rerender(<Copyright />);
    expect(screen.getByText(/© 2025/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('contains middot separator between author and version', () => {
    render(<Copyright />);
    expect(screen.getByText(/·/)).toBeInTheDocument();
  });

  it('renders version number with v prefix', () => {
    render(<Copyright />);
    const text = screen.getByText(/v\d+\.\d+\.\d+/);
    expect(text).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<Copyright />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
