import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Preload and register Naira currency glyph font across all weights (100-900)
// This guarantees crisp U+20A6 (₦) rendering across all headings, bold amounts, and buttons
if (typeof window !== 'undefined' && 'fonts' in document) {
  fetch('/fonts/naira.ttf')
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
      weights.forEach((w) => {
        const font = new FontFace('NairaFont', buffer, { weight: w, style: 'normal' });
        font.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
        }).catch(() => {});
      });
    })
    .catch((err) => {
      console.warn('Currency font loading:', err);
    });
}

createRoot(document.getElementById('root')!).render(<App />);
