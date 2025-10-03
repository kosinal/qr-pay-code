import React from 'react';
import { Spinner } from 'react-bootstrap';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner animation="border" role="status" className="loading-spinner" />
        <div className="loading-text">{message}</div>
      </div>
    </div>
  );
};
