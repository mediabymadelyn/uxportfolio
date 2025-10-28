import React from 'react';
import ReactDOM from 'react-dom';
import './style.css'; // Import your styles if you have a CSS file
import App from './App'; // Import the main App component

// Render your App component inside the 'root' div in the HTML
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // This matches the div in your public/index.html
);