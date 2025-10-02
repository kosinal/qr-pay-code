import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleLayout } from './components/SimpleLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './theme.css';

const PaymentApp: React.FC = () => {

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="w-100" style={{ maxWidth: '800px' }}>
        <SimpleLayout />
      </div>
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