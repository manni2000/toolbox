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
import ImageCompressorTool from "./pages/tools/image/ImageCompressorTool";
import ImageConverterTool from "./pages/tools/image/ImageConverterTool";
import ImageResizeTool from "./pages/tools/image/ImageResizeTool";

// Video Tools
import VideoDownloaderTool from "./pages/tools/video/VideoDownloaderTool";

// Text Tools
import WordCounterTool from "./pages/tools/text/WordCounterTool";
import CaseConverterTool from "./pages/tools/text/CaseConverterTool";
import MarkdownHTMLTool from "./pages/tools/text/MarkdownHTMLTool";

// Security Tools
import PasswordGeneratorTool from "./pages/tools/security/PasswordGeneratorTool";
import PasswordStrengthTool from "./pages/tools/security/PasswordStrengthTool";
import HashGeneratorTool from "./pages/tools/security/HashGeneratorTool";
import Base64Tool from "./pages/tools/security/Base64Tool";
import UUIDGeneratorTool from "./pages/tools/security/UUIDGeneratorTool";

// Date & Time Tools
import AgeCalculatorTool from "./pages/tools/date-time/AgeCalculatorTool";
import DateDifferenceTool from "./pages/tools/date-time/DateDifferenceTool";

// Developer Tools
import JSONFormatterTool from "./pages/tools/dev/JSONFormatterTool";
import RegexTesterTool from "./pages/tools/dev/RegexTesterTool";
import URLEncoderTool from "./pages/tools/dev/URLEncoderTool";
import ColorConverterTool from "./pages/tools/dev/ColorConverterTool";
import LoremGeneratorTool from "./pages/tools/dev/LoremGeneratorTool";

// Education Tools
import PercentageCalculatorTool from "./pages/tools/education/PercentageCalculatorTool";
import UnitConverterTool from "./pages/tools/education/UnitConverterTool";

// Finance Tools
import EMICalculatorTool from "./pages/tools/finance/EMICalculatorTool";
import GSTCalculatorTool from "./pages/tools/finance/GSTCalculatorTool";

// ZIP Tools
import CreateZipTool from "./pages/tools/zip/CreateZipTool";

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
          <Route path="/tools/image/compressor" element={<ImageCompressorTool />} />
          <Route path="/tools/image/converter" element={<ImageConverterTool />} />
          <Route path="/tools/image/resize" element={<ImageResizeTool />} />
          
          {/* Video Tools */}
          <Route path="/tools/video/downloader" element={<VideoDownloaderTool />} />
          
          {/* Text Tools */}
          <Route path="/tools/text/word-counter" element={<WordCounterTool />} />
          <Route path="/tools/text/case-converter" element={<CaseConverterTool />} />
          <Route path="/tools/text/markdown-html" element={<MarkdownHTMLTool />} />
          
          {/* Security Tools */}
          <Route path="/tools/security/password-generator" element={<PasswordGeneratorTool />} />
          <Route path="/tools/security/password-strength" element={<PasswordStrengthTool />} />
          <Route path="/tools/security/hash-generator" element={<HashGeneratorTool />} />
          <Route path="/tools/security/base64" element={<Base64Tool />} />
          <Route path="/tools/security/uuid-generator" element={<UUIDGeneratorTool />} />
          
          {/* Date & Time Tools */}
          <Route path="/tools/date-time/age-calculator" element={<AgeCalculatorTool />} />
          <Route path="/tools/date-time/date-difference" element={<DateDifferenceTool />} />
          
          {/* Developer Tools */}
          <Route path="/tools/dev/json-formatter" element={<JSONFormatterTool />} />
          <Route path="/tools/dev/regex-tester" element={<RegexTesterTool />} />
          <Route path="/tools/dev/url-encoder" element={<URLEncoderTool />} />
          <Route path="/tools/dev/color-converter" element={<ColorConverterTool />} />
          <Route path="/tools/dev/lorem-generator" element={<LoremGeneratorTool />} />
          
          {/* Education Tools */}
          <Route path="/tools/education/percentage-calculator" element={<PercentageCalculatorTool />} />
          <Route path="/tools/education/unit-converter" element={<UnitConverterTool />} />
          
          {/* Finance Tools */}
          <Route path="/tools/finance/emi-calculator" element={<EMICalculatorTool />} />
          <Route path="/tools/finance/gst-calculator" element={<GSTCalculatorTool />} />
          
          {/* ZIP Tools */}
          <Route path="/tools/zip/create" element={<CreateZipTool />} />
          
          {/* Social Tools */}
          <Route path="/tools/social/hashtag-generator" element={<HashtagGeneratorTool />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
