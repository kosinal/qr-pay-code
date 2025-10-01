import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleLayout } from './components/SimpleLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './theme.css';
import './app.css';

const PaymentApp: React.FC = () => {

  return (
    <div className="payment-app">
      <h1>QR Code Payment Generator</h1>
      <p>Enter payment information in the text area below:</p>
      <SimpleLayout />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <PaymentApp />
  </React.StrictMode>
);