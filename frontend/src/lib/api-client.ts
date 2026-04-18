// API Client Helper Functions
import { API_URLS } from './api-complete';

// Generic API client for making requests
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URLS.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic POST request with file upload support
  async post(endpoint: string, data: any, isFormData = false) {
    const config: RequestInit = {
      method: 'POST',
      headers: {},
    };

    if (isFormData) {
      config.body = data; // FormData object
    } else {
      config.headers = {
        'Content-Type': 'application/json',
      };
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(endpoint, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      // console.error('API Error:', error);
      throw error;
    }
  }

  // Generic GET request
  async get(endpoint: string) {
    try {
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      // console.error('API Error:', error);
      throw error;
    }
  }

  // File upload helper
  async uploadFile(endpoint: string, file: File, additionalData: Record<string, any> = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    return this.post(endpoint, formData, true);
  }

  // Multiple files upload helper
  async uploadFiles(endpoint: string, files: File[], additionalData: Record<string, any> = {}) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    // Add additional form data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    return this.post(endpoint, formData, true);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Specific API methods for common operations
export const api = {
  // Image operations
  compressImage: (file: File, quality: number) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', quality.toString());
    return apiClient.post(API_URLS.IMAGE_COMPRESSOR, formData, true);
  },

  convertImage: (file: File, format: string, quality: number) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('format', format);
    formData.append('quality', quality.toString());
    return apiClient.post(API_URLS.IMAGE_CONVERTER, formData, true);
  },

  resizeImage: (file: File, width?: number, height?: number, maintainAspect?: boolean) => {
    const formData = new FormData();
    formData.append('image', file);
    if (width) formData.append('width', width.toString());
    if (height) formData.append('height', height.toString());
    if (maintainAspect !== undefined) formData.append('maintainAspect', maintainAspect.toString());
    return apiClient.post(API_URLS.IMAGE_RESIZE, formData, true);
  },

  cropImage: (file: File, x: number, y: number, width: number, height: number) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('x', x.toString());
    formData.append('y', y.toString());
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    return apiClient.post(API_URLS.IMAGE_CROP, formData, true);
  },

  generateQR: (text: string, size?: number, errorCorrectionLevel?: string) => {
    return apiClient.post(API_URLS.QR_GENERATOR, {
      text,
      size: size || 200,
      errorCorrectionLevel: errorCorrectionLevel || 'M'
    });
  },

  // Audio operations
  convertAudio: (file: File, format: string) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('format', format);
    return apiClient.post(API_URLS.AUDIO_CONVERTER, formData, true);
  },

  mergeAudio: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('audios', file));
    return apiClient.post(API_URLS.AUDIO_MERGER, formData, true);
  },

  trimAudio: (file: File, startTime: number, endTime: number) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('start_time', startTime.toString());
    formData.append('end_time', endTime.toString());
    return apiClient.post(API_URLS.AUDIO_TRIMMER, formData, true);
  },

  changeAudioSpeed: (file: File, speedFactor: number) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('speed_factor', speedFactor.toString());
    return apiClient.post(API_URLS.AUDIO_SPEED, formData, true);
  },

  speechToText: (file: File, language?: string) => {
    const formData = new FormData();
    formData.append('audio', file);
    if (language) formData.append('language', language);
    return apiClient.post(API_URLS.SPEECH_TO_TEXT, formData, true);
  },

  // Video operations
  videoToAudio: (file: File, format?: string, quality?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    if (format) formData.append('format', format);
    if (quality) formData.append('quality', quality);
    return apiClient.post(API_URLS.VIDEO_TO_AUDIO, formData, true);
  },

  trimVideo: (file: File, startTime: string, endTime: string) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    return apiClient.post(API_URLS.VIDEO_TRIM, formData, true);
  },

  changeVideoSpeed: (file: File, speedFactor: number) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('speedFactor', speedFactor.toString());
    return apiClient.post(API_URLS.VIDEO_SPEED, formData, true);
  },

  generateVideoThumbnail: (file: File, timestamp?: string, width?: number, height?: number) => {
    const formData = new FormData();
    formData.append('video', file);
    if (timestamp) formData.append('timestamp', timestamp);
    if (width) formData.append('width', width.toString());
    if (height) formData.append('height', height.toString());
    return apiClient.post(API_URLS.VIDEO_THUMBNAIL, formData, true);
  },

  changeVideoResolution: (file: File, width?: number, height?: number, maintainAspect?: boolean) => {
    const formData = new FormData();
    formData.append('video', file);
    if (width) formData.append('width', width.toString());
    if (height) formData.append('height', height.toString());
    if (maintainAspect !== undefined) formData.append('maintainAspect', maintainAspect.toString());
    return apiClient.post(API_URLS.VIDEO_RESOLUTION, formData, true);
  },

  convertVideo: (file: File, format: string, quality?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('format', format);
    if (quality) formData.append('quality', quality);
    return apiClient.post(API_URLS.VIDEO_CONVERT, formData, true);
  },

  compressVideo: (file: File, quality?: string, crf?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    if (quality) formData.append('quality', quality);
    if (crf) formData.append('crf', crf);
    return apiClient.post(API_URLS.VIDEO_COMPRESS, formData, true);
  },

  getVideoInfo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiClient.post(API_URLS.VIDEO_INFO, formData, true);
  },

  // PDF operations
  mergePDF: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));
    return apiClient.post(API_URLS.PDF_MERGE, formData, true);
  },

  splitPDF: (file: File, splitType?: string, pageRanges?: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    if (splitType) formData.append('splitType', splitType);
    if (pageRanges) formData.append('pageRanges', pageRanges);
    return apiClient.post(API_URLS.PDF_SPLIT, formData, true);
  },

  pdfToImage: (file: File, format?: string, quality?: string, pages?: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    if (format) formData.append('format', format);
    if (quality) formData.append('quality', quality);
    if (pages) formData.append('pages', pages);
    return apiClient.post(API_URLS.PDF_TO_IMAGE, formData, true);
  },

  protectPDF: (file: File, password: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);
    return apiClient.post(API_URLS.PDF_PASSWORD, formData, true);
  },

  unlockPDF: (file: File, password: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);
    return apiClient.post(API_URLS.PDF_UNLOCK, formData, true);
  },

  removePDFPages: (file: File, pagesToRemove: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('pagesToRemove', pagesToRemove);
    return apiClient.post(API_URLS.PDF_PAGE_REMOVER, formData, true);
  },

  rotatePDF: (file: File, angle: number, pages?: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('angle', angle.toString());
    if (pages) formData.append('pages', pages);
    return apiClient.post(API_URLS.PDF_ROTATE, formData, true);
  },

  compressPDF: (file: File, quality?: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    if (quality) formData.append('quality', quality);
    return apiClient.post(API_URLS.PDF_COMPRESS, formData, true);
  },

  getPDFInfo: (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return apiClient.post(API_URLS.PDF_INFO, formData, true);
  },

  // ZIP operations
  createZip: (files: File[], zipName?: string, compressionLevel?: number) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (zipName) formData.append('zipName', zipName);
    if (compressionLevel) formData.append('compressionLevel', compressionLevel.toString());
    return apiClient.post(API_URLS.CREATE_ZIP, formData, true);
  },

  extractZip: (file: File, extractPath?: string) => {
    const formData = new FormData();
    formData.append('zip', file);
    if (extractPath) formData.append('extractPath', extractPath);
    return apiClient.post(API_URLS.EXTRACT_ZIP, formData, true);
  },

  protectZip: (files: File[], password: string, zipName?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('password', password);
    if (zipName) formData.append('zipName', zipName);
    return apiClient.post(API_URLS.PASSWORD_ZIP, formData, true);
  },

  // Security operations
  generatePassword: (options: any) => {
    return apiClient.post(API_URLS.PASSWORD_GENERATOR, options);
  },

  checkPasswordStrength: (password: string) => {
    return apiClient.post(API_URLS.PASSWORD_STRENGTH, { password });
  },

  generateHash: (text: string, algorithm: string) => {
    return apiClient.post(API_URLS.HASH_GENERATOR, { text, algorithm });
  },

  encodeBase64: (text: string) => {
    return apiClient.post(API_URLS.BASE64_ENCODER, { text, action: 'encode' });
  },

  decodeBase64: (text: string) => {
    return apiClient.post(API_URLS.BASE64_ENCODER, { text, action: 'decode' });
  },

  generateUUID: (version?: string, count?: number) => {
    return apiClient.post(API_URLS.UUID_GENERATOR, { version, count });
  },

  // Text operations
  countWords: (text: string) => {
    return apiClient.post(API_URLS.WORD_COUNTER, { text });
  },

  convertCase: (text: string, caseType: string) => {
    return apiClient.post(API_URLS.CASE_CONVERTER, { text, caseType });
  },

  markdownToHtml: (markdown: string, action?: string) => {
    return apiClient.post(API_URLS.MARKDOWN_HTML, { markdown, action });
  },

  removeSpaces: (text: string, spaceType?: string) => {
    return apiClient.post(API_URLS.REMOVE_SPACES, { text, spaceType });
  },

  sortLines: (text: string, sortOrder?: string, reverse?: boolean) => {
    return apiClient.post(API_URLS.LINE_SORTER, { text, sortOrder, reverse });
  },

  removeDuplicates: (text: string, removeType?: string, caseSensitive?: boolean) => {
    return apiClient.post(API_URLS.DUPLICATE_REMOVER, { text, removeType, caseSensitive });
  },

  summarizeText: (text: string, summaryLength?: string) => {
    return apiClient.post(API_URLS.TEXT_SUMMARIZER, { text, summaryLength });
  },

  diffText: (text1: string, text2: string, diffType?: string) => {
    return apiClient.post(API_URLS.TEXT_DIFF, { text1, text2, diffType });
  },

  // Date & Time operations
  calculateDateDifference: (startDate: string, endDate: string, includeTime?: boolean) => {
    return apiClient.post(API_URLS.DATE_DIFFERENCE, { startDate, endDate, includeTime });
  },

  calculateWorkingDays: (startDate: string, endDate: string, holidays?: string[]) => {
    return apiClient.post(API_URLS.WORKING_DAYS, { startDate, endDate, holidays });
  },

  createCountdown: (targetDate: string, timezone?: string) => {
    return apiClient.post(API_URLS.COUNTDOWN_TIMER, { targetDate, timezone });
  },

  getWorldTime: (timezone?: string) => {
    if (timezone) {
      return apiClient.get(`${API_URLS.WORLD_TIME}?timezone=${timezone}`);
    }
    return apiClient.get(API_URLS.WORLD_TIME);
  },

  calculateAge: (birthDate: string, currentDate?: string) => {
    return apiClient.post(API_URLS.AGE_CALCULATOR, { birthDate, currentDate });
  },

  // Blog operations
  getBlogPosts: (page: number = 1, limit: number = 10, category?: string, featured?: boolean) => {
    let url = `${API_URLS.BLOG_LIST}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (featured !== undefined) url += `&featured=${featured}`;
    return apiClient.get(url);
  },

  getBlogPost: (slug: string) => {
    return apiClient.get(API_URLS.BLOG_POST(slug));
  },

  searchBlog: (query: string) => {
    return apiClient.get(`${API_URLS.BLOG_SEARCH}?q=${encodeURIComponent(query)}`);
  },

  getBlogCategories: () => {
    return apiClient.get(API_URLS.BLOG_CATEGORIES);
  },

  getBlogByCategory: (category: string, page: number = 1, limit: number = 10) => {
    return apiClient.get(`${API_URLS.BLOG_CATEGORY(category)}?page=${page}&limit=${limit}`);
  }
};

export default api;
