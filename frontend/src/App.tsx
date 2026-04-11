import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogListPage = lazy(() => import("./pages/blog/BlogListPage"));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage"));
const APIDocs = lazy(() => import("./pages/APIDocs"));

// Loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// Image Tools - Lazy loaded
const QRGeneratorTool = lazy(() => import("./pages/tools/image/QRGeneratorTool"));
const QRScannerTool = lazy(() => import("./pages/tools/image/QRScannerTool"));
const PNGToJPGConverter = lazy(() => import("./pages/tools/image/PNGToJPGConverter"));
const JPGToPNGConverter = lazy(() => import("./pages/tools/image/JPGToPNGConverter"));
const WebPToPNGConverter = lazy(() => import("./pages/tools/image/WebPToPNGConverter"));
const PNGToWebPConverter = lazy(() => import("./pages/tools/image/PNGToWebPConverter"));
const ImageCompressorTool = lazy(() => import("./pages/tools/image/ImageCompressorTool"));
const ImageResizeTool = lazy(() => import("./pages/tools/image/ImageResizeTool"));
const ImageCropTool = lazy(() => import("./pages/tools/image/ImageCropTool"));
const BackgroundRemoverTool = lazy(() => import("./pages/tools/image/BackgroundRemoverTool"));
const WhatsAppStatusTool = lazy(() => import("./pages/tools/image/WhatsAppStatusTool"));
const ImageBase64Tool = lazy(() => import("./pages/tools/image/ImageBase64Tool"));
const ImageDPITool = lazy(() => import("./pages/tools/image/ImageDPITool"));
const EXIFViewerTool = lazy(() => import("./pages/tools/image/EXIFViewerTool"));
const FaviconGeneratorTool = lazy(() => import("./pages/tools/image/FaviconGeneratorTool"));
const ImageToPDFTool = lazy(() => import("./pages/tools/image/ImageToPDFTool"));
const ImageToWordTool = lazy(() => import("./pages/tools/image/ImageToWordTool"));

// PDF Tools - Lazy loaded
const PDFMergeTool = lazy(() => import("./pages/tools/pdf/PDFMergeTool"));
const PDFSplitTool = lazy(() => import("./pages/tools/pdf/PDFSplitTool"));
const PDFToImageTool = lazy(() => import("./pages/tools/pdf/PDFToImageTool"));
const PDFPasswordTool = lazy(() => import("./pages/tools/pdf/PDFPasswordTool"));
const PDFUnlockTool = lazy(() => import("./pages/tools/pdf/PDFUnlockTool"));
const PDFPageRemoverTool = lazy(() => import("./pages/tools/pdf/PDFPageRemoverTool"));
const PDFRotateTool = lazy(() => import("./pages/tools/pdf/PDFRotateTool"));
const PDFToWordTool = lazy(() => import("./pages/tools/pdf/PDFToWordTool"));
const PDFToPowerPointTool = lazy(() => import("./pages/tools/pdf/PDFToPowerPointTool"));
const PDFToExcelTool = lazy(() => import("./pages/tools/pdf/PDFToExcelTool"));
const WordToPDFTool = lazy(() => import("./pages/tools/pdf/WordToPDFTool"));
const PowerPointToPDFTool = lazy(() => import("./pages/tools/pdf/PowerPointToPDFTool"));
const HTMLToPDFTool = lazy(() => import("./pages/tools/pdf/HTMLToPDFTool"));

// Video Tools - Lazy loaded
const VideoToAudioTool = lazy(() => import("./pages/tools/video/VideoToAudioTool"));
const VideoTrimTool = lazy(() => import("./pages/tools/video/VideoTrimTool"));
const VideoSpeedTool = lazy(() => import("./pages/tools/video/VideoSpeedTool"));
const VideoThumbnailTool = lazy(() => import("./pages/tools/video/VideoThumbnailTool"));
const VideoResolutionTool = lazy(() => import("./pages/tools/video/VideoResolutionTool"));

// Audio Tools - Lazy loaded
const AudioConverterTool = lazy(() => import("./pages/tools/audio/AudioConverterTool"));
const SpeechToTextTool = lazy(() => import("./pages/tools/audio/SpeechToTextTool"));
const AudioTrimmerTool = lazy(() => import("./pages/tools/audio/AudioTrimmerTool"));
const AudioMergerTool = lazy(() => import("./pages/tools/audio/AudioMergerTool"));
const AudioSpeedTool = lazy(() => import("./pages/tools/audio/AudioSpeedTool"));

