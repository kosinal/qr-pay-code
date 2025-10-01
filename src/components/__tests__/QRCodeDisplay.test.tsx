import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QRCodeDisplay } from '../QRCodeDisplay';

describe('QRCodeDisplay Component', () => {
  it('renders nothing when spaydString is null', () => {
    const { container } = render(<QRCodeDisplay spaydString={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when spaydString is empty', () => {
    const { container } = render(<QRCodeDisplay spaydString="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders QR code when spaydString is provided', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890*AM:500.00*CC:CZK';
    render(<QRCodeDisplay spaydString={spaydString} />);

    expect(screen.getByText('Payment QR Code')).toBeInTheDocument();
    expect(screen.getByText('Scan this QR code to make the payment')).toBeInTheDocument();
  });

  it('renders QR code SVG element', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890*AM:500.00*CC:CZK';
    render(<QRCodeDisplay spaydString={spaydString} />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode.tagName).toBe('svg');
  });

  it('applies custom className', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
    const { container } = render(
      <QRCodeDisplay spaydString={spaydString} className="custom-class" />
    );

    const qrCodeDisplay = container.querySelector('.qr-code-display.custom-class');
    expect(qrCodeDisplay).toBeInTheDocument();
  });

  it('renders with Bootstrap Card structure', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
    const { container } = render(<QRCodeDisplay spaydString={spaydString} />);

    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-body')).toBeInTheDocument();
    expect(container.querySelector('.card-title')).toBeInTheDocument();
  });

  it('centers the QR code content', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
    const { container } = render(<QRCodeDisplay spaydString={spaydString} />);

    const cardBody = container.querySelector('.card-body');
    expect(cardBody).toHaveClass('text-center');
  });

  it('renders with different SPAYD strings', () => {
    const spaydString1 = 'SPD*1.0*ACC:CZ0708000000001234567890*AM:1000.00';
    const { rerender } = render(<QRCodeDisplay spaydString={spaydString1} />);

    let qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();

    const spaydString2 = 'SPD*1.0*ACC:CZ4108001234560000007890*AM:250.50';
    rerender(<QRCodeDisplay spaydString={spaydString2} />);

    qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
    render(<QRCodeDisplay spaydString={spaydString} />);

    const title = screen.getByText('Payment QR Code');
    expect(title).toBeInTheDocument();

    const description = screen.getByText('Scan this QR code to make the payment');
    expect(description).toBeInTheDocument();
  });
});
