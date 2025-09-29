import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';

interface SimpleLayoutProps {
  onPaymentTextChange: (text: string) => void;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ onPaymentTextChange }) => {
  return (
    <Container className="simple-layout py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h1 className="h4 mb-0">Payment Information Input</h1>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-4">
                Enter your payment information in the text area below.
                Include details like amount, currency, recipient, and description.
              </p>

              <ApiKeyInput
                placeholder="Enter your OpenAI API key"
                onApiKeyChange={(apiKey) => console.log('API Key updated:', apiKey ? '***' : 'cleared')}
                className="mb-4"
              />

              <PaymentTextInput onPaymentTextChange={onPaymentTextChange} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};