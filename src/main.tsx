import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleLayout } from './components/SimpleLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './theme.css';

const PaymentApp: React.FC = () => {

  return (
    <div className="payment-app">
      <h1>QR Code Payment Generator</h1>
      <span style={{ marginBottom: '0.5rem', display: 'block' }}>Enter payment information in the text area below:</span>
      <SimpleLayout />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <PaymentApp />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}