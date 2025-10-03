import React, { useRef, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { BsFileImage, BsCamera } from 'react-icons/bs';
import { useIsMobile } from '../hooks/useIsMobile';
import './ImageInput.css';

interface ImageInputProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  onImageSelect,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onImageSelect(file);
  };

  const handleClearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <Form.Group className={`image-input ${className}`}>
      <Form.Label>Upload Payment Document Image (Optional)</Form.Label>

      {preview && (
        <Card className="image-preview-card mb-3">
          <Card.Body className="p-2">
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearImage}
              disabled={disabled}
              className="mt-2 w-100"
            >
              Clear Image
            </Button>
          </Card.Body>
        </Card>
      )}

      {!preview && (
        <div className="image-input-buttons">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />

          <Button
            variant="outline-secondary"
            onClick={handleUploadClick}
            disabled={disabled}
            className={isMobile ? 'me-2' : ''}
          >
            <BsFileImage className="me-1" />
            Upload Image
          </Button>

          {isMobile && (
            <Button variant="outline-secondary" onClick={handleCameraClick} disabled={disabled}>
              <BsCamera className="me-1" />
              Take Photo
            </Button>
          )}
        </div>
      )}

      <Form.Text className="text-muted d-block mt-2">
        Upload or capture an image of your payment document. We&apos;ll extract the text
        automatically.
      </Form.Text>
    </Form.Group>
  );
};
