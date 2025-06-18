import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// At the top of App.js or index.js, just for debugging:
import Cookies from 'js-cookie';
Cookies.remove('cards');


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
  