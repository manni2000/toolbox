import { useState, useRef } from "react";
import { Upload, Lock, Download, FileText, X, Eye, EyeOff, Loader2 } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";

const PDFPasswordTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
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
  };

  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 4 && passwordsMatch;

  return (
    <ToolLayout
      title="PDF Password Protector"
      description="Add password protection to your PDF files"
      category="PDF Tools"
      categoryPath="/category/pdf"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-4">
            <Lock className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                Backend Required
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF encryption requires server-side processing. Enable Lovable Cloud to protect your PDFs.
              </p>
            </div>
          </div>
        </div>

        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground">Add password protection</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}

        {file && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <p className="font-medium">{file.name}</p>
              </div>
              <button onClick={reset} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold">Set Password</h3>
              
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
              disabled
              className="btn-primary w-full cursor-not-allowed opacity-50"
            >
              <Lock className="h-5 w-5" />
              Protect PDF
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Enable backend integration for PDF encryption
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PDFPasswordTool;
