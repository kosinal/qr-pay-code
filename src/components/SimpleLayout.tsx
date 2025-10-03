import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelect, type GeminiModel } from './ModelSelect';
import { QRCodeDisplay } from './QRCodeDisplay';
import { createGeminiService } from '../utils/geminiService';
import { IBANBuilder, CountryCode } from 'ibankit';
import { createShortPaymentDescriptor } from '@spayd/core';
import './SimpleLayout.css';
import './ApiKeyInput.css';
import './PaymentTextInput.css';
import { FAQAccordion } from './FAQAccordion.tsx';

export const SimpleLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [spaydString, setSpaydString] = useState<string | null>(null);

  const parseApiError = (error: string): string => {
    try {
      const errorObj = JSON.parse(error);
      return errorObj?.error?.message || errorObj?.message || error;
    } catch {
      return error;
    }
  };

  interface PaymentData {
    account_number?: string;
    bank_code?: string;
    branch_code?: string;
    amount?: number | null;
    currency?: string;
    message?: string;
    payment_date?: string;
    variable_symbol?: number | null;
  }

  const validateBankInformation = (paymentData: PaymentData): boolean => {
    if (!paymentData.account_number || !paymentData.bank_code) {
      setErrorMessage(
        'Unable to find bank information (account number or bank code) in the payment data.'
      );
      return false;
    }
    return true;
  };

  const processAccountNumber = (accountNumber: string): { account: string; branch: string } => {
    let account = accountNumber;
    let branch = '000000';

    if (accountNumber.includes('-')) {
      const parts = accountNumber.split('-');
      branch = parts[0];
      account = parts[1];
    }

    account = account.padStart(10, '0');
    branch = branch.padStart(6, '0');

    return { account, branch };
  };

  const buildIban = (paymentData: PaymentData) => {
    return new IBANBuilder()
      .countryCode(CountryCode.CZ)
      .bankCode(paymentData.bank_code)
      .accountNumber(paymentData.account_number)
      .branchCode(paymentData.branch_code)
      .build();
  };

  const buildSpaydAttributes = (paymentData: PaymentData, ibanString: string) => {
    const spaydAttributes: Record<string, unknown> = {
      acc: ibanString,
    };

    if (paymentData.amount !== null) {
      spaydAttributes.am = paymentData.amount.toFixed(2);
    }

    if (paymentData.currency) {
      spaydAttributes.cc = paymentData.currency;
    }

    if (paymentData.message) {
      spaydAttributes.msg = paymentData.message;
    }

    if (paymentData.payment_date) {
      spaydAttributes.dt = new Date(paymentData.payment_date);
    }

    if (paymentData.variable_symbol !== null) {
      spaydAttributes.x = {
        vs: paymentData.variable_symbol.toString(),
      };
    }

    return spaydAttributes;
  };

  const processPaymentData = (paymentData: PaymentData): void => {
    if (!validateBankInformation(paymentData)) {
      return;
    }

    const { account, branch } = processAccountNumber(paymentData.account_number);
    paymentData.account_number = account;
    paymentData.branch_code = branch;

    try {
      const iban = buildIban(paymentData);
      const ibanString = iban.toString();

      try {
        const spaydAttributes = buildSpaydAttributes(paymentData, ibanString);
        const generatedSpayd = createShortPaymentDescriptor(spaydAttributes);
        setSpaydString(generatedSpayd);
      } catch (spaydError) {
        console.error('Error creating SPAYD:', spaydError);
        const fallbackSpayd = `SPD*1.0*ACC:${ibanString}${paymentData.amount ? `*AM:${paymentData.amount.toFixed(2)}` : ''}${paymentData.currency ? `*CC:${paymentData.currency}` : ''}`;
        setSpaydString(fallbackSpayd);
      }
    } catch (ibanError) {
      console.error('Error creating IBAN:', ibanError);
      const errorMsg = ibanError instanceof Error ? ibanError.message : 'Failed to generate IBAN';
      setErrorMessage(`Error generating payment information: ${errorMsg}`);
    }
  };

  interface GeminiResponse {
    error?: string;
    paymentData?: PaymentData;
  }

  interface GeminiService {
    validateResponse: (
      text: string,
      response: GeminiResponse,
      model: GeminiModel
    ) => Promise<{ status: boolean; message: string }>;
  }

  const handleApiResponse = async (
    response: GeminiResponse,
    geminiService: GeminiService
  ): Promise<void> => {
    if (response.error) {
      console.error('Gemini API Error:', response.error);
      const errorMsg = parseApiError(response.error);
      setErrorMessage(errorMsg);
      return;
    }

    if (response.paymentData) {
      // Validate response for hallucinations
      const validation = await geminiService.validateResponse(paymentText, response, selectedModel);

      if (!validation.status) {
        setValidationWarning(validation.message);
      } else {
        setValidationWarning(null);
      }

      // Process payment data regardless of validation result
      processPaymentData(response.paymentData);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey || !paymentText) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setErrorMessage(null);
    setValidationWarning(null);
    setIsLoading(true);

    try {
      const geminiService = createGeminiService(apiKey);
      const response = await geminiService.generateContent(paymentText, selectedModel);
      await handleApiResponse(response, geminiService);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg" style={{ backgroundColor: 'rgba(45, 45, 45, 0.85)' }}>
        <Card.Body className="p-4">
          {errorMessage && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setErrorMessage(null)}
              className="mb-3"
            >
              {errorMessage}
            </Alert>
          )}
          {validationWarning && (
            <Alert
              variant="warning"
              dismissible
              onClose={() => setValidationWarning(null)}
              className="mb-3"
            >
              <strong>Validation Warning:</strong> {validationWarning}
            </Alert>
          )}
          <h1 className="text-center mb-3">QR Code Payment Generator</h1>
          <QRCodeDisplay spaydString={spaydString} className="mb-4" />
          <PaymentTextInput
            value={paymentText}
            onChange={setPaymentText}
            isInvalid={showValidation && !paymentText}
            disabled={isLoading}
          />
          <ApiKeyInput
            placeholder="Enter your Gemini API key"
            onApiKeyChange={(key) => setApiKey(key)}
            className="mb-4"
            isInvalid={showValidation && !apiKey}
            disabled={isLoading}
          />
          <ModelSelect
            value={selectedModel}
            onChange={setSelectedModel}
            className="mb-4"
            disabled={isLoading}
          />
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" size="lg" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Generate QR Code'}
            </Button>
          </div>
        </Card.Body>
        <FAQAccordion />
      </Card>
    </>
  );
};