// Text Tools - Lazy loaded
const WordCounterTool = lazy(() => import("./pages/tools/text/WordCounterTool"));
const CaseConverterTool = lazy(() => import("./pages/tools/text/CaseConverterTool"));
const MarkdownHTMLTool = lazy(() => import("./pages/tools/text/MarkdownHTMLTool"));
const RemoveSpacesTool = lazy(() => import("./pages/tools/text/RemoveSpacesTool"));
const LineSorterTool = lazy(() => import("./pages/tools/text/LineSorterTool"));
const DuplicateRemoverTool = lazy(() => import("./pages/tools/text/DuplicateRemoverTool"));
const TextSummarizerTool = lazy(() => import("./pages/tools/text/TextSummarizerTool"));
const TextDiffTool = lazy(() => import("./pages/tools/text/TextDiffTool"));

// Security Tools - Lazy loaded
const PasswordGeneratorTool = lazy(() => import("./pages/tools/security/PasswordGeneratorTool"));
const PasswordStrengthTool = lazy(() => import("./pages/tools/security/PasswordStrengthTool"));
const HashGeneratorTool = lazy(() => import("./pages/tools/security/HashGeneratorTool"));
const Base64Tool = lazy(() => import("./pages/tools/security/Base64Tool"));
const UUIDGeneratorTool = lazy(() => import("./pages/tools/security/UUIDGeneratorTool"));
const PasswordStrengthExplainerTool = lazy(() => import("./pages/tools/security/PasswordStrengthExplainerTool"));
const DataBreachEmailCheckerTool = lazy(() => import("./pages/tools/security/DataBreachEmailCheckerTool"));
const FileHashComparisonTool = lazy(() => import("./pages/tools/security/FileHashComparisonTool"));
const EXIFLocationRemoverTool = lazy(() => import("./pages/tools/security/EXIFLocationRemoverTool"));
const TextRedactionTool = lazy(() => import("./pages/tools/security/TextRedactionTool"));
const QRPhishingScannerTool = lazy(() => import("./pages/tools/security/QRPhishingScannerTool"));
const SecureNotesTool = lazy(() => import("./pages/tools/security/SecureNotesTool"));
const URLReputationCheckerTool = lazy(() => import("./pages/tools/security/URLReputationCheckerTool"));

// Date & Time Tools - Lazy loaded
const DateDifferenceTool = lazy(() => import("./pages/tools/date-time/DateDifferenceTool"));
const WorkingDaysTool = lazy(() => import("./pages/tools/date-time/WorkingDaysTool"));
const CountdownTimerTool = lazy(() => import("./pages/tools/date-time/CountdownTimerTool"));
const WorldTimeTool = lazy(() => import("./pages/tools/date-time/WorldTimeTool"));
const AgeCalculatorTool = lazy(() => import("./pages/tools/date-time/AgeCalculatorTool"));

// Developer Tools - Lazy loaded
const JSONFormatterTool = lazy(() => import("./pages/tools/dev/JSONFormatterTool"));
const RegexTesterTool = lazy(() => import("./pages/tools/dev/RegexTesterTool"));
const URLEncoderTool = lazy(() => import("./pages/tools/dev/URLEncoderTool"));
const ColorConverterTool = lazy(() => import("./pages/tools/dev/ColorConverterTool"));
const LoremGeneratorTool = lazy(() => import("./pages/tools/dev/LoremGeneratorTool"));
const JWTDecoderTool = lazy(() => import("./pages/tools/dev/JWTDecoderTool"));
const CronGeneratorTool = lazy(() => import("./pages/tools/dev/CronGeneratorTool"));
const HTTPHeaderTool = lazy(() => import("./pages/tools/dev/HTTPHeaderTool"));
const WebsiteScreenshotTool = lazy(() => import("./pages/tools/internet/WebsiteScreenshotTool"));
const TokenCalculatorTool = lazy(() => import("./pages/tools/dev/TokenCalculatorTool"));
const ColorPalettesTool = lazy(() => import("./pages/tools/dev/ColorPalettesTool"));

