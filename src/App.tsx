import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Image Tools
import QRGeneratorTool from "./pages/tools/image/QRGeneratorTool";
import QRScannerTool from "./pages/tools/image/QRScannerTool";
import ImageCompressorTool from "./pages/tools/image/ImageCompressorTool";
import ImageConverterTool from "./pages/tools/image/ImageConverterTool";
import ImageResizeTool from "./pages/tools/image/ImageResizeTool";
import ImageCropTool from "./pages/tools/image/ImageCropTool";
import BackgroundRemoverTool from "./pages/tools/image/BackgroundRemoverTool";
import WhatsAppStatusTool from "./pages/tools/image/WhatsAppStatusTool";
import ImageBase64Tool from "./pages/tools/image/ImageBase64Tool";
import ImageDPITool from "./pages/tools/image/ImageDPITool";
import EXIFViewerTool from "./pages/tools/image/EXIFViewerTool";
import FaviconGeneratorTool from "./pages/tools/image/FaviconGeneratorTool";
import ImageToPDFTool from "./pages/tools/image/ImageToPDFTool";
import ImageToWordTool from "./pages/tools/image/ImageToWordTool";

// PDF Tools
import PDFMergeTool from "./pages/tools/pdf/PDFMergeTool";
import PDFSplitTool from "./pages/tools/pdf/PDFSplitTool";
import PDFToImageTool from "./pages/tools/pdf/PDFToImageTool";
import PDFPasswordTool from "./pages/tools/pdf/PDFPasswordTool";
import PDFUnlockTool from "./pages/tools/pdf/PDFUnlockTool";
import PDFPageRemoverTool from "./pages/tools/pdf/PDFPageRemoverTool";
import PDFRotateTool from "./pages/tools/pdf/PDFRotateTool";
import PDFToWordTool from "./pages/tools/pdf/PDFToWordTool";
import PDFToPowerPointTool from "./pages/tools/pdf/PDFToPowerPointTool";
import PDFToExcelTool from "./pages/tools/pdf/PDFToExcelTool";
import WordToPDFTool from "./pages/tools/pdf/WordToPDFTool";
import PowerPointToPDFTool from "./pages/tools/pdf/PowerPointToPDFTool";
import HTMLToPDFTool from "./pages/tools/pdf/HTMLToPDFTool";

// Video Tools
import VideoDownloaderTool from "./pages/tools/video/VideoDownloaderTool";
import VideoToAudioTool from "./pages/tools/video/VideoToAudioTool";
import VideoTrimTool from "./pages/tools/video/VideoTrimTool";
import VideoSpeedTool from "./pages/tools/video/VideoSpeedTool";
import VideoThumbnailTool from "./pages/tools/video/VideoThumbnailTool";
import VideoResolutionTool from "./pages/tools/video/VideoResolutionTool";

// Audio Tools
import AudioConverterTool from "./pages/tools/audio/AudioConverterTool";
import SpeechToTextTool from "./pages/tools/audio/SpeechToTextTool";
import AudioTrimmerTool from "./pages/tools/audio/AudioTrimmerTool";
import AudioMergerTool from "./pages/tools/audio/AudioMergerTool";
import AudioSpeedTool from "./pages/tools/audio/AudioSpeedTool";

// Text Tools
import WordCounterTool from "./pages/tools/text/WordCounterTool";
import CaseConverterTool from "./pages/tools/text/CaseConverterTool";
import MarkdownHTMLTool from "./pages/tools/text/MarkdownHTMLTool";
import RemoveSpacesTool from "./pages/tools/text/RemoveSpacesTool";
import LineSorterTool from "./pages/tools/text/LineSorterTool";
import DuplicateRemoverTool from "./pages/tools/text/DuplicateRemoverTool";
import TextSummarizerTool from "./pages/tools/text/TextSummarizerTool";
import TextDiffTool from "./pages/tools/text/TextDiffTool";
import MemeGeneratorTool from "./pages/tools/text/MemeGeneratorTool";

// Security Tools
import PasswordGeneratorTool from "./pages/tools/security/PasswordGeneratorTool";
import PasswordStrengthTool from "./pages/tools/security/PasswordStrengthTool";
import HashGeneratorTool from "./pages/tools/security/HashGeneratorTool";
import Base64Tool from "./pages/tools/security/Base64Tool";
import UUIDGeneratorTool from "./pages/tools/security/UUIDGeneratorTool";

// Date & Time Tools
import AgeCalculatorTool from "./pages/tools/date-time/AgeCalculatorTool";
import DateDifferenceTool from "./pages/tools/date-time/DateDifferenceTool";
import WorkingDaysTool from "./pages/tools/date-time/WorkingDaysTool";
import CountdownTimerTool from "./pages/tools/date-time/CountdownTimerTool";

