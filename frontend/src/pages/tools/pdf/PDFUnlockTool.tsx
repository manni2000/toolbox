import { useState, useRef } from "react";
import { Upload, Unlock, FileText, X, Key } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import { PDFUploadZone } from "@/components/ui/pdf-upload-zone";

const PDFUnlockTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
  };

  return (
    <ToolLayout
      title="PDF Unlocker"
      description="Remove password protection from PDF files"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <Unlock className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF decryption requires server-side processing. Enable Lovable Cloud to unlock your PDFs.
              </p>
            </div>
          </div>
        </div>

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

        {file && (
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

            <button
              disabled
              className="btn-primary w-full cursor-not-allowed opacity-50"
            >
              <Unlock className="h-5 w-5" />
              Unlock PDF
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for PDF decryption
            </p>
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