// New Developer Tools - Lazy loaded
const APIResponseFormatterTool = lazy(() => import("./pages/tools/dev/APIResponseFormatterTool"));
const JsonToTypeScriptTool = lazy(() => import("./pages/tools/dev/JsonToTypeScriptTool"));
const SQLQueryBeautifierTool = lazy(() => import("./pages/tools/dev/SQLQueryBeautifierTool"));
const JWTExpiryTool = lazy(() => import("./pages/tools/dev/JWTExpiryTool"));
const EnvironmentVariableTool = lazy(() => import("./pages/tools/dev/EnvironmentVariableTool"));
const PostmanCollectionTool = lazy(() => import("./pages/tools/dev/PostmanCollectionTool"));
const DockerfileGeneratorTool = lazy(() => import("./pages/tools/dev/DockerfileGeneratorTool"));
const CurlToAxiosTool = lazy(() => import("./pages/tools/dev/CurlToAxiosTool"));
const HTTPStatusCodeTool = lazy(() => import("./pages/tools/dev/HTTPStatusCodeTool"));

// Internet Tools - Lazy loaded
const IPLookupTool = lazy(() => import("./pages/tools/internet/IPLookupTool"));
const UserAgentTool = lazy(() => import("./pages/tools/internet/UserAgentTool"));
const DNSLookupTool = lazy(() => import("./pages/tools/internet/DNSLookupTool"));
const SSLCheckerTool = lazy(() => import("./pages/tools/internet/SSLCheckerTool"));
const WebsitePingTool = lazy(() => import("./pages/tools/internet/WebsitePingTool"));

// Education Tools - Lazy loaded
const ScientificCalculatorTool = lazy(() => import("./pages/tools/education/ScientificCalculatorTool"));
const PercentageCalculatorTool = lazy(() => import("./pages/tools/education/PercentageCalculatorTool"));
const UnitConverterTool = lazy(() => import("./pages/tools/education/UnitConverterTool"));
const CompoundInterestTool = lazy(() => import("./pages/tools/education/CompoundInterestTool"));
const SimpleInterestTool = lazy(() => import("./pages/tools/education/SimpleInterestTool"));
const CGPAToPercentageTool = lazy(() => import("./pages/tools/education/CGPAToPercentageTool"));
const LCMHCFTool = lazy(() => import("./pages/tools/education/LCMHCFTool"));
const StudyTimetableTool = lazy(() => import("./pages/tools/education/StudyTimetableTool"));
const MCQGeneratorTool = lazy(() => import("./pages/tools/education/MCQGeneratorTool"));

// Finance Tools - Lazy loaded
const EMICalculatorTool = lazy(() => import("./pages/tools/finance/EMICalculatorTool"));
const GSTCalculatorTool = lazy(() => import("./pages/tools/finance/GSTCalculatorTool"));
const SalaryCalculatorTool = lazy(() => import("./pages/tools/finance/SalaryCalculatorTool"));
const CurrencyConverterTool = lazy(() => import("./pages/tools/finance/CurrencyConverterTool"));
const StartupBurnRateCalculatorTool = lazy(() => import("./pages/tools/finance/StartupBurnRateCalculatorTool"));
const SaaSPricingCalculatorTool = lazy(() => import("./pages/tools/finance/SaaSPricingCalculatorTool"));
const EMIComparisonTool = lazy(() => import("./pages/tools/finance/EMIComparisonTool"));
const TaxSlabAnalyzerTool = lazy(() => import("./pages/tools/finance/TaxSlabAnalyzerTool"));
const InvoiceGeneratorTool = lazy(() => import("./pages/tools/finance/InvoiceGeneratorTool"));
const ProfitMarginCalculatorTool = lazy(() => import("./pages/tools/finance/ProfitMarginCalculatorTool"));
const FreelancerRateCalculatorTool = lazy(() => import("./pages/tools/finance/FreelancerRateCalculatorTool"));
const SalaryBreakupGeneratorTool = lazy(() => import("./pages/tools/finance/SalaryBreakupGeneratorTool"));
const BudgetPlannerTool = lazy(() => import("./pages/tools/finance/BudgetPlannerTool"));
const StockCAGRCalculatorTool = lazy(() => import("./pages/tools/finance/StockCAGRCalculatorTool"));
const MutualFundCalculatorTool = lazy(() => import("./pages/tools/finance/MutualFundCalculatorTool"));
const LumpsumCalculatorTool = lazy(() => import("./pages/tools/finance/LumpsumCalculatorTool"));

