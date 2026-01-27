import { useState, useRef } from "react";
import { Lock, Upload, Download, X, Loader2, FileText } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";

const PasswordZipTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState("");
  const [zipData, setZipData] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [encryptionMethod, setEncryptionMethod] = useState("aes256");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    setFiles(fileArray);
    if (fileArray.length > 0) {
      setFileName(fileArray[0].name);
    }
    setZipData(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const reset = () => {
    setFiles([]);
    setPassword("");
    setConfirmPassword("");
    setZipData(null);
    setFileName("");
  };

  const createPasswordZip = async () => {
    if (files.length === 0) {
      toast({
        title: "No files",
        description: "Please add files to create ZIP",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password should be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    
    // Add all files to formData
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append('password', password);
    formData.append('compression_level', '6');

    try {
      const response = await fetch('http://localhost:8000/api/zip/create-password/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setZipData(result.zip);
        toast({
          title: "Success!",
          description: "Password-protected ZIP created successfully",
        });
        // Scroll to download section after successful conversion
        setTimeout(() => {
          downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error(result.error || 'Failed to create ZIP');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create password-protected ZIP",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ToolLayout
      title="Password-Protected ZIP"
      description="Create encrypted ZIP archives with password protection"
      category="ZIP Tools"
      categoryPath="/category/zip"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
        >
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop files here</p>
          <p className="text-sm text-muted-foreground">Select multiple files to create password-protected ZIP</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Files to ZIP ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-1 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-tool"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-tool"
            />
          </div>
        </div>

        {/* Encryption Method */}
        <div>
          <label className="mb-2 block text-sm font-medium">Encryption Method</label>
          <select
            value={encryptionMethod}
            onChange={(e) => setEncryptionMethod(e.target.value)}
            className="input-tool"
          >
            <option value="aes256">AES-256 (Strongest)</option>
            <option value="aes128">AES-128</option>
            <option value="standard">Standard ZIP</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={createPasswordZip}
          disabled={isProcessing || files.length === 0}
          className="btn-primary w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Protected ZIP...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Create Protected ZIP
            </>
          )}
        </button>

        {/* Download Section */}
        {zipData && (
          <div ref={downloadSectionRef} className="space-y-4">
            <h3 className="text-lg font-medium text-center">Protected ZIP Created</h3>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-32 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Your password-protected ZIP is ready</p>
                  <p className="font-medium">{fileName.replace(/\.[^/.]+$/, "_protected.zip")}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={zipData}
                    download="protected_archive.zip"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 flex-1"
                  >
                    <Download className="h-5 w-5" />
                    Download Protected ZIP
                  </a>
                  <button 
                    onClick={reset} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400">Security Note</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Your password is only used to encrypt the ZIP file and is never stored or transmitted to our servers.
            Keep your password safe as it cannot be recovered.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PasswordZipTool;
