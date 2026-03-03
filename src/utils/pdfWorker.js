// Configure PDF.js worker for react-pdf
// pdfjs-dist version: 3.11.174
import { pdfjs } from 'react-pdf';

// Use the CDN-hosted worker that exactly matches the installed pdfjs-dist version.
// This avoids the Vite worker bundling issue where pdf.worker.js 404s.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
