import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './Dashboard';
import '../index.css'; // Reuse global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
);
