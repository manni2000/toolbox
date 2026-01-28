import { useState } from 'react';
import { Copy, Check, Upload, FileText, CheckCircle, XCircle, AlertTriangle, Hash } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api";

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
      console.error('Error comparing files:', error);
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
    <ToolLayout
      title="File Hash Comparison"
      description="Compare two files by their hash values to verify integrity"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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

          <button 
            onClick={compareFiles} 
            disabled={!file1 || !file2 || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <Hash className="h-4 w-4" />
            {loading ? 'Comparing...' : 'Compare Files'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
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
              <div className="rounded-xl border border-border bg-card p-6">
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

              <div className="rounded-xl border border-border bg-card p-6">
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
            <div className="rounded-xl border border-border bg-card p-6">
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
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
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
            <Hash className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Note:</strong> Hash values are unique digital fingerprints. 
              Even a single bit change in a file will produce completely different hash values.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
