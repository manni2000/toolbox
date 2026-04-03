import { useState, useRef } from "react";
import { Upload, Unlock, FileText, X, Key, Sparkles, AlertCircle, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ModernLoadingSpinner from "@/components/ModernLoadingSpinner";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const categoryColor = "0 70% 50%";

const PDFUnlockTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedPdf, setUnlockedPdf] = useState<Blob | null>(null);
  const [unlockedFileName, setUnlockedFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setError(null);
    setUnlockedPdf(null);
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

  const handleUnlock = async () => {
    if (!file || !password) return;
    
    setIsLoading(true);
    setError(null);
    setUnlockedPdf(null);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('password', password);
      
      const response = await fetch(API_URLS.PDF_UNLOCK, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const originalName = file.name.replace('.pdf', '');
        setUnlockedFileName(`${originalName}_unlocked.pdf`);
        setUnlockedPdf(blob);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unlock PDF');
      }
    } catch (err) {
      console.error('Error unlocking PDF:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedPdf) return;
    
    const url = URL.createObjectURL(unlockedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = unlockedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setError(null);
    setUnlockedPdf(null);
    setUnlockedFileName("");
  };

  return (
    <ToolLayout
      title="PDF Unlocker"
      description="Remove password protection from PDF files"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        {!file && (
          <PDFUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onFileSelect={handleFile}
            title="Drop password-protected PDF here"
            subtitle="You must know the password to unlock"
          />
        )}

        {file && !unlockedPdf && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <p className="font-medium">{file.name}</p>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted" title="Clear file">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Key className="h-5 w-5" />
                Enter Password
              </h3>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
                className="input-field w-full"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the password used to protect this PDF
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleUnlock}
              disabled={!password || isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5" />
                  Unlock PDF
                </>
              )}
            </button>
          </div>
        )}

        {unlockedPdf && (
          <div className="space-y-6">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Unlock className="h-8 w-8 text-green-500" />
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  PDF Unlocked Successfully!
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your PDF has been unlocked and is ready for download.
              </p>
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                Download Unlocked PDF
              </button>
            </div>

            <button
              onClick={reset}
              className="btn-secondary w-full"
            >
              Unlock Another PDF
            </button>
          </div>
        )}

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Important:</strong> This tool requires you to know the 
          original password. It cannot crack or bypass PDF security. Only use it to remove protection 
          from PDFs you have authorization to access.
        </div>
      </div>
    </ToolLayout>
  );
};

export default PDFUnlockTool;
