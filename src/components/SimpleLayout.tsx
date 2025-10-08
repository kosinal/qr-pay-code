import React, { useState } from 'react';
import { Card, Button, Alert, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsQuestionCircle } from 'react-icons/bs';
import { PaymentTextInput } from './PaymentTextInput';
import { ApiKeyInput } from './ApiKeyInput';
import { ModelSelect, type GeminiModel } from './ModelSelect';
import { QRCodeDisplay } from './QRCodeDisplay';
import { LoadingOverlay } from './LoadingOverlay';
import { ImageInput } from './ImageInput';
import {
  createGeminiService,
  type GeminiResponse,
  type GeminiService,
  type OCRResponse,
} from '../utils/geminiService';
import { IBANBuilder, CountryCode } from 'ibankit';
import { createShortPaymentDescriptor } from '@spayd/core';
import './SimpleLayout.css';
import './ApiKeyInput.css';
import './PaymentTextInput.css';
import './QRCodeDisplay.css';
import { FAQAccordion } from './FAQAccordion.tsx';
import type { PaymentData } from '../types/paymentData';

interface SpaydPaymentAttributes {
  acc: string;
  am?: string;
  cc?: string;
  msg?: string;
  dt?: Date;
  x?: {
    vs?: string;
    ks?: string;
    ss?: string;
  };
}

type LoadingState = 'ocr' | 'analyzing' | 'validating' | null;

export const SimpleLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [showValidation, setShowValidation] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [spaydString, setSpaydString] = useState<string | null>(null);
  const [enableToT, setEnableToT] = useState(false);

  const parseApiError = (error: string): string => {
    try {
      const errorObj = JSON.parse(error);
      return errorObj?.error?.message || errorObj?.message || error;
    } catch {
      return error;
    }
  };

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
      .bankCode(paymentData.bank_code ?? '')
      .accountNumber(paymentData.account_number ?? '')
      .branchCode(paymentData.branch_code ?? '')
      .build();
  };

  const buildSpaydAttributes = (
    paymentData: PaymentData,
    ibanString: string
  ): SpaydPaymentAttributes => {
    const spaydAttributes: SpaydPaymentAttributes = {
      acc: ibanString,
    };

    if (paymentData.amount !== null && paymentData.amount !== undefined) {
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

    if (paymentData.variable_symbol !== null && paymentData.variable_symbol !== undefined) {
      spaydAttributes.x = {
        ...spaydAttributes.x,
        vs: paymentData.variable_symbol.toString(),
      };
    }

    if (paymentData.constant_symbol !== null && paymentData.constant_symbol !== undefined) {
      spaydAttributes.x = {
        ...spaydAttributes.x,
        ks: paymentData.constant_symbol.toString(),
      };
    }

    if (paymentData.specific_symbol !== null && paymentData.specific_symbol !== undefined) {
      spaydAttributes.x = {
        ...spaydAttributes.x,
        ss: paymentData.specific_symbol.toString(),
      };
    }

    return spaydAttributes;
  };

  const processPaymentData = (paymentData: PaymentData): void => {
    if (!validateBankInformation(paymentData)) {
      return;
    }

    const { account, branch } = processAccountNumber(paymentData.account_number ?? '');
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
      // Set validating state before validation
      setLoadingState('validating');

      // Validate response for hallucinations
      const validation = await geminiService.validateResponse(
        paymentText,
        response,
        selectedModel,
        enableToT
      );

      if (!validation.status) {
        setValidationWarning(validation.message);
      } else {
        setValidationWarning(null);
      }

      // Process payment data regardless of validation result
      processPaymentData(response.paymentData);
    }
  };

  const handleImageSelect = async (imageFile: File) => {
    if (!apiKey) {
      setErrorMessage('Please enter your Gemini API key first to process the image.');
      return;
    }

    setErrorMessage(null);
    setLoadingState('ocr');

    try {
      const geminiService = createGeminiService(apiKey);
      const ocrResult: OCRResponse = await geminiService.processImageOCR(imageFile, selectedModel);

      if (ocrResult.error) {
        setErrorMessage(`OCR Error: ${ocrResult.error}`);
      } else if (ocrResult.text) {
        // Prefill the text area with OCR result
        setPaymentText(ocrResult.text);
      } else {
        setErrorMessage('No text could be extracted from the image.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process image';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingState(null);
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
    setLoadingState('analyzing');

    try {
      const geminiService = createGeminiService(apiKey);
      const response = await geminiService.generateContent(paymentText, selectedModel, enableToT);
      await handleApiResponse(response, geminiService);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingState(null);
    }
  };

  const getLoadingMessage = (state: LoadingState): string => {
    switch (state) {
      case 'ocr':
        return 'Processing image...';
      case 'analyzing':
        return 'Analyzing...';
      case 'validating':
        return 'Validating...';
      default:
        return '';
    }
  };

  return (
    <>
      {loadingState && <LoadingOverlay message={getLoadingMessage(loadingState)} />}
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
            disabled={loadingState !== null}
            className="mb-4"
          />
          <Form.Check
            type="checkbox"
            id="enable-tot-checkbox"
            checked={enableToT}
            onChange={(e) => setEnableToT(e.target.checked)}
            disabled={loadingState !== null}
            className="mb-3"
            label={
              <>
                Deep analyze{' '}
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="tot-tooltip">
                      Uses Tree of Thought reasoning for deeper analysis. This will consume more
                      tokens and take longer to complete.
                    </Tooltip>
                  }
                >
                  <span style={{ cursor: 'help', marginLeft: '4px' }}>
                    <BsQuestionCircle size={16} />
                  </span>
                </OverlayTrigger>
              </>
            }
          />
          <ImageInput
            onImageSelect={handleImageSelect}
            disabled={loadingState !== null}
            className="mb-4"
          />
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={loadingState !== null}
            >
              {loadingState !== null ? 'Processing...' : 'Generate QR Code'}
            </Button>
          </div>
          <ApiKeyInput
            placeholder="Enter your Gemini API key"
            onApiKeyChange={(key) => setApiKey(key)}
            disabled={loadingState !== null}
            className="mb-4"
            isInvalid={showValidation && !apiKey}
          />
          <ModelSelect
            value={selectedModel}
            onChange={setSelectedModel}
            className="mb-4"
            disabled={loadingState !== null}
          />
        </Card.Body>
        <FAQAccordion />
      </Card>
    </>
  );
};
