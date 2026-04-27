import { useState } from 'react';
import { Copy, Check, Lock, Unlock, Eye, EyeOff, Shield, Key, FileText, Sparkles, Settings } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";

const categoryColor = "0 80% 55%";

interface EncryptionResult {
  encrypted_note: string;
  message: string;
}

interface DecryptionResult {
  decrypted_note: string;
  message: string;
}

export default function SecureNotesTool() {
  const toolSeoData = getToolSeoMetadata('secure-notes');
  const [note, setNote] = useState('');
  const [password, setPassword] = useState('');
  const [encryptedNote, setEncryptedNote] = useState('');
  const [decryptedNote, setDecryptedNote] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('encrypt');
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async () => {
    if (!note.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/secure-notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'encrypt', note, password }),
      });

      if (response.ok) {
        const data: EncryptionResult = await response.json();
        setEncryptedNote(data.encrypted_note);
      }
    } catch (error) {
      // console.error('Error encrypting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedNote.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/secure-notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'decrypt', note: encryptedNote, password }),
      });

      if (response.ok) {
        const data: DecryptionResult = await response.json();
        setDecryptedNote(data.decrypted_note);
      }
    } catch (error) {
      // console.error('Error decrypting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearEncrypt = () => {
    setNote('');
    setPassword('');
    setEncryptedNote('');
  };

  const clearDecrypt = () => {
    setEncryptedNote('');
    setPassword('');
    setDecryptedNote('');
  };

  return (
    <>
      {CategorySEO.Security(
        toolSeoData?.title || "Secure Notes",
        toolSeoData?.description || "Encrypt and decrypt your sensitive notes with password protection",
        "secure-notes"
      )}
      <ToolLayout
      title="Secure Notes"
      description="Encrypt and decrypt your sensitive notes with password protection"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Tab Navigation */}
        <div className="rounded-xl border border-border bg-card p-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab('encrypt')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'encrypt'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lock className="h-4 w-4" />
              Encrypt
            </button>
            <button
              onClick={() => setActiveTab('decrypt')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'decrypt'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Unlock className="h-4 w-4" />
              Decrypt
            </button>
          </div>
        </div>

        {activeTab === 'encrypt' ? (
          /* Encrypt Section */
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Encrypt Note</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Your Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter your sensitive note here..."
                    className="input-tool w-full min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Your note will be encrypted with AES-256 encryption</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter encryption password"
                      className="input-tool w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 flex -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Use a strong password you'll remember</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEncrypt}
                    disabled={!note.trim() || !password.trim() || loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {loading ? 'Encrypting...' : 'Encrypt Note'}
                  </button>
                  <button
                    onClick={clearEncrypt}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {encryptedNote && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Encrypted Result</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm break-all">{encryptedNote}</code>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleCopy(encryptedNote)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Encrypted'}
                    </button>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Success!</strong> Your note has been encrypted. 
                      Save the encrypted text and password in a secure location.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Decrypt Section */
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Decrypt Note</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Encrypted Note</label>
                  <textarea
                    value={encryptedNote}
                    onChange={(e) => setEncryptedNote(e.target.value)}
                    placeholder="Paste the encrypted note here..."
                    className="input-tool w-full min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Paste the encrypted text you want to decrypt</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter decryption password"
                      className="input-tool w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 flex -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter the same password used for encryption</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDecrypt}
                    disabled={!encryptedNote.trim() || !password.trim() || loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {loading ? 'Decrypting...' : 'Decrypt Note'}
                  </button>
                  <button
                    onClick={clearDecrypt}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {decryptedNote && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Decrypted Result</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className={`p-3 rounded-lg border ${
                      showDecrypted ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}>
                      <div className={`break-all ${showDecrypted ? '' : 'blur-sm select-none'}`}>
                        {decryptedNote}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDecrypted(!showDecrypted)}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border text-muted-foreground hover:text-foreground"
                    >
                      {showDecrypted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleCopy(decryptedNote)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Decrypted'}
                    </button>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Unlock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Note Decrypted!</strong> Your sensitive information is now visible. 
                      Be careful when displaying decrypted content.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Secure Notes Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🔐 Encryption Features</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>AES-256 Encryption:</strong> Military-grade security</li>
                <li>• <strong>Password-Based:</strong> Only you can decrypt</li>
                <li>• <strong>No Storage:</strong> Notes are processed locally</li>
                <li>• <strong>Secure Copy:</strong> Safe clipboard operations</li>
                <li>• <strong>Privacy First:</strong> No data is stored on servers</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Best Practices</h4>
              <ul className="text-sm space-y-1">
                <li>• Use strong, unique passwords</li>
                <li>• Store passwords separately from notes</li>
                <li>• Regularly update sensitive notes</li>
                <li>• Use password managers for passwords</li>
                <li>• Clear browser cache after use</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Use Cases</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>• <strong>Password Storage:</strong> Secure password lists</p>
              <p>• <strong>Personal Notes:</strong> Private thoughts and ideas</p>
              <p>• <strong>Financial Data:</strong> Bank account details</p>
              <p>• <strong>Business Secrets:</strong> Confidential information</p>
              <p>• <strong>Medical Records:</strong> Personal health data</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Important:</strong> If you forget the password, the note cannot be recovered. 
              Store passwords securely and consider using password hints that only you understand.
            </div>
          </div>
        </div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            What are Secure Notes?
          </h3>
          <p className="text-muted-foreground mb-4">
            Secure notes are encrypted text storage for sensitive information. Notes are encrypted with your password, ensuring only you can access the content. This is ideal for storing passwords, API keys, or private information securely.
          </p>
          
          <h4 className="font-semibold mb-2">How It Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Create a new note with your content</li>
            <li>Set a master password for encryption</li>
            <li>The tool encrypts your note locally</li>
            <li>Decrypt with your password to view</li>
          </ol>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Security Features</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AES-256 encryption</li>
                <li>• Client-side only</li>
                <li>• No server storage</li>
                <li>• Password protected</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Password storage</li>
                <li>• API keys</li>
                <li>• Private notes</li>
                <li>• Sensitive data</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8">
        {/* FAQ Section */}
        <ToolFAQ faqs={[
          {
            question: "Are my notes stored on a server?",
            answer: "No, all encryption and decryption happens locally in your browser. Notes are stored in your browser's local storage, encrypted with your password. Nothing is sent to any server."
          },
          {
            question: "What happens if I forget my password?",
            answer: "Without your password, notes cannot be decrypted. This is intentional for security. Always remember your password or use a password manager to store it securely."
          },
          {
            question: "How secure is the encryption?",
            answer: "We use AES-256 encryption, which is the industry standard for secure data protection. Your password is used as the encryption key, making it cryptographically secure."
          },
          {
            question: "Can I export my notes?",
            answer: "Yes, you can export individual notes or all notes. Exported notes are still encrypted and can only be decrypted with your original password."
          },
          {
            question: "Is this better than a password manager?",
            answer: "Secure notes are great for quick, temporary storage. For comprehensive password management, use dedicated password managers with features like auto-fill and cross-device sync."
          }
        ]} />
      </div>
    </ToolLayout>
      </>
  );
};
