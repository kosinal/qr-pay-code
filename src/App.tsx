import React from 'react';
import { SimpleLayout } from './components/SimpleLayout';

const App: React.FC = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="w-100" style={{ maxWidth: '800px' }}>
        <SimpleLayout />
      </div>
    </div>
  );
};

export default App;
