import { PaymentTextInput } from './PaymentTextInput';

interface SimpleLayoutProps {
  onPaymentTextChange: (text: string) => void;
}

export function SimpleLayout({ onPaymentTextChange }: SimpleLayoutProps) {
  return (
    <div className="simple-layout">
      <main className="main-content">
        <div className="input-container">
          <h1>Payment Information Input</h1>
          <p className="description">
            Enter your payment information in the text area below.
            Include details like amount, currency, recipient, and description.
          </p>
          <PaymentTextInput onPaymentTextChange={onPaymentTextChange} />
        </div>
      </main>
    </div>
  );
}