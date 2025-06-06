import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force reload to clear cache
console.log('Loading new sidebar UI...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);