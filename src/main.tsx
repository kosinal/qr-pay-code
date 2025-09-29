import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleLayout } from './components/SimpleLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Display the payment input component
const PaymentApp: React.FC = () => {
  const handlePaymentTextChange = (paymentString: string) => {
    console.log('Payment text changed:', paymentString);
    // Here you can process the payment string for QR code generation
  };

  return (
    <div className="payment-app">
      <h1>QR Code Payment Generator</h1>
      <p>Enter payment information in the text area below:</p>
      <SimpleLayout onPaymentTextChange={handlePaymentTextChange} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <PaymentApp />
  </React.StrictMode>
);