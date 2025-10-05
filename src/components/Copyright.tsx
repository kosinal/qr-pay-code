import React from 'react';
import packageJson from '../../package.json';
import './Copyright.css';

export const Copyright: React.FC = () => {
  return (
    <div className="copyright">
      © {new Date().getFullYear()} Lukas Kosina · v{packageJson.version} ·{' '}
      <a
        href="https://github.com/kosinal/qr-pay-code/blob/master/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
      >
        License
      </a>
    </div>
  );
};
