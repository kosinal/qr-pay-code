import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelect, type GeminiModel } from './ModelSelect';
import { createGeminiService } from '../utils/geminiService';

export const SimpleLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!apiKey || !paymentText) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const geminiService = createGeminiService(apiKey);
      const response = await geminiService.generateContent(paymentText, selectedModel);

      if (response.error) {
        console.error('Gemini API Error:', response.error);

        // Extract message from nested error object
        let errorMsg = 'An error occurred';
        try {
          const errorObj = typeof response.error === 'string'
            ? JSON.parse(response.error)
            : response.error;
          errorMsg = errorObj?.error?.message || errorObj?.message || response.error;
        } catch {
          errorMsg = response.error;
        }

        setErrorMessage(errorMsg);
      } else {
        console.log('Gemini API Response:', response.text);
        if (response.paymentData) {
          console.log('Parsed Payment Data:', response.paymentData);
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="simple-layout py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {errorMessage && (
            <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)} className="mb-3">
              {errorMessage}
            </Alert>
          )}
          <Card>
            <Card.Body>
              <ApiKeyInput
                placeholder="Enter your OpenAI API key"
                onApiKeyChange={(key) => setApiKey(key)}
                className="mb-4"
                isInvalid={showValidation && !apiKey}
              />
              <ModelSelect
                value={selectedModel}
                onChange={setSelectedModel}
                className="mb-4"
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