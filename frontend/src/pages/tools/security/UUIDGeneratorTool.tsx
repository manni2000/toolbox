import { useState } from "react";
import { Copy, Check, RefreshCw, Key } from "lucide-react";
import { v4 as uuidv4, v1 as uuidv1 } from "uuid";
import ToolLayout from "@/components/layout/ToolLayout";

const UUIDGeneratorTool = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<"v4" | "v1">("v4");
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const generateUUIDs = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = version === "v4" ? uuidv4() : uuidv1();
      if (uppercase) uuid = uuid.toUpperCase();
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  const handleCopy = async (index: number) => {
    await navigator.clipboard.writeText(uuids[index]);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate unique UUIDs instantly"
      category="Security Tools"
      categoryPath="/category/security"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as "v4" | "v1")}
              className="input-tool"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Timestamp)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="input-tool"
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
              <span className="text-sm">Uppercase</span>
            </label>
          </div>
        </div>

        <button onClick={generateUUIDs} className="btn-primary w-full">
          <RefreshCw className="h-5 w-5" />
          Generate UUID{count > 1 ? "s" : ""}
        </button>

        {/* Results */}
        {uuids.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated UUIDs</h3>
              {uuids.length > 1 && (
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === -1 ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      All copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy all
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <code className="font-mono text-sm">{uuid}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                  >
                    {copied === index ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uuids.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <Key className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Click generate to create UUIDs
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default UUIDGeneratorTool;
