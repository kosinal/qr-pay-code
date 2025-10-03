import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from 'react-bootstrap';

interface QRCodeDisplayProps {
  spaydString: string | null;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ spaydString, className = '' }) => {
  if (!spaydString) {
    return null;
  }

  return (
    <Card className={`qr-code-display ${className}`}>
      <Card.Body className="text-center">
        <Card.Title>Payment QR Code</Card.Title>
        <div className="qr-code-container" style={{ padding: '20px' }}>
          <QRCodeSVG
            value={spaydString}
            size={256}
            level="M"
            marginSize={4}
            data-testid="qr-code"
          />
        </div>
        <Card.Text className="text-muted small">Scan this QR code to make the payment</Card.Text>
      </Card.Body>
    </Card>
  );
};
