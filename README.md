# QR Pay Code Generator

A modern web application that generates QR codes for Czech bank payments using AI-powered natural language processing. Simply describe your payment in plain text, and let AI extract the details to create a scannable payment QR code.

## 🌟 Features

- **AI-Powered Payment Parsing** - Describe payments in natural language (Czech or English)
- **Image OCR Support** - Upload images of payment slips to extract payment information
- **SPAYD QR Code Generation** - Creates QR codes compatible with Czech mobile banking apps
- **IBAN Generation** - Automatic IBAN creation for Czech bank accounts
- **Multiple AI Models** - Support for various Google Gemini models
- **Response Validation** - Built-in validation to detect and warn about AI hallucinations
- **Secure & Private** - API key stored locally in browser, no backend server
- **Modern UI** - Responsive design with Bootstrap 5
- **Comprehensive Testing** - Full test coverage with Vitest and React Testing Library

## 🚀 Live Demo

Visit the live application: [QR Pay Code Generator](https://kosinal.github.io/qr-pay-code/)

## 🛠️ Tech Stack

### Core
- **React 19** - UI framework with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### UI & Styling
- **Bootstrap 5** - Responsive component library
- **React Bootstrap** - Bootstrap components for React
- **React Icons** - Icon library

### Payment Processing
- **@spayd/core** - SPAYD payment descriptor generation
- **ibankit** - IBAN generation and validation
- **qrcode.react** - QR code rendering

### AI Integration
- **@google/genai** - Google Gemini AI API client

### Testing & Quality
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Google AI Studio API Key** (free tier available)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qr-pay-code.git
   cd qr-pay-code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Gemini API key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key (free tier available)
   - The application will prompt you to enter it on first use

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 💡 Usage

### Basic Workflow

1. **Enter Payment Description**
   - Type or paste payment details in natural language
   - Example: "Zaplatit Janu Novákovi 1500 Kč na účet 123456789/0100 s variabilním symbolem 2024001"
   - Or in English: "Pay 1500 CZK to account 123456789/0100 with variable symbol 2024001"

2. **Upload Image (Optional)**
   - Click "Upload Payment Image" to use OCR
   - Upload a photo of a payment slip or invoice
   - AI will extract text automatically

3. **Enter API Key**
   - Paste your Google Gemini API key
   - Key is stored securely in browser localStorage
   - Only used to communicate with Google's AI service

4. **Select AI Model**
   - Choose from available Gemini models
   - Default: gemini-2.5-pro (balanced performance)

5. **Generate QR Code**
   - Click "Generate QR Code"
   - AI analyzes the text and extracts payment information
   - QR code appears at the top, ready to scan

### Example Payment Text

```
Vážený kliente,
v návaznosti na uzavřenou pojistnou smlouvu Vám předkládáme vyúčtování pojistného.
Prosíme o úhradu na níže uvedené bankovní spojení.
Pojistné je osvobozeno od DPH dle §51 a §55 zákona č. 235/2004 Sb., o dani z přidané hodnoty, v platném znění.

Bankovní spojení:
datum splatnosti: 24. 10. 2025
číslo účtu příjemce: 145893022/0300
konstantní symbol: 3558
variabilní symbol: 8752100567
splátka pojistného: 720 Kč
celkem k úhradě: 720 Kč

V případě jakýchkoliv dotazů nás kontaktujte na emailové adrese info@aurora-pojistovna.cz
.
Naši pracovníci jsou Vám k dispozici na lince zákaznické podpory 800 222 444 každý pracovní den od 8 do 16 hodin.

Děkujeme za Vaši důvěru.

S pozdravem
Aurora pojišťovna a.s.
```

## 🏗️ How It Works

1. **Input Processing**
   - User provides payment description (text or image)
   - Image OCR extracts text using Gemini Vision

2. **AI Analysis**
   - Gemini AI parses natural language text
   - Extracts structured payment data (amount, account, symbols, etc.)

3. **Validation**
   - Response validated against original input
   - Warns if AI might have hallucinated information

4. **Payment Generation**
   - Account number processed (prefix-number format)
   - IBAN generated for Czech bank account
   - SPAYD descriptor created with all payment details

5. **QR Code Display**
   - QR code rendered from SPAYD string
   - Compatible with Czech mobile banking apps

## 📁 Project Structure

```
qr-pay-code/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── __tests__/      # Component tests
│   │   ├── ApiKeyInput.tsx
│   │   ├── FAQAccordion.tsx
│   │   ├── ImageInput.tsx
│   │   ├── LoadingOverlay.tsx
│   │   ├── ModelSelect.tsx
│   │   ├── PaymentTextInput.tsx
│   │   ├── QRCodeDisplay.tsx
│   │   └── SimpleLayout.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── paymentData.ts
│   ├── utils/              # Utility functions
│   │   ├── __tests__/      # Utility tests
│   │   ├── geminiService.ts
│   │   └── localStorage.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest test configuration
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run all tests
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Generate test coverage report

### Code Quality
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix auto-fixable linting errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run check` - Run all quality checks (format, lint, test, build)

### Deployment
- `npm run deploy` - Build project for GitHub Pages deployment

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Component Tests** - UI component behavior and rendering
- **Service Tests** - Gemini API integration and error handling
- **Security Tests** - Input validation and sanitization
- **Utility Tests** - Helper functions and localStorage

## ✅ Code Quality

Before committing changes, run the quality check:

```bash
npm run check
```

This runs:
1. **Format Check** - Verifies Prettier formatting
2. **Lint** - Checks ESLint rules
3. **Tests** - Runs full test suite
4. **Build** - Verifies production build succeeds

## 🔒 Security

### API Key Storage
- API key stored in browser's `localStorage`
- Never sent to any server except Google's Gemini API
- Key persists across sessions for convenience
- Clear browser data to remove stored key

### Response Validation
- All AI responses validated against input
- Warns users if potential hallucination detected
- Provides transparency about AI reliability

### Data Privacy
- No backend server - all processing client-side
- Payment data never stored or transmitted except to Gemini API
- Open source - audit the code yourself

## 📄 License

This project is open source and available under the [GNU GENERAL PUBLIC LICENSE](LICENSE).

## 🙏 Acknowledgments

- **Google Gemini AI** - Natural language processing
- **SPAYD** - Czech payment descriptor standard
- **ibankit** - IBAN generation library
- **qrcode.react** - QR code rendering
- **React Bootstrap** - UI components
- **Vite** - Build tooling

## 📞 Support

For issues, questions, or suggestions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/qr-pay-code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/qr-pay-code/discussions)

---

Made with ❤️ for easier payment processing in Czech Republic