// SEO Tools - Lazy loaded
const MetaTitleDescriptionTool = lazy(() => import("./pages/tools/seo/MetaTitleDescriptionTool"));
const KeywordDensityTool = lazy(() => import("./pages/tools/seo/KeywordDensityTool"));
const RobotsTxtTool = lazy(() => import("./pages/tools/seo/RobotsTxtTool"));
const SitemapValidatorTool = lazy(() => import("./pages/tools/seo/SitemapValidatorTool"));
const PageSpeedChecklistTool = lazy(() => import("./pages/tools/seo/PageSpeedChecklistTool"));
const OGImagePreviewTool = lazy(() => import("./pages/tools/seo/OGImagePreviewTool"));
const BrokenImageFinderTool = lazy(() => import("./pages/tools/seo/BrokenImageFinderTool"));
const UTMLinkBuilderTool = lazy(() => import("./pages/tools/seo/UTMLinkBuilderTool"));
const DomainAgeTool = lazy(() => import("./pages/tools/seo/DomainAgeTool"));
const TechStackDetectorTool = lazy(() => import("./pages/tools/seo/TechStackDetectorTool"));
const PageSEOTool = lazy(() => import("./pages/tools/seo/PageSEOTool"));

// ZIP Tools - Lazy loaded
const CreateZipTool = lazy(() => import("./pages/tools/zip/CreateZipTool"));
const ExtractZipTool = lazy(() => import("./pages/tools/zip/ExtractZipTool"));
const PasswordZipTool = lazy(() => import("./pages/tools/zip/PasswordZipTool"));
const CompressionZipTool = lazy(() => import("./pages/tools/zip/CompressionZipTool"));

