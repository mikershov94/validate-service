import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@app';
import '@app/styles/index.css';
import '@mantine/core/styles.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
