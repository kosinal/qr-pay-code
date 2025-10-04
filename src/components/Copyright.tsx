import React from 'react';
import packageJson from '../../package.json';
import './Copyright.css';

export const Copyright: React.FC = () => {
  return (
    <div className="copyright">
      © {new Date().getFullYear()} Lukas Kosina · v{packageJson.version}
    </div>
  );
};
