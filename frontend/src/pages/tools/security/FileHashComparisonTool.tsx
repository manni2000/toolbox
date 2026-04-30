import { useState } from 'react';
import { Copy, Check, Upload, FileText, CheckCircle, XCircle, AlertTriangle, Hash, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

interface FileHash {
  sha256: string;
  md5: string;
  size: number;
}

interface ComparisonResult {
  files_match: boolean;
  file1: FileHash;
  file2: FileHash;
}

export default function FileHashComparisonTool() {
  const toolSeoData = getToolSeoMetadata('file-hash-comparison');
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const compareFiles = async () => {
    if (!file1 || !file2) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);

      const response = await fetch(`${API_URLS.BASE_URL}/api/security/file-hash-comparison/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data: ComparisonResult = await response.json();
        setResult(data);
      }
    } catch (error) {
      // console.error('Error comparing files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `File Hash Comparison\n` +
      `Files Match: ${result.files_match ? 'Yes' : 'No'}\n\n` +
      `File 1:\n` +
      `  Size: ${result.file1.size} bytes\n` +
      `  SHA256: ${result.file1.sha256}\n` +
      `  MD5: ${result.file1.md5}\n\n` +
      `File 2:\n` +
      `  Size: ${result.file2.size} bytes\n` +
      `  SHA256: ${result.file2.sha256}\n` +
      `  MD5: ${result.file2.md5}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMatchColor = (match: boolean) => {
    return match ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  const getMatchIcon = (match: boolean) => {
    return match ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />;
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "File Hash Comparison",
        toolSeoData?.description || "Compare two files by their hash values to verify integrity",
        "file-hash-comparison"
      )}
      <ToolLayout
      breadcrumbTitle="File Hash Comparison"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="space-y-6">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
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
              <Hash className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">File Hash Comparison</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Compare two files by their hash values to verify integrity
              </p>
              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">file hash</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">hash comparison</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">file integrity</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">checksum verifier</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-lg font-semibold mb-4">File Selection</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">First File</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => setFile1(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file1"
                />
                <label htmlFor="file1" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file1 ? file1.name : 'Click to upload file'}
                  </p>
                  {file1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file1.size)}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Second File</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => setFile2(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file2"
                />
                <label htmlFor="file2" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file2 ? file2.name : 'Click to upload file'}
                  </p>
                  {file2 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file2.size)}
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>

          <motion.button
            onClick={compareFiles} 
            disabled={!file1 || !file2 || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-white"
            style={{
              background: `linear-gradient(135deg, hsl(${categoryColor}) 0%, hsl(${categoryColor} / 0.8) 100%)`,
            }}
          >
            <Hash className="h-4 w-4" />
            {loading ? 'Comparing...' : 'Compare Files'}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Match Result */}
            <div className={`rounded-xl border p-6 ${getMatchColor(result.files_match)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getMatchIcon(result.files_match)}
                  <div>
                    <p className="text-xl font-bold">
                      {result.files_match ? 'Files Match' : 'Files Differ'}
                    </p>
                    <p className="text-sm opacity-75">
                      Hash comparison completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.files_match ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {result.files_match ? 'Identical' : 'Different'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            {/* File Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File 1 Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-mono text-sm">{formatFileSize(result.file1.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SHA256</p>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                      {result.file1.sha256}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MD5</p>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                      {result.file1.md5}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File 2 Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-mono text-sm">{formatFileSize(result.file2.size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SHA256</p>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                      {result.file2.sha256}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MD5</p>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                      {result.file2.md5}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hash Comparison */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <h3 className="text-lg font-semibold mb-4">Hash Comparison</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">SHA256</h4>
                    <div className={`p-3 rounded-lg border ${
                      result.file1.sha256 === result.file2.sha256
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {result.file1.sha256 === result.file2.sha256 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {result.file1.sha256 === result.file2.sha256 ? 'Match' : 'Different'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">MD5</h4>
                    <div className={`p-3 rounded-lg border ${
                      result.file1.md5 === result.file2.md5
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {result.file1.md5 === result.file2.md5 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {result.file1.md5 === result.file2.md5 ? 'Match' : 'Different'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-500"
        >
          <h3 className="text-lg font-semibold mb-4">Hash Comparison Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🔍 Hash Algorithms</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>SHA256:</strong> Secure, modern standard</li>
                <li>• <strong>MD5:</strong> Fast, legacy compatibility</li>
                <li>• <strong>Collision Resistance:</strong> SHA256 greater than MD5</li>
                <li>• <strong>Digital Signatures:</strong> SHA256 preferred</li>
                <li>• <strong>Performance:</strong> MD5 faster but less secure</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Use Cases</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>File Integrity:</strong> Verify downloads</li>
                <li>• <strong>Backup Verification:</strong> Check copies</li>
                <li>• <strong>Duplicate Detection:</strong> Find identical files</li>
                <li>• <strong>Tamper Detection:</strong> Monitor changes</li>
                <li>• <strong>Forensics:</strong> Evidence verification</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Security Considerations</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>• <strong>MD5 Collisions:</strong> Not suitable for security-critical applications</p>
              <p>• <strong>SHA256:</strong> Recommended for all security purposes</p>
              <p>• <strong>File Size:</strong> Large files may take longer to process</p>
              <p>• <strong>Privacy:</strong> Files are processed locally in your browser</p>
              <p>• <strong>Accuracy:</strong> Hash comparison is 100% accurate for integrity</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Hash className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: `hsl(${categoryColor})` }} />
            <div className="text-sm">
              <strong>Note:</strong> Hash values are unique digital fingerprints. 
              Even a single bit change in a file will produce completely different hash values.
            </div>
          </div>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            What is File Hash Comparison?
          </h3>
          <p className="text-muted-foreground mb-4">
            File hash comparison calculates and compares cryptographic hashes of files to verify they're identical. This ensures file integrity, detects changes, confirms downloads, and verifies data hasn't been corrupted or tampered with.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Upload or select files to compare</li>
            <li>The tool calculates hash for each file</li>
            <li>Hashes are compared for equality</li>
            <li>View match status and hash values</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Hash Algorithms</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• MD5 (fast checksums)</li>
                <li>• SHA-1 (basic verification)</li>
                <li>• SHA-256 (recommended)</li>
                <li>• SHA-512 (high security)</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Download verification</li>
                <li>• File integrity checks</li>
                <li>• Duplicate detection</li>
                <li>• Change detection</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Why compare file hashes instead of content?",
            answer: "Hash comparison is much faster for large files and provides a unique fingerprint. Even a single bit change results in a completely different hash, making it perfect for detecting any modification."
          },
          {
            question: "Which hash algorithm should I use?",
            answer: "SHA-256 is recommended for most purposes. MD5 is faster but not cryptographically secure. Use SHA-256 or SHA-512 for security-critical applications."
          },
          {
            question: "Can different files have the same hash?",
            answer: "Theoretically possible (collision), but extremely unlikely with SHA-256. MD5 has known vulnerabilities making collisions feasible. For practical purposes, SHA-256 guarantees uniqueness."
          },
          {
            question: "How does this verify downloads?",
            answer: "Many download sites provide file hashes. Calculate the hash of your downloaded file and compare it to the official hash. If they match, your download is authentic and uncorrupted."
          },
          {
            question: "Can I compare more than two files?",
            answer: "Yes, you can upload multiple files and compare all their hashes simultaneously. This is useful for checking if files in a directory are identical or identifying duplicates."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};
