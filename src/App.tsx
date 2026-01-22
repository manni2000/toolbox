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

// PDF Tools
import PDFMergeTool from "./pages/tools/pdf/PDFMergeTool";
import PDFSplitTool from "./pages/tools/pdf/PDFSplitTool";
import PDFToImageTool from "./pages/tools/pdf/PDFToImageTool";
import PDFPasswordTool from "./pages/tools/pdf/PDFPasswordTool";
import PDFUnlockTool from "./pages/tools/pdf/PDFUnlockTool";
import PDFPageRemoverTool from "./pages/tools/pdf/PDFPageRemoverTool";
import PDFRotateTool from "./pages/tools/pdf/PDFRotateTool";

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

// ZIP Tools
import CreateZipTool from "./pages/tools/zip/CreateZipTool";
import ExtractZipTool from "./pages/tools/zip/ExtractZipTool";
import PasswordZipTool from "./pages/tools/zip/PasswordZipTool";
import CompressionZipTool from "./pages/tools/zip/CompressionZipTool";

// Social Tools
import HashtagGeneratorTool from "./pages/tools/social/HashtagGeneratorTool";

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
          
          {/* Image Tools */}
          <Route path="/tools/image/qr-generator" element={<QRGeneratorTool />} />
          <Route path="/tools/image/qr-scanner" element={<QRScannerTool />} />
          <Route path="/tools/image/compressor" element={<ImageCompressorTool />} />
          <Route path="/tools/image/converter" element={<ImageConverterTool />} />
          <Route path="/tools/image/resize" element={<ImageResizeTool />} />
          <Route path="/tools/image/crop" element={<ImageCropTool />} />
          <Route path="/tools/image/background-remover" element={<BackgroundRemoverTool />} />
          <Route path="/tools/image/whatsapp-status" element={<WhatsAppStatusTool />} />
          <Route path="/tools/image/base64" element={<ImageBase64Tool />} />
          <Route path="/tools/image/dpi-checker" element={<ImageDPITool />} />
          <Route path="/tools/image/exif-viewer" element={<EXIFViewerTool />} />
          <Route path="/tools/image/favicon" element={<FaviconGeneratorTool />} />
          
          {/* PDF Tools */}
          <Route path="/tools/pdf/merge" element={<PDFMergeTool />} />
          <Route path="/tools/pdf/split" element={<PDFSplitTool />} />
          <Route path="/tools/pdf/to-image" element={<PDFToImageTool />} />
          <Route path="/tools/pdf/password" element={<PDFPasswordTool />} />
          <Route path="/tools/pdf/unlock" element={<PDFUnlockTool />} />
          <Route path="/tools/pdf/remove-pages" element={<PDFPageRemoverTool />} />
          <Route path="/tools/pdf/rotate" element={<PDFRotateTool />} />
          
          {/* Video Tools */}
          <Route path="/tools/video/downloader" element={<VideoDownloaderTool />} />
          <Route path="/tools/video/to-audio" element={<VideoToAudioTool />} />
          <Route path="/tools/video/trim" element={<VideoTrimTool />} />
          <Route path="/tools/video/speed" element={<VideoSpeedTool />} />
          <Route path="/tools/video/thumbnail" element={<VideoThumbnailTool />} />
          <Route path="/tools/video/resolution" element={<VideoResolutionTool />} />
          
          {/* Audio Tools */}
          <Route path="/tools/audio/converter" element={<AudioConverterTool />} />
          <Route path="/tools/audio/speech-to-text" element={<SpeechToTextTool />} />
          <Route path="/tools/audio/trimmer" element={<AudioTrimmerTool />} />
          <Route path="/tools/audio/merger" element={<AudioMergerTool />} />
          <Route path="/tools/audio/speed" element={<AudioSpeedTool />} />
          
          {/* Text Tools */}
          <Route path="/tools/text/word-counter" element={<WordCounterTool />} />
          <Route path="/tools/text/case-converter" element={<CaseConverterTool />} />
          <Route path="/tools/text/markdown-html" element={<MarkdownHTMLTool />} />
          <Route path="/tools/text/remove-spaces" element={<RemoveSpacesTool />} />
          <Route path="/tools/text/line-sorter" element={<LineSorterTool />} />
          <Route path="/tools/text/duplicate-remover" element={<DuplicateRemoverTool />} />
          <Route path="/tools/text/summarizer" element={<TextSummarizerTool />} />
          <Route path="/tools/text/diff" element={<TextDiffTool />} />
          <Route path="/tools/text/meme-generator" element={<MemeGeneratorTool />} />
          
          {/* Security Tools */}
          <Route path="/tools/security/password-generator" element={<PasswordGeneratorTool />} />
          <Route path="/tools/security/password-strength" element={<PasswordStrengthTool />} />
          <Route path="/tools/security/hash-generator" element={<HashGeneratorTool />} />
          <Route path="/tools/security/base64" element={<Base64Tool />} />
          <Route path="/tools/security/uuid-generator" element={<UUIDGeneratorTool />} />
          
          {/* Date & Time Tools */}
          <Route path="/tools/date-time/age-calculator" element={<AgeCalculatorTool />} />
          <Route path="/tools/date-time/date-difference" element={<DateDifferenceTool />} />
          <Route path="/tools/date-time/working-days" element={<WorkingDaysTool />} />
          <Route path="/tools/date-time/countdown" element={<CountdownTimerTool />} />
          
          {/* Developer Tools */}
          <Route path="/tools/dev/json-formatter" element={<JSONFormatterTool />} />
          <Route path="/tools/dev/regex-tester" element={<RegexTesterTool />} />
          <Route path="/tools/dev/url-encoder" element={<URLEncoderTool />} />
          <Route path="/tools/dev/color-converter" element={<ColorConverterTool />} />
          <Route path="/tools/dev/lorem-generator" element={<LoremGeneratorTool />} />
          <Route path="/tools/dev/jwt-decoder" element={<JWTDecoderTool />} />
          <Route path="/tools/dev/url-shortener" element={<URLShortenerTool />} />
          <Route path="/tools/dev/sitemap-generator" element={<SitemapGeneratorTool />} />
          <Route path="/tools/dev/robots-checker" element={<RobotsTxtTool />} />
          <Route path="/tools/dev/cron-generator" element={<CronGeneratorTool />} />
          <Route path="/tools/dev/http-header" element={<HTTPHeaderTool />} />
          <Route path="/tools/dev/website-screenshot" element={<WebsiteScreenshotTool />} />
          
          {/* Internet Tools */}
          <Route path="/tools/internet/ip-lookup" element={<IPLookupTool />} />
          <Route path="/tools/internet/user-agent" element={<UserAgentTool />} />
          <Route path="/tools/internet/dns-lookup" element={<DNSLookupTool />} />
          <Route path="/tools/internet/ssl-checker" element={<SSLCheckerTool />} />
          <Route path="/tools/internet/ping" element={<WebsitePingTool />} />
          
          {/* Education Tools */}
          <Route path="/tools/education/scientific-calculator" element={<ScientificCalculatorTool />} />
          <Route path="/tools/education/percentage-calculator" element={<PercentageCalculatorTool />} />
          <Route path="/tools/education/unit-converter" element={<UnitConverterTool />} />
          
          {/* Finance Tools */}
          <Route path="/tools/finance/emi-calculator" element={<EMICalculatorTool />} />
          <Route path="/tools/finance/gst-calculator" element={<GSTCalculatorTool />} />
          
          {/* ZIP Tools */}
          <Route path="/tools/zip/create" element={<CreateZipTool />} />
          <Route path="/tools/zip/extract" element={<ExtractZipTool />} />
          <Route path="/tools/zip/password" element={<PasswordZipTool />} />
          <Route path="/tools/zip/compression" element={<CompressionZipTool />} />
          
          {/* Social Tools */}
          <Route path="/tools/social/hashtag-generator" element={<HashtagGeneratorTool />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
