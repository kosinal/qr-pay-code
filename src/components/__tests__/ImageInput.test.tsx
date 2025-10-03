import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageInput } from '../ImageInput';

// Mock the useIsMobile hook
vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}));

import { useIsMobile } from '../../hooks/useIsMobile';

describe('ImageInput Component', () => {
  const mockOnImageSelect = vi.fn();
  const mockUseIsMobile = vi.mocked(useIsMobile);

  beforeEach(() => {
    mockOnImageSelect.mockClear();
    mockUseIsMobile.mockReturnValue(false); // Default to desktop
  });

  describe('Mobile Device Behavior', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true); // Set to mobile
    });

    it('shows both Upload Image and Take Photo buttons on mobile', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      expect(screen.getByText('Upload Image')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
    });

    it('Take Photo button is clickable on mobile', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const takePhotoButton = screen.getByText('Take Photo');
      expect(takePhotoButton).not.toBeDisabled();

      fireEvent.click(takePhotoButton);
      // Button should trigger the hidden camera input click
      // This is tested through the hidden input functionality
    });

    it('shows camera icon in Take Photo button', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const takePhotoButton = screen.getByText('Take Photo');
      const icon = takePhotoButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });
  });

  describe('Desktop Device Behavior', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false); // Set to desktop
    });

    it('shows only Upload Image button on desktop', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      expect(screen.getByText('Upload Image')).toBeInTheDocument();
      expect(screen.queryByText('Take Photo')).not.toBeInTheDocument();
    });

    it('Upload Image button works on desktop', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const uploadButton = screen.getByText('Upload Image');
      expect(uploadButton).not.toBeDisabled();
    });
  });

  describe('Common Behavior Across Devices', () => {
    it('displays the label correctly', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      expect(screen.getByText('Upload Payment Document Image (Optional)')).toBeInTheDocument();
    });

    it('displays help text correctly', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} />);

      expect(
        screen.getByText(/Upload or capture an image of your payment document/i)
      ).toBeInTheDocument();
    });

    it('Upload Image button is always visible regardless of device', () => {
      const { rerender } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      // Desktop
      mockUseIsMobile.mockReturnValue(false);
      rerender(<ImageInput onImageSelect={mockOnImageSelect} />);
      expect(screen.getByText('Upload Image')).toBeInTheDocument();

      // Mobile
      mockUseIsMobile.mockReturnValue(true);
      rerender(<ImageInput onImageSelect={mockOnImageSelect} />);
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });
  });

  describe('Image Preview and Clear', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it('hides upload buttons when image is previewed', async () => {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.queryByText('Upload Image')).not.toBeInTheDocument();
        expect(screen.queryByText('Take Photo')).not.toBeInTheDocument();
      });
    });

    it('shows Clear Image button when image is previewed', async () => {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('Clear Image')).toBeInTheDocument();
      });
    });

    it('restores upload buttons after clearing image', async () => {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      const clearButton = await waitFor(() => screen.getByText('Clear Image'));
      fireEvent.click(clearButton);

      expect(screen.getByText('Upload Image')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
    });

    it('calls onImageSelect when image file is selected', () => {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(mockOnImageSelect).toHaveBeenCalledWith(file);
      expect(mockOnImageSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onImageSelect for non-image files', () => {
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(mockOnImageSelect).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables Upload Image button when disabled prop is true', () => {
      render(<ImageInput onImageSelect={mockOnImageSelect} disabled={true} />);

      const uploadButton = screen.getByText('Upload Image');
      expect(uploadButton).toBeDisabled();
    });

    it('disables Take Photo button on mobile when disabled prop is true', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<ImageInput onImageSelect={mockOnImageSelect} disabled={true} />);

      const takePhotoButton = screen.getByText('Take Photo');
      expect(takePhotoButton).toBeDisabled();
    });

    it('disables Clear Image button when disabled prop is true', async () => {
      mockUseIsMobile.mockReturnValue(true);
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const { container } = render(
        <ImageInput onImageSelect={mockOnImageSelect} disabled={true} />
      );

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      ) as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      const clearButton = await waitFor(() => screen.getByText('Clear Image'));
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to the component', () => {
      const { container } = render(
        <ImageInput onImageSelect={mockOnImageSelect} className="custom-class" />
      );

      const formGroup = container.querySelector('.image-input.custom-class');
      expect(formGroup).toBeInTheDocument();
    });
  });

  describe('Hidden File Inputs', () => {
    it('has hidden file input for upload', () => {
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const fileInput = container.querySelector(
        'input[type="file"][accept="image/*"]:not([capture])'
      );
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveStyle({ display: 'none' });
    });

    it('has hidden camera input with capture attribute on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);
      const { container } = render(<ImageInput onImageSelect={mockOnImageSelect} />);

      const cameraInput = container.querySelector(
        'input[type="file"][accept="image/*"][capture="environment"]'
      );
      expect(cameraInput).toBeInTheDocument();
      expect(cameraInput).toHaveStyle({ display: 'none' });
    });
  });
});
