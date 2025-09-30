import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';

export const SimpleLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = () => {
    if (!apiKey || !paymentText) {
      setShowValidation(true);
      return;
    }

    console.log(paymentText);
    setShowValidation(false);
  };

  return (
    <Container className="simple-layout py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <ApiKeyInput
                placeholder="Enter your OpenAI API key"
                onApiKeyChange={(key) => {
                  setApiKey(key);
                  console.log('API Key updated:', key ? '***' : 'cleared');
                }}
                className="mb-4"
                isInvalid={showValidation && !apiKey}
              />
              <PaymentTextInput
                value={paymentText}
                onChange={setPaymentText}
                isInvalid={showValidation && !paymentText}
              />
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};