// Social Tools - Lazy loaded
const HashtagGeneratorTool = lazy(() => import("./pages/tools/social/HashtagGeneratorTool"));
const BioGeneratorTool = lazy(() => import("./pages/tools/social/BioGeneratorTool"));
const CaptionFormatterTool = lazy(() => import("./pages/tools/social/CaptionFormatterTool"));
const LineBreakGeneratorTool = lazy(() => import("./pages/tools/social/LineBreakGeneratorTool"));
const LinkInBioTool = lazy(() => import("./pages/tools/social/LinkInBioTool"));
const MemeGeneratorTool = lazy(() => import("./pages/tools/social/MemeGeneratorTool"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
        <Route path="/categories" element={<Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>} />
        <Route path="/category/:categoryId" element={<Suspense fallback={<PageLoader />}><CategoryPage /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
        <Route path="/blogs" element={<Suspense fallback={<PageLoader />}><BlogListPage /></Suspense>} />
        <Route path="/blogs/:slug" element={<Suspense fallback={<PageLoader />}><BlogPostPage /></Suspense>} />
        <Route path="/api-docs" element={<Suspense fallback={<PageLoader />}><APIDocs /></Suspense>} />
        <Route path="/developers" element={<Suspense fallback={<PageLoader />}><APIDocs /></Suspense>} />
          
          {/* Image Tools - SEO friendly routes */}
          <Route path="/qr-code-generator" element={<Suspense fallback={<PageLoader />}><QRGeneratorTool /></Suspense>} />
          <Route path="/qr-code-scanner" element={<Suspense fallback={<PageLoader />}><QRScannerTool /></Suspense>} />
          <Route path="/png-to-jpg-converter" element={<Suspense fallback={<PageLoader />}><PNGToJPGConverter /></Suspense>} />
          <Route path="/jpg-to-png-converter" element={<Suspense fallback={<PageLoader />}><JPGToPNGConverter /></Suspense>} />
          <Route path="/webp-to-png-converter" element={<Suspense fallback={<PageLoader />}><WebPToPNGConverter /></Suspense>} />
          <Route path="/png-to-webp-converter" element={<Suspense fallback={<PageLoader />}><PNGToWebPConverter /></Suspense>} />
          <Route path="/image-compressor" element={<Suspense fallback={<PageLoader />}><ImageCompressorTool /></Suspense>} />
          <Route path="/image-resize" element={<Suspense fallback={<PageLoader />}><ImageResizeTool /></Suspense>} />
          <Route path="/image-crop" element={<Suspense fallback={<PageLoader />}><ImageCropTool /></Suspense>} />
          <Route path="/background-remover" element={<Suspense fallback={<PageLoader />}><BackgroundRemoverTool /></Suspense>} />
          <Route path="/whatsapp-status-generator" element={<Suspense fallback={<PageLoader />}><WhatsAppStatusTool /></Suspense>} />
          <Route path="/image-base64" element={<Suspense fallback={<PageLoader />}><ImageBase64Tool /></Suspense>} />
          <Route path="/image-dpi-checker" element={<Suspense fallback={<PageLoader />}><ImageDPITool /></Suspense>} />
          <Route path="/exif-viewer" element={<Suspense fallback={<PageLoader />}><EXIFViewerTool /></Suspense>} />
          <Route path="/favicon-generator" element={<Suspense fallback={<PageLoader />}><FaviconGeneratorTool /></Suspense>} />
          <Route path="/image-to-pdf" element={<Suspense fallback={<PageLoader />}><ImageToPDFTool /></Suspense>} />
          <Route path="/image-to-word" element={<Suspense fallback={<PageLoader />}><ImageToWordTool /></Suspense>} />
          
          {/* PDF Tools */}
          <Route path="/pdf-merge" element={<Suspense fallback={<PageLoader />}><PDFMergeTool /></Suspense>} />
          <Route path="/pdf-split" element={<Suspense fallback={<PageLoader />}><PDFSplitTool /></Suspense>} />
          <Route path="/pdf-to-png" element={<Suspense fallback={<PageLoader />}><PDFToImageTool /></Suspense>} />
          <Route path="/pdf-password" element={<Suspense fallback={<PageLoader />}><PDFPasswordTool /></Suspense>} />
          <Route path="/pdf-unlock" element={<Suspense fallback={<PageLoader />}><PDFUnlockTool /></Suspense>} />
          <Route path="/pdf-page-remover" element={<Suspense fallback={<PageLoader />}><PDFPageRemoverTool /></Suspense>} />
          <Route path="/pdf-rotate" element={<Suspense fallback={<PageLoader />}><PDFRotateTool /></Suspense>} />
          <Route path="/pdf-to-word" element={<Suspense fallback={<PageLoader />}><PDFToWordTool /></Suspense>} />
          <Route path="/pdf-to-powerpoint" element={<Suspense fallback={<PageLoader />}><PDFToPowerPointTool /></Suspense>} />
          <Route path="/pdf-to-excel" element={<Suspense fallback={<PageLoader />}><PDFToExcelTool /></Suspense>} />
          <Route path="/word-to-pdf" element={<Suspense fallback={<PageLoader />}><WordToPDFTool /></Suspense>} />
          <Route path="/powerpoint-to-pdf" element={<Suspense fallback={<PageLoader />}><PowerPointToPDFTool /></Suspense>} />
          <Route path="/html-to-pdf" element={<Suspense fallback={<PageLoader />}><HTMLToPDFTool /></Suspense>} />
          
          {/* Video Tools */}
          <Route path="/video-to-audio" element={<Suspense fallback={<PageLoader />}><VideoToAudioTool /></Suspense>} />
          <Route path="/video-trim" element={<Suspense fallback={<PageLoader />}><VideoTrimTool /></Suspense>} />
          <Route path="/video-speed" element={<Suspense fallback={<PageLoader />}><VideoSpeedTool /></Suspense>} />
          <Route path="/video-thumbnail" element={<Suspense fallback={<PageLoader />}><VideoThumbnailTool /></Suspense>} />
          <Route path="/video-resolution" element={<Suspense fallback={<PageLoader />}><VideoResolutionTool /></Suspense>} />
          
          {/* Audio Tools */}
          <Route path="/audio-converter" element={<Suspense fallback={<PageLoader />}><AudioConverterTool /></Suspense>} />
          <Route path="/speech-to-text" element={<Suspense fallback={<PageLoader />}><SpeechToTextTool /></Suspense>} />
          <Route path="/audio-trimmer" element={<Suspense fallback={<PageLoader />}><AudioTrimmerTool /></Suspense>} />
          <Route path="/audio-merger" element={<Suspense fallback={<PageLoader />}><AudioMergerTool /></Suspense>} />
          <Route path="/audio-speed" element={<Suspense fallback={<PageLoader />}><AudioSpeedTool /></Suspense>} />
          
          {/* Text Tools */}
          <Route path="/word-counter" element={<Suspense fallback={<PageLoader />}><WordCounterTool /></Suspense>} />
          <Route path="/case-converter" element={<Suspense fallback={<PageLoader />}><CaseConverterTool /></Suspense>} />
          <Route path="/markdown-to-html" element={<Suspense fallback={<PageLoader />}><MarkdownHTMLTool /></Suspense>} />
          <Route path="/remove-spaces" element={<Suspense fallback={<PageLoader />}><RemoveSpacesTool /></Suspense>} />
          <Route path="/line-sorter" element={<Suspense fallback={<PageLoader />}><LineSorterTool /></Suspense>} />
          <Route path="/duplicate-remover" element={<Suspense fallback={<PageLoader />}><DuplicateRemoverTool /></Suspense>} />
          <Route path="/text-summarizer" element={<Suspense fallback={<PageLoader />}><TextSummarizerTool /></Suspense>} />
          <Route path="/text-diff" element={<Suspense fallback={<PageLoader />}><TextDiffTool /></Suspense>} />
          
          {/* Security Tools */}
          <Route path="/password-generator" element={<Suspense fallback={<PageLoader />}><PasswordGeneratorTool /></Suspense>} />
          <Route path="/password-strength" element={<Suspense fallback={<PageLoader />}><PasswordStrengthTool /></Suspense>} />
          <Route path="/hash-generator" element={<Suspense fallback={<PageLoader />}><HashGeneratorTool /></Suspense>} />
          <Route path="/base64-encoder" element={<Suspense fallback={<PageLoader />}><Base64Tool /></Suspense>} />
          <Route path="/uuid-generator" element={<Suspense fallback={<PageLoader />}><UUIDGeneratorTool /></Suspense>} />
          <Route path="/password-strength-explainer" element={<Suspense fallback={<PageLoader />}><PasswordStrengthExplainerTool /></Suspense>} />
          <Route path="/data-breach-email-checker" element={<Suspense fallback={<PageLoader />}><DataBreachEmailCheckerTool /></Suspense>} />
          <Route path="/file-hash-comparison" element={<Suspense fallback={<PageLoader />}><FileHashComparisonTool /></Suspense>} />
          <Route path="/exif-location-remover" element={<Suspense fallback={<PageLoader />}><EXIFLocationRemoverTool /></Suspense>} />
          <Route path="/text-redaction" element={<Suspense fallback={<PageLoader />}><TextRedactionTool /></Suspense>} />
          <Route path="/qr-phishing-scanner" element={<Suspense fallback={<PageLoader />}><QRPhishingScannerTool /></Suspense>} />
          <Route path="/secure-notes" element={<Suspense fallback={<PageLoader />}><SecureNotesTool /></Suspense>} />
          <Route path="/url-reputation-checker" element={<Suspense fallback={<PageLoader />}><URLReputationCheckerTool /></Suspense>} />
          
          {/* Date & Time Tools */}
          <Route path="/age-calculator" element={<Suspense fallback={<PageLoader />}><AgeCalculatorTool /></Suspense>} />
          <Route path="/date-difference" element={<Suspense fallback={<PageLoader />}><DateDifferenceTool /></Suspense>} />
          <Route path="/working-days-calculator" element={<Suspense fallback={<PageLoader />}><WorkingDaysTool /></Suspense>} />
          <Route path="/countdown-timer" element={<Suspense fallback={<PageLoader />}><CountdownTimerTool /></Suspense>} />
          <Route path="/world-time" element={<Suspense fallback={<PageLoader />}><WorldTimeTool /></Suspense>} />
          
          {/* Developer Tools */}
          <Route path="/json-formatter" element={<Suspense fallback={<PageLoader />}><JSONFormatterTool /></Suspense>} />
          <Route path="/regex-tester" element={<Suspense fallback={<PageLoader />}><RegexTesterTool /></Suspense>} />
          <Route path="/url-encoder" element={<Suspense fallback={<PageLoader />}><URLEncoderTool /></Suspense>} />
          <Route path="/color-converter" element={<Suspense fallback={<PageLoader />}><ColorConverterTool /></Suspense>} />
          <Route path="/lorem-ipsum-generator" element={<Suspense fallback={<PageLoader />}><LoremGeneratorTool /></Suspense>} />
          <Route path="/jwt-decoder" element={<Suspense fallback={<PageLoader />}><JWTDecoderTool /></Suspense>} />
          <Route path="/cron-generator" element={<Suspense fallback={<PageLoader />}><CronGeneratorTool /></Suspense>} />
          <Route path="/http-header-checker" element={<Suspense fallback={<PageLoader />}><HTTPHeaderTool /></Suspense>} />
          <Route path="/token-calculator" element={<Suspense fallback={<PageLoader />}><TokenCalculatorTool /></Suspense>} />
          <Route path="/color-palettes" element={<Suspense fallback={<PageLoader />}><ColorPalettesTool /></Suspense>} />
          <Route path="/api-response-formatter" element={<Suspense fallback={<PageLoader />}><APIResponseFormatterTool /></Suspense>} />
          <Route path="/json-to-typescript-interface" element={<Suspense fallback={<PageLoader />}><JsonToTypeScriptTool /></Suspense>} />
          <Route path="/sql-query-beautifier" element={<Suspense fallback={<PageLoader />}><SQLQueryBeautifierTool /></Suspense>} />
          <Route path="/jwt-token-expiry-calculator" element={<Suspense fallback={<PageLoader />}><JWTExpiryTool /></Suspense>} />
          <Route path="/environment-variable-generator" element={<Suspense fallback={<PageLoader />}><EnvironmentVariableTool /></Suspense>} />
          <Route path="/postman-collection-generator" element={<Suspense fallback={<PageLoader />}><PostmanCollectionTool /></Suspense>} />
          <Route path="/dockerfile-generator" element={<Suspense fallback={<PageLoader />}><DockerfileGeneratorTool /></Suspense>} />
          <Route path="/curl-to-axios-converter" element={<Suspense fallback={<PageLoader />}><CurlToAxiosTool /></Suspense>} />
          <Route path="/http-status-code-explainer" element={<Suspense fallback={<PageLoader />}><HTTPStatusCodeTool /></Suspense>} />
          
          {/* Internet Tools */}
          <Route path="/ip-lookup" element={<Suspense fallback={<PageLoader />}><IPLookupTool /></Suspense>} />
          <Route path="/user-agent-parser" element={<Suspense fallback={<PageLoader />}><UserAgentTool /></Suspense>} />
          <Route path="/dns-lookup" element={<Suspense fallback={<PageLoader />}><DNSLookupTool /></Suspense>} />
          <Route path="/ssl-checker" element={<Suspense fallback={<PageLoader />}><SSLCheckerTool /></Suspense>} />
          <Route path="/website-ping" element={<Suspense fallback={<PageLoader />}><WebsitePingTool /></Suspense>} />
          <Route path="/website-screenshot" element={<Suspense fallback={<PageLoader />}><WebsiteScreenshotTool /></Suspense>} />
          
          {/* Education Tools */}
          <Route path="/scientific-calculator" element={<Suspense fallback={<PageLoader />}><ScientificCalculatorTool /></Suspense>} />
          <Route path="/percentage-calculator" element={<Suspense fallback={<PageLoader />}><PercentageCalculatorTool /></Suspense>} />
          <Route path="/unit-converter" element={<Suspense fallback={<PageLoader />}><UnitConverterTool /></Suspense>} />
          <Route path="/compound-interest-calculator" element={<Suspense fallback={<PageLoader />}><CompoundInterestTool /></Suspense>} />
          <Route path="/simple-interest-calculator" element={<Suspense fallback={<PageLoader />}><SimpleInterestTool /></Suspense>} />
          <Route path="/cgpa-to-percentage" element={<Suspense fallback={<PageLoader />}><CGPAToPercentageTool /></Suspense>} />
          <Route path="/lcm-hcf-calculator" element={<Suspense fallback={<PageLoader />}><LCMHCFTool /></Suspense>} />
          <Route path="/study-timetable-generator" element={<Suspense fallback={<PageLoader />}><StudyTimetableTool /></Suspense>} />
          <Route path="/mcq-generator" element={<Suspense fallback={<PageLoader />}><MCQGeneratorTool /></Suspense>} />
          
          {/* Finance Tools */}
          <Route path="/emi-calculator" element={<Suspense fallback={<PageLoader />}><EMICalculatorTool /></Suspense>} />
          <Route path="/gst-calculator" element={<Suspense fallback={<PageLoader />}><GSTCalculatorTool /></Suspense>} />
          <Route path="/salary-calculator" element={<Suspense fallback={<PageLoader />}><SalaryCalculatorTool /></Suspense>} />
          <Route path="/currency-converter" element={<Suspense fallback={<PageLoader />}><CurrencyConverterTool /></Suspense>} />
          <Route path="/startup-burn-rate-calculator" element={<Suspense fallback={<PageLoader />}><StartupBurnRateCalculatorTool /></Suspense>} />
          <Route path="/saas-pricing-calculator" element={<Suspense fallback={<PageLoader />}><SaaSPricingCalculatorTool /></Suspense>} />
          <Route path="/emi-comparison" element={<Suspense fallback={<PageLoader />}><EMIComparisonTool /></Suspense>} />
          <Route path="/tax-slab-analyzer" element={<Suspense fallback={<PageLoader />}><TaxSlabAnalyzerTool /></Suspense>} />
          <Route path="/invoice-generator" element={<Suspense fallback={<PageLoader />}><InvoiceGeneratorTool /></Suspense>} />
          <Route path="/profit-margin-calculator" element={<Suspense fallback={<PageLoader />}><ProfitMarginCalculatorTool /></Suspense>} />
          <Route path="/freelancer-rate-calculator" element={<Suspense fallback={<PageLoader />}><FreelancerRateCalculatorTool /></Suspense>} />
          <Route path="/salary-breakup-generator" element={<Suspense fallback={<PageLoader />}><SalaryBreakupGeneratorTool /></Suspense>} />
          <Route path="/budget-planner" element={<Suspense fallback={<PageLoader />}><BudgetPlannerTool /></Suspense>} />
          <Route path="/stock-cagr-calculator" element={<Suspense fallback={<PageLoader />}><StockCAGRCalculatorTool /></Suspense>} />
          <Route path="/mutual-fund-calculator" element={<Suspense fallback={<PageLoader />}><MutualFundCalculatorTool /></Suspense>} />
          <Route path="/lumpsum-calculator" element={<Suspense fallback={<PageLoader />}><LumpsumCalculatorTool /></Suspense>} />
          
          {/* SEO Tools */}
          <Route path="/meta-title-description-generator" element={<Suspense fallback={<PageLoader />}><MetaTitleDescriptionTool /></Suspense>} />
          <Route path="/keyword-density-checker" element={<Suspense fallback={<PageLoader />}><KeywordDensityTool /></Suspense>} />
          <Route path="/robots-txt-generator" element={<Suspense fallback={<PageLoader />}><RobotsTxtTool /></Suspense>} />
          <Route path="/sitemap-validator" element={<Suspense fallback={<PageLoader />}><SitemapValidatorTool /></Suspense>} />
          <Route path="/page-speed-checklist-generator" element={<Suspense fallback={<PageLoader />}><PageSpeedChecklistTool /></Suspense>} />
          <Route path="/og-image-preview-tool" element={<Suspense fallback={<PageLoader />}><OGImagePreviewTool /></Suspense>} />
          <Route path="/broken-image-finder" element={<Suspense fallback={<PageLoader />}><BrokenImageFinderTool /></Suspense>} />
          <Route path="/utm-link-builder" element={<Suspense fallback={<PageLoader />}><UTMLinkBuilderTool /></Suspense>} />
          <Route path="/domain-age-checker" element={<Suspense fallback={<PageLoader />}><DomainAgeTool /></Suspense>} />
          <Route path="/tech-stack-detector" element={<Suspense fallback={<PageLoader />}><TechStackDetectorTool /></Suspense>} />
          <Route path="/page-seo-analyzer" element={<Suspense fallback={<PageLoader />}><PageSEOTool /></Suspense>} />
          
          {/* ZIP Tools */}
          <Route path="/create-zip" element={<Suspense fallback={<PageLoader />}><CreateZipTool /></Suspense>} />
          <Route path="/extract-zip" element={<Suspense fallback={<PageLoader />}><ExtractZipTool /></Suspense>} />
          <Route path="/password-zip" element={<Suspense fallback={<PageLoader />}><PasswordZipTool /></Suspense>} />
          <Route path="/compression-zip" element={<Suspense fallback={<PageLoader />}><CompressionZipTool /></Suspense>} />
          
          {/* Social Tools */}
          <Route path="/hashtag-generator" element={<Suspense fallback={<PageLoader />}><HashtagGeneratorTool /></Suspense>} />
          <Route path="/bio-generator" element={<Suspense fallback={<PageLoader />}><BioGeneratorTool /></Suspense>} />
          <Route path="/caption-formatter" element={<Suspense fallback={<PageLoader />}><CaptionFormatterTool /></Suspense>} />
          <Route path="/line-break-generator" element={<Suspense fallback={<PageLoader />}><LineBreakGeneratorTool /></Suspense>} />
          <Route path="/link-in-bio" element={<Suspense fallback={<PageLoader />}><LinkInBioTool /></Suspense>} />
          <Route path="/meme-generator" element={<Suspense fallback={<PageLoader />}><MemeGeneratorTool /></Suspense>} />
          
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Routes>
      </AnimatePresence>
    );
  };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