// Developer Tools
import JSONFormatterTool from "./pages/tools/dev/JSONFormatterTool";
import RegexTesterTool from "./pages/tools/dev/RegexTesterTool";
import URLEncoderTool from "./pages/tools/dev/URLEncoderTool";
import ColorConverterTool from "./pages/tools/dev/ColorConverterTool";
import LoremGeneratorTool from "./pages/tools/dev/LoremGeneratorTool";
import JWTDecoderTool from "./pages/tools/dev/JWTDecoderTool";
import URLShortenerTool from "./pages/tools/dev/URLShortenerTool";
import SitemapGeneratorTool from "./pages/tools/dev/SitemapGeneratorTool";
import RobotsTxtTool from "./pages/tools/dev/RobotsTxtTool";
import CronGeneratorTool from "./pages/tools/dev/CronGeneratorTool";
import HTTPHeaderTool from "./pages/tools/dev/HTTPHeaderTool";
import WebsiteScreenshotTool from "./pages/tools/dev/WebsiteScreenshotTool";

// Internet Tools
import IPLookupTool from "./pages/tools/internet/IPLookupTool";
import UserAgentTool from "./pages/tools/internet/UserAgentTool";
import DNSLookupTool from "./pages/tools/internet/DNSLookupTool";
import SSLCheckerTool from "./pages/tools/internet/SSLCheckerTool";
import WebsitePingTool from "./pages/tools/internet/WebsitePingTool";

// Education Tools
import ScientificCalculatorTool from "./pages/tools/education/ScientificCalculatorTool";
import PercentageCalculatorTool from "./pages/tools/education/PercentageCalculatorTool";
import UnitConverterTool from "./pages/tools/education/UnitConverterTool";

// Finance Tools
import EMICalculatorTool from "./pages/tools/finance/EMICalculatorTool";
import GSTCalculatorTool from "./pages/tools/finance/GSTCalculatorTool";
import SalaryCalculatorTool from "./pages/tools/finance/SalaryCalculatorTool";
import CurrencyConverterTool from "./pages/tools/finance/CurrencyConverterTool";

// ZIP Tools
import CreateZipTool from "./pages/tools/zip/CreateZipTool";
import ExtractZipTool from "./pages/tools/zip/ExtractZipTool";
import PasswordZipTool from "./pages/tools/zip/PasswordZipTool";
import CompressionZipTool from "./pages/tools/zip/CompressionZipTool";

