import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Render sin StrictMode para mejor rendimiento en móvil
createRoot(document.getElementById('root')!).render(<App />);
