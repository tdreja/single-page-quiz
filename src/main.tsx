import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Starting point of the React application.
 */
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
