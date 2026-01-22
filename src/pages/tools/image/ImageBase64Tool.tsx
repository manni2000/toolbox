import { useState, useRef } from "react";
import { Upload, Copy, Check, Image as ImageIcon, FileCode, Download } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const ImageBase64Tool = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState("");
  const [decodedImage, setDecodedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const decodeBase64 = () => {
    setError(null);
    try {
      let base64String = base64.trim();
      
      // Add data URL prefix if not present
      if (!base64String.startsWith("data:")) {
        base64String = `data:image/png;base64,${base64String}`;
      }

      // Validate by creating an image
      const img = new Image();
      img.onerror = () => setError("Invalid Base64 image data");
      img.onload = () => setDecodedImage(base64String);
      img.src = base64String;
    } catch {
      setError("Failed to decode Base64 string");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImage(null);
    setBase64("");
    setDecodedImage(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image ↔ Base64 Converter"
      description="Convert images to Base64 strings and vice versa"
      category="Image Tools"
      categoryPath="/category/image"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("encode"); reset(); }}
            className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
              mode === "encode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <ImageIcon className="mr-2 inline h-4 w-4" />
            Image → Base64
          </button>
          <button
            onClick={() => { setMode("decode"); reset(); }}
            className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all ${
              mode === "decode"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <FileCode className="mr-2 inline h-4 w-4" />
            Base64 → Image
          </button>
        </div>

        {mode === "encode" ? (
          <>
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`file-drop cursor-pointer ${isDragging ? "drag-over" : ""}`}
            >
              {image ? (
                <img src={image} alt="Uploaded" className="max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">Drop your image here</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WebP, GIF</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Base64 Output */}
            {base64 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">Base64 String</span>
                  <button onClick={handleCopy} className="btn-secondary">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  value={base64}
                  readOnly
                  className="input-field h-40 w-full resize-none font-mono text-xs"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Length: {base64.length.toLocaleString()} characters
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Base64 Input */}
            <div className="rounded-xl border border-border bg-card p-6">
              <label className="mb-3 block font-medium">Paste Base64 String</label>
              <textarea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="Paste your Base64 encoded image string here..."
                className="input-field h-40 w-full resize-none font-mono text-xs"
              />
            </div>

            <button onClick={decodeBase64} className="btn-primary w-full">
              <ImageIcon className="h-5 w-5" />
              Decode to Image
            </button>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Decoded Image */}
            {decodedImage && (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="mb-4 text-sm text-muted-foreground">Decoded Image:</p>
                <img
                  src={decodedImage}
                  alt="Decoded"
                  className="mx-auto max-h-64 rounded-lg object-contain"
                />
                <a
                  href={decodedImage}
                  download="decoded-image.png"
                  className="btn-secondary mt-4 inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageBase64Tool;
