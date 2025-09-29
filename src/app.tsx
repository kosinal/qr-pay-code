import React, { useState } from 'react'
import { Container, Button, Card } from 'react-bootstrap';
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './app.css'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <Container className="py-4">
      <div className="text-center">
        <div className="d-flex justify-content-center gap-4 mb-4">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1 className="mb-4">Vite + React</h1>
        <Card className="mx-auto" style={{ maxWidth: '400px' }}>
          <Card.Body className="text-center">
            <Button
              variant="primary"
              onClick={() => setCount((count) => count + 1)}
              className="mb-3"
            >
              count is {count}
            </Button>
            <p className="mb-0">
              Edit <code>src/app.tsx</code> and save to test HMR
            </p>
          </Card.Body>
        </Card>
        <p className="mt-4">
          Check out{' '}
          <a
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
          {' '}and{' '}
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Docs
          </a>
        </p>
        <p className="text-muted">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </Container>
  )
}
