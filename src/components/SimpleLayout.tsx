import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';
import { createGeminiService } from '../utils/geminiService';

export const SimpleLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey || !paymentText) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setIsLoading(true);

    try {
      const geminiService = createGeminiService(apiKey);
      const response = await geminiService.generateContent(paymentText);

      if (response.error) {
        console.error('Gemini API Error:', response.error);
      } else {
        console.log('Gemini API Response:', response.text);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Submit'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};