// Social Tools
import HashtagGeneratorTool from "./pages/tools/social/HashtagGeneratorTool";
import BioGeneratorTool from "./pages/tools/social/BioGeneratorTool";
import CaptionFormatterTool from "./pages/tools/social/CaptionFormatterTool";
import LineBreakGeneratorTool from "./pages/tools/social/LineBreakGeneratorTool";
import LinkInBioTool from "./pages/tools/social/LinkInBioTool";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Image Tools - SEO friendly routes */}
          <Route path="/qr-code-generator" element={<QRGeneratorTool />} />
          <Route path="/qr-code-scanner" element={<QRScannerTool />} />
          <Route path="/image-compressor" element={<ImageCompressorTool />} />
          <Route path="/image-converter" element={<ImageConverterTool />} />
          <Route path="/image-resize" element={<ImageResizeTool />} />
          <Route path="/image-crop" element={<ImageCropTool />} />
          <Route path="/background-remover" element={<BackgroundRemoverTool />} />
          <Route path="/image-base64" element={<ImageBase64Tool />} />
          <Route path="/image-dpi-checker" element={<ImageDPITool />} />
          <Route path="/exif-viewer" element={<EXIFViewerTool />} />
          <Route path="/favicon-generator" element={<FaviconGeneratorTool />} />
          <Route path="/image-to-pdf" element={<ImageToPDFTool />} />
          <Route path="/image-to-word" element={<ImageToWordTool />} />
          
          {/* PDF Tools */}
          <Route path="/pdf-merge" element={<PDFMergeTool />} />
          <Route path="/pdf-split" element={<PDFSplitTool />} />
          <Route path="/pdf-to-jpg" element={<PDFToImageTool />} />
          <Route path="/pdf-password" element={<PDFPasswordTool />} />
          <Route path="/pdf-unlock" element={<PDFUnlockTool />} />
          <Route path="/pdf-page-remover" element={<PDFPageRemoverTool />} />
          <Route path="/pdf-rotate" element={<PDFRotateTool />} />
          <Route path="/pdf-to-word" element={<PDFToWordTool />} />
          <Route path="/pdf-to-powerpoint" element={<PDFToPowerPointTool />} />
          <Route path="/pdf-to-excel" element={<PDFToExcelTool />} />
          <Route path="/word-to-pdf" element={<WordToPDFTool />} />
          <Route path="/powerpoint-to-pdf" element={<PowerPointToPDFTool />} />
          <Route path="/html-to-pdf" element={<HTMLToPDFTool />} />
          
          {/* Video Tools */}
          <Route path="/video-downloader" element={<VideoDownloaderTool />} />
          <Route path="/video-to-audio" element={<VideoToAudioTool />} />
          <Route path="/video-trim" element={<VideoTrimTool />} />
          <Route path="/video-speed" element={<VideoSpeedTool />} />
          <Route path="/video-thumbnail" element={<VideoThumbnailTool />} />
          <Route path="/video-resolution" element={<VideoResolutionTool />} />
          
          {/* Audio Tools */}
          <Route path="/audio-converter" element={<AudioConverterTool />} />
          <Route path="/speech-to-text" element={<SpeechToTextTool />} />
          <Route path="/audio-trimmer" element={<AudioTrimmerTool />} />
          <Route path="/audio-merger" element={<AudioMergerTool />} />
          <Route path="/audio-speed" element={<AudioSpeedTool />} />
          
          {/* Text Tools */}
          <Route path="/word-counter" element={<WordCounterTool />} />
          <Route path="/case-converter" element={<CaseConverterTool />} />
          <Route path="/markdown-to-html" element={<MarkdownHTMLTool />} />
          <Route path="/remove-spaces" element={<RemoveSpacesTool />} />
          <Route path="/line-sorter" element={<LineSorterTool />} />
          <Route path="/duplicate-remover" element={<DuplicateRemoverTool />} />
          <Route path="/text-summarizer" element={<TextSummarizerTool />} />
          <Route path="/text-diff" element={<TextDiffTool />} />
          <Route path="/meme-generator" element={<MemeGeneratorTool />} />
          
          {/* Security Tools */}
          <Route path="/password-generator" element={<PasswordGeneratorTool />} />
          <Route path="/password-strength" element={<PasswordStrengthTool />} />
          <Route path="/hash-generator" element={<HashGeneratorTool />} />
          <Route path="/base64-encoder" element={<Base64Tool />} />
          <Route path="/uuid-generator" element={<UUIDGeneratorTool />} />
          
          {/* Date & Time Tools */}
          <Route path="/age-calculator" element={<AgeCalculatorTool />} />
          <Route path="/date-difference" element={<DateDifferenceTool />} />
          <Route path="/working-days-calculator" element={<WorkingDaysTool />} />
          <Route path="/countdown-timer" element={<CountdownTimerTool />} />
          
          {/* Developer Tools */}
          <Route path="/json-formatter" element={<JSONFormatterTool />} />
          <Route path="/regex-tester" element={<RegexTesterTool />} />
          <Route path="/url-encoder" element={<URLEncoderTool />} />
          <Route path="/color-converter" element={<ColorConverterTool />} />
          <Route path="/lorem-ipsum-generator" element={<LoremGeneratorTool />} />
          <Route path="/jwt-decoder" element={<JWTDecoderTool />} />
          <Route path="/url-shortener" element={<URLShortenerTool />} />
          <Route path="/sitemap-generator" element={<SitemapGeneratorTool />} />
          <Route path="/robots-txt-checker" element={<RobotsTxtTool />} />
          <Route path="/cron-generator" element={<CronGeneratorTool />} />
          <Route path="/http-header-checker" element={<HTTPHeaderTool />} />
          <Route path="/website-screenshot" element={<WebsiteScreenshotTool />} />
          
          {/* Internet Tools */}
          <Route path="/ip-lookup" element={<IPLookupTool />} />
          <Route path="/user-agent-parser" element={<UserAgentTool />} />
          <Route path="/dns-lookup" element={<DNSLookupTool />} />
          <Route path="/ssl-checker" element={<SSLCheckerTool />} />
          <Route path="/website-ping" element={<WebsitePingTool />} />
          
          {/* Education Tools */}
          <Route path="/scientific-calculator" element={<ScientificCalculatorTool />} />
          <Route path="/percentage-calculator" element={<PercentageCalculatorTool />} />
          <Route path="/unit-converter" element={<UnitConverterTool />} />
          
          {/* Finance Tools */}
          <Route path="/emi-calculator" element={<EMICalculatorTool />} />
          <Route path="/gst-calculator" element={<GSTCalculatorTool />} />
          <Route path="/salary-calculator" element={<SalaryCalculatorTool />} />
          <Route path="/currency-converter" element={<CurrencyConverterTool />} />
          
          {/* ZIP Tools */}
          <Route path="/create-zip" element={<CreateZipTool />} />
          <Route path="/extract-zip" element={<ExtractZipTool />} />
          <Route path="/password-zip" element={<PasswordZipTool />} />
          <Route path="/compression-zip" element={<CompressionZipTool />} />
          
          {/* Social Tools */}
          <Route path="/hashtag-generator" element={<HashtagGeneratorTool />} />
          <Route path="/bio-generator" element={<BioGeneratorTool />} />
          <Route path="/caption-formatter" element={<CaptionFormatterTool />} />
          <Route path="/line-break-generator" element={<LineBreakGeneratorTool />} />
          <Route path="/link-in-bio" element={<LinkInBioTool />} />
          <Route path="/whatsapp-status-generator" element={<WhatsAppStatusTool />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
