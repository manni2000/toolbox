import { useState } from 'react';
import { Copy, Check, FileText, Shield, Eye, EyeOff } from 'lucide-react';
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";

interface RedactionItem {
  type: string;
  value: string;
}

interface RedactionResult {
  original_text: string;
  redacted_text: string;
  items_found: number;
  redacted_items: RedactionItem[];
}

export default function TextRedactionTool() {
  const [text, setText] = useState('');
  const [redactionTypes, setRedactionTypes] = useState({
    email: true,
    phone: true,
    ssn: true,
    credit_card: true,
  });
  const [result, setResult] = useState<RedactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const redactText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/security/text-redaction/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, redactionTypes }),
      });

      if (response.ok) {
        const data: RedactionResult = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error redacting text:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Text Redaction Result\n` +
      `Original Text: ${result.original_text}\n` +
      `Redacted Text: ${result.redacted_text}\n\n` +
      `Items Found: ${result.items_found}\n\n` +
      `Redacted Items:\n${result.redacted_items.map(item => '• ' + item.type + ': ' + item.value).join('\n')}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRedactionType = (type: string) => {
    setRedactionTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <ToolLayout
      title="Text Redaction Tool"
      description="Redact sensitive information from text documents"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Text Redaction</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Text to Redact</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to redact sensitive information..."
                className="input-tool w-full min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">Enter the text document to redact sensitive information</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Redaction Types</label>
              <div className="flex items-center gap-4">
                {Object.keys(redactionTypes).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={redactionTypes[type]}
                      onChange={() => toggleRedactionType(type)}
                      className="checkbox-tool"
                      id={`checkbox-${type}`}
                    />
                    <label htmlFor={`checkbox-${type}`} className="text-sm">{type.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={redactText} 
              disabled={!text.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Redacting...' : 'Redact Text'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Redaction Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Redaction Summary</h3>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm break-all">{result.redacted_text}</code>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Redacted'}
                  </button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <EyeOff className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>Success!</strong> Sensitive information has been redacted. 
                    Review the redacted text and ensure all necessary information is concealed.
                  </div>
                </div>
              </div>
            </div>

            {/* Redacted Items */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Redacted Items</h3>
              <div className="space-y-2">
                {result.redacted_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{item.type}: {item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Text Redaction Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🔍 Common Redaction Types</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>Email Addresses:</strong> user@example.com</li>
                <li>• <strong>Phone Numbers:</strong> (123) 456-7890</li>
                <li>• <strong>Social Security Numbers:</strong> 123-45-6789</li>
                <li>• <strong>Credit Card Numbers:</strong> 4111 1111 1111 1111</li>
                <li>• <strong>Bank Account Numbers:</strong> 123456789</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Best Practices</h4>
              <ul className="text-sm space-y-1">
                <li>• Review redacted text for accuracy</li>
                <li>• Double-check sensitive data is concealed</li>
                <li>• Use secure methods to share redacted documents</li>
                <li>• Regularly update redaction patterns</li>
                <li>• Educate team on redaction importance</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Redaction Process</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>1. <strong>Input Text:</strong> Enter the text document</p>
              <p>2. <strong>Select Types:</strong> Choose data types to redact</p>
              <p>3. <strong>Redact:</strong> Click to redact sensitive data</p>
              <p>4. <strong>Review:</strong> Ensure all data is properly redacted</p>
              <p>5. <strong>Save:</strong> Securely save the redacted document</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Shield className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Important:</strong> Redaction is critical for protecting sensitive information. 
              Always verify that all necessary data has been concealed before sharing documents.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
