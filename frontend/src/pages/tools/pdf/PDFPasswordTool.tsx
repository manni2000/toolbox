import { useState, useRef } from "react";
import { Upload, Lock, Download, FileText, X, Eye, EyeOff, Loader2, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 70% 50%";

interface ConversionResult {
  success: boolean;
  file?: string;
  error?: string;
  filename?: string;
}

const PDFPasswordTool = () => {
  const toolSeoData = getToolSeoMetadata('pdf-password');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [protectedFile, setProtectedFile] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setProtectedFile(null);
    setConversionResult(null);
  };

  const protectPDF = async () => {
    if (!file || !isValid) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);
    formData.append('action', 'protect');

    try {
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PDF_PASSWORD}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProtectedFile(result.file);
        setConversionResult(result);
        toast({
          title: "Success!",
          description: "PDF has been password protected successfully.",
        });
        
        // Scroll to download section after successful protection
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to protect PDF');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to protect PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 4 && passwordsMatch;

  return (
    <>
      {CategorySEO.PDF(
        toolSeoData?.title || "PDF Password Protector",
        toolSeoData?.description || "Add password protection to your PDF files",
        "pdf-password"
      )}
      <ToolLayout
      title="PDF Password Protector"
      description="Add password protection to your PDF files"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {/* Keyword Tags Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-xl border border-border p-6"
        >
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <Lock className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">PDF Password Protector - Free Online</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add password protection to your PDF files. Secure your documents with strong encryption and access controls.
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">pdf password</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">protect pdf</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">pdf encryption</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">secure pdf</span>
              </div>
            </div>
          </div>
        </motion.div>
        {!file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            title="Drop your PDF here"
            subtitle="Add password protection"
          />
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base truncate">{file.name}</p>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted flex-shrink-0" title="Clear file">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="mb-4 font-semibold text-sm sm:text-base">Set Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-field w-full pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="input-field w-full"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={protectPDF}
              disabled={!isValid || isProcessing}
              className="btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Protecting PDF...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Protect PDF
                </>
              )}
            </button>

            {protectedFile && (
              <div ref={downloadSectionRef}>
                <EnhancedDownload
                  data={protectedFile}
                  fileName={conversionResult?.filename || file.name.replace('.pdf', '_protected.pdf')}
                  fileType="pdf"
                  title="PDF Protected Successfully"
                  description="Your PDF has been secured with password protection"
                  fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </div>
            )}
          </div>
        )}

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            What is PDF Password Protection?
          </h3>
          <p className="text-muted-foreground mb-4">
            PDF password protection adds security to your PDF documents by requiring a password to open or edit the file. This protects sensitive information from unauthorized access and controls who can modify the document.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload your PDF file</li>
            <li>Set a password for protection</li>
            <li>Choose protection level (open/edit)</li>
            <li>Download the protected PDF</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Protection Types</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• User password (open)</li>
                <li>• Owner password (edit)</li>
                <li>• Print restrictions</li>
                <li>• Copy restrictions</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Security Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Confidential documents</li>
                <li>• Legal contracts</li>
                <li>• Financial reports</li>
                <li>• Personal information</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "What's the difference between user and owner passwords?",
            answer: "User password requires a password to open the PDF. Owner password controls permissions like printing, copying, or editing. You can use both for comprehensive protection."
          },
          {
            question: "Can I remove the password later?",
            answer: "Yes, if you know the password, you can remove it using the PDF Unlock tool. Without the password, removal is extremely difficult and may not be possible."
          },
          {
            question: "How strong should my PDF password be?",
            answer: "Use strong passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols. Avoid common words or personal information for better security."
          },
          {
            question: "Does password protection affect file size?",
            answer: "Password protection adds minimal overhead to file size. The increase is negligible for most documents and shouldn't impact sharing or storage significantly."
          },
          {
            question: "Can I add passwords to already protected PDFs?",
            answer: "You'll need to remove the existing password first using the PDF Unlock tool, then add your new password. You cannot add a second password without removing the first one."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};

export default PDFPasswordTool;
