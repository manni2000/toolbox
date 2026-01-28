// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://toolbox-backend-0j1b.onrender.com'
  : 'http://localhost:8000';

export const API_URLS = {
  BASE_URL: API_BASE_URL,
  // PDF endpoints
  HTML_TO_PDF: `${API_BASE_URL}/api/pdf/html-to-pdf/`,
  PDF_TO_IMAGE: `${API_BASE_URL}/api/pdf/to-images/`,
  PDF_TO_WORD: `${API_BASE_URL}/api/pdf/to-word/`,
  PDF_TO_EXCEL: `${API_BASE_URL}/api/pdf/to-excel/`,
  PDF_TO_POWERPOINT: `${API_BASE_URL}/api/pdf/to-powerpoint/`,
  WORD_TO_PDF: `${API_BASE_URL}/api/pdf/word-to-pdf/`,
  POWERPOINT_TO_PDF: `${API_BASE_URL}/api/pdf/powerpoint-to-pdf/`,
  PDF_MERGE: `${API_BASE_URL}/api/pdf/merge/`,
  PDF_SPLIT: `${API_BASE_URL}/api/pdf/split/`,
  PDF_PASSWORD: `${API_BASE_URL}/api/pdf/protect/`,
  PDF_UNLOCK: `${API_BASE_URL}/api/pdf/unlock/`,
  PDF_PAGE_REMOVER: `${API_BASE_URL}/api/pdf/remove-pages/`,
  PDF_ROTATE: `${API_BASE_URL}/api/pdf/rotate/`,
  
  // Image endpoints
  IMAGE_COMPRESSOR: `${API_BASE_URL}/api/image/compressor/`,
  IMAGE_CONVERTER: `${API_BASE_URL}/api/image/converter/`,
  IMAGE_RESIZE: `${API_BASE_URL}/api/image/resize/`,
  IMAGE_CROP: `${API_BASE_URL}/api/image/crop/`,
  BACKGROUND_REMOVER: `${API_BASE_URL}/api/image/remove-background/`,
  IMAGE_TO_WORD: `${API_BASE_URL}/api/image/to-word/`,
  
  // Audio endpoints
  AUDIO_CONVERTER: `${API_BASE_URL}/api/audio/convert/`,
  AUDIO_MERGER: `${API_BASE_URL}/api/audio/merger/`,
  
  // ZIP endpoints
  PASSWORD_ZIP: `${API_BASE_URL}/api/zip/create-password/`,
};

export default API_BASE_URL;
