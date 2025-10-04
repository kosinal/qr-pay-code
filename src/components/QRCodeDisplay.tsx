import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, Button, Alert } from 'react-bootstrap';
import { BsShare, BsDownload } from 'react-icons/bs';
import { useIsMobile } from '../hooks/useIsMobile';
import { useQRCodeShare } from '../hooks/useQRCodeShare';

interface QRCodeDisplayProps {
  spaydString: string | null;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ spaydString, className = '' }) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { state, canShare, shareQRCode } = useQRCodeShare();

  if (!spaydString) {
    return null;
  }

  const handleShare = async () => {
    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (svgElement) {
      await shareQRCode(svgElement);
    }
  };

  return (
    <Card className={`qr-code-display ${className}`}>
      <Card.Body className="text-center">
        <Card.Title>Payment QR Code</Card.Title>
        <div className="qr-code-container" ref={qrContainerRef}>
          <QRCodeSVG
            value={spaydString}
            size={256}
            level="M"
            marginSize={4}
            data-testid="qr-code"
            aria-label={spaydString}
          />
        </div>
        <Card.Text className="text-muted small">Scan this QR code to make the payment</Card.Text>
      </Card.Body>
      {isMobile && (
        <Card.Body className="text-center">
          <Button
            variant="primary"
            size="sm"
            onClick={handleShare}
            disabled={state.isSharing}
            className="qr-share-button mt-2"
            data-testid="qr-share-button"
          >
            {state.isSharing ? (
              <>Processing...</>
            ) : (
              <>
                {canShare ? <BsShare className="me-1" /> : <BsDownload className="me-1" />}
                {canShare ? 'Share to Banking App' : 'Download QR Code'}
              </>
            )}
          </Button>

          {state.error && (
            <Alert variant="danger" className="mt-2 mb-0 text-start" dismissible>
              <small>{state.error}</small>
            </Alert>
          )}
        </Card.Body>
      )}
    </Card>
  );
};
