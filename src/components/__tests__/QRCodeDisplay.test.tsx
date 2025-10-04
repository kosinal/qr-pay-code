import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QRCodeDisplay } from '../QRCodeDisplay';
import * as useIsMobileModule from '../../hooks/useIsMobile';
import * as useQRCodeShareModule from '../../hooks/useQRCodeShare';

vi.mock('../../hooks/useIsMobile');
vi.mock('../../hooks/useQRCodeShare');

describe('QRCodeDisplay Component', () => {
  beforeEach(() => {
    // Default mock implementations
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false);
    vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
      state: { isSharing: false, error: null, lastResult: null },
      canShare: true,
      shareQRCode: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });
  });

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

  it('renders QR code with constant_symbol in SPAYD string', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890*AM:500.00*CC:CZK*X-KS:3558';
    render(<QRCodeDisplay spaydString={spaydString} />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('aria-label', spaydString);
  });

  it('renders QR code with both variable_symbol and constant_symbol in SPAYD string', () => {
    const spaydString =
      'SPD*1.0*ACC:CZ0708000000001234567890*AM:1500.00*CC:CZK*X-VS:12345*X-KS:3558';
    render(<QRCodeDisplay spaydString={spaydString} />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('aria-label', spaydString);
  });

  it('renders QR code without constant_symbol when not provided', () => {
    const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890*AM:750.00*CC:CZK';
    render(<QRCodeDisplay spaydString={spaydString} />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('aria-label', spaydString);
    expect(qrCode.getAttribute('aria-label')).not.toContain('X-KS');
  });

  describe('Mobile Share Functionality', () => {
    it('does not show share button on desktop', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false);

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      const shareButton = screen.queryByTestId('qr-share-button');
      expect(shareButton).not.toBeInTheDocument();
    });

    it('shows share button on mobile when Web Share is supported', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: false, error: null, lastResult: null },
        canShare: true,
        shareQRCode: vi.fn(),
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      const shareButton = screen.getByTestId('qr-share-button');
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveTextContent('Share to Banking App');
    });

    it('shows download button on mobile when Web Share is not supported', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: false, error: null, lastResult: null },
        canShare: false,
        shareQRCode: vi.fn(),
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      const shareButton = screen.getByTestId('qr-share-button');
      expect(shareButton).toHaveTextContent('Download QR Code');
    });

    it('disables button and shows processing state while sharing', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: true, error: null, lastResult: null },
        canShare: true,
        shareQRCode: vi.fn(),
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      const shareButton = screen.getByTestId('qr-share-button');
      expect(shareButton).toBeDisabled();
      expect(shareButton).toHaveTextContent('Processing...');
    });

    it('calls shareQRCode with SVG element when button is clicked', async () => {
      const mockShareQRCode = vi.fn();
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: false, error: null, lastResult: null },
        canShare: true,
        shareQRCode: mockShareQRCode,
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      const shareButton = screen.getByTestId('qr-share-button');
      shareButton.click();

      expect(mockShareQRCode).toHaveBeenCalled();
      const svgArg = mockShareQRCode.mock.calls[0][0];
      expect(svgArg).toBeInstanceOf(SVGElement);
      expect(svgArg.tagName).toBe('svg');
    });

    it('shows error message when sharing fails', () => {
      const errorMessage = 'Failed to share QR code';
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: false, error: errorMessage, lastResult: null },
        canShare: true,
        shareQRCode: vi.fn(),
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not show success/error messages when lastResult is cancelled', () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true);
      vi.spyOn(useQRCodeShareModule, 'useQRCodeShare').mockReturnValue({
        state: { isSharing: false, error: null, lastResult: 'cancelled' },
        canShare: true,
        shareQRCode: vi.fn(),
        clearError: vi.fn(),
        reset: vi.fn(),
      });

      const spaydString = 'SPD*1.0*ACC:CZ0708000000001234567890';
      render(<QRCodeDisplay spaydString={spaydString} />);

      expect(screen.queryByText(/shared successfully/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/downloaded/i)).not.toBeInTheDocument();
    });
  });
});
