import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('QR Code Payment Generator')).toBeInTheDocument();
  });

  it('renders SimpleLayout component', () => {
    render(<App />);
    expect(screen.getByText('QR Code Payment Generator')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders Copyright component', () => {
    render(<App />);
    // Copyright renders with author name and version
    const copyrightText = screen.getByText(/Lukas Kosina/);
    expect(copyrightText).toBeInTheDocument();
  });

  it('has correct container structure', () => {
    const { container } = render(<App />);
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass('d-flex', 'justify-content-center', 'align-items-center');
  });

  it('has correct max-width styling', () => {
    const { container } = render(<App />);
    const widthDiv = container.querySelector('.w-100');
    expect(widthDiv).toBeInTheDocument();
    expect(widthDiv).toHaveStyle({ maxWidth: '800px' });
  });
});
