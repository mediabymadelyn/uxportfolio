import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css'; // Import your styles if you have a CSS file
import App from './App'; // Import the main App component

// Render the App component into the root node.
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);