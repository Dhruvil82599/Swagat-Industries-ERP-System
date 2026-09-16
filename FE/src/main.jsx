import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

// Prevent mouse wheel roller scroll from changing number input values globally
document.addEventListener('wheel', () => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: true });

// Prevent keyboard Up / Down arrow keys from changing number input values globally
document.addEventListener('keydown', (e) => {
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


