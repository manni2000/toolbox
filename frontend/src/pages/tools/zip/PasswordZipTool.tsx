import { useState, useRef } from "react";
import { Lock, Upload, X, Loader2, FileText, Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { useToast } from "@/hooks/use-toast";
import { API_URLS } from "@/lib/api-complete";
import { EnhancedDownload } from "@/components/ui/enhanced-download";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "280 70% 55%";

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
      const response = await fetch(`${API_URLS.BASE_URL}${API_URLS.PASSWORD_ZIP}`, {
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
        {/* Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}
            >
              <Lock className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Password-Protected ZIP</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create encrypted ZIP archives with strong password protection</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-6 shadow-lg"
          style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
        >
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""} p-6 sm:p-8`}
          >
            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Drop files here</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Select multiple files to create password-protected ZIP</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              aria-label="Upload files to create password-protected ZIP"
              title="Upload files"
            />
          </div>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-lg"
            style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
          >
            <h3 className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Files to ZIP ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 rounded-lg bg-muted/50 p-2 sm:p-3"
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
                  <span className="flex-1 truncate text-xs sm:text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                    className="rounded-lg p-1 text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Password Fields */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-lg"
          style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-tool text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-tool text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Encryption Method */}
          <div className="mt-4">
            <label htmlFor="encryption-method" className="mb-2 block text-xs sm:text-sm font-medium">Encryption Method</label>
            <select
              id="encryption-method"
              title="Encryption Method"
              value={encryptionMethod}
              onChange={(e) => setEncryptionMethod(e.target.value)}
              className="input-tool text-sm sm:text-base"
            >
              <option value="aes256">AES-256 (Strongest)</option>
              <option value="aes128">AES-128</option>
              <option value="standard">Standard ZIP</option>
            </select>
          </div>
        </motion.div>

        {/* Create Button */}
        <motion.button
          type="button"
          onClick={createPasswordZip}
          disabled={isProcessing || files.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl py-3 sm:py-4 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          style={{ background: `linear-gradient(135deg, hsl(${categoryColor}), hsl(${categoryColor} / 0.8))` }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              Creating Protected ZIP...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Create Protected ZIP
            </>
          )}
        </motion.button>

        {/* Download Section */}
        {zipData && (
          <motion.div
            ref={downloadSectionRef}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-center">Protected ZIP Created</h3>
            <div className="rounded-2xl border border-border bg-card/50 overflow-hidden shadow-lg" style={{ boxShadow: `0 4px 20px hsl(${categoryColor} / 0.1)` }}>
              <div className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-32 h-32 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${categoryColor} / 0.1)` }}>
                    <FileText className="h-16 w-16" style={{ color: `hsl(${categoryColor})` }} />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Your password-protected ZIP is ready</p>
                  <p className="font-medium">{fileName.replace(/\.[^/.]+$/, "_protected.zip")}</p>
                </div>
                
                <EnhancedDownload
                  data={zipData}
                  fileName={fileName ? fileName.replace(/\.[^/.]+$/, "_protected.zip") : "protected_archive.zip"}
                  fileType="zip"
                  title="Password-Protected ZIP Created Successfully"
                  description={`${files.length} file(s) encrypted with ${encryptionMethod.toUpperCase()} protection`}
                  fileSize={(() => {
                    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
                    if (totalSize < 1024) return `${totalSize} B`;
                    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
                    return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
                  })()}
                />
                
                <motion.button
                  type="button"
                  onClick={reset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 w-full mt-4"
                >
                  <X className="h-5 w-5" />
                  Create Another
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <h4 className="font-semibold text-amber-600 dark:text-amber-400">Security Note</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Your password is only used to encrypt the ZIP file and is never stored or transmitted to our servers.
            Keep your password safe as it cannot be recovered.
          </p>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card/50 p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Use AES-256 for maximum security
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Choose a strong password with at least 6 characters
            </li>
            <li className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
              Your files never leave your device unencrypted
            </li>
          </ul>
        </motion.div>

        {/* FAQ Section */}
        <ToolFAQ />
      </div>
    </ToolLayout>
  );
};

export default PasswordZipTool;
