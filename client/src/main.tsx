import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// NUCLEAR CACHE BUST FOR VOICE FEATURES
console.log('🔊 VOICE FEATURES LOADING - FORCE CACHE CLEAR v2.0.1749237670918');

// Clear all browser storage
localStorage.clear();
sessionStorage.clear();

// Force service worker refresh
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// Add visible confirmation
document.body.style.background = 'linear-gradient(45deg, #ff0000, #00ff00)';
document.body.innerHTML = '<div style="color:white;font-size:48px;text-align:center;margin-top:200px;">🔊 VOICE FEATURES LOADING...</div>';

setTimeout(() => {
  document.body.style.background = '';
  document.body.innerHTML = '<div id="root"></div>';
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}, 2000);