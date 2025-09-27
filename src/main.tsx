import { render } from 'preact';
import { SimpleLayout } from './components/SimpleLayout';
import './index.css';

// Display the payment input component
const PaymentApp = () => {
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

render(<PaymentApp />, document.getElementById('app')!);