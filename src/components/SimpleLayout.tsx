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
            <Card.Body>
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