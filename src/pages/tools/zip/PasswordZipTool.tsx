import { Lock, Upload, Info } from "lucide-react";
import ToolLayout from "@/components/layout/ToolLayout";

const PasswordZipTool = () => {
  return (
    <ToolLayout
      title="Password-Protected ZIP"
      description="Create encrypted ZIP archives with password protection"
      category="ZIP Tools"
      categoryPath="/category/zip"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Backend Processing Required</h3>
              <p className="mt-2 text-muted-foreground">
                Password-protected ZIP creation requires server-side processing. 
                JavaScript's JSZip library doesn't support AES encryption natively. 
                This tool needs a backend API to:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Accept file uploads</li>
                <li>Create ZIP with AES-256 encryption</li>
                <li>Apply password protection</li>
                <li>Return encrypted ZIP file</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="file-drop opacity-50 cursor-not-allowed">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Drop files here</p>
          <p className="text-sm text-muted-foreground">Requires backend integration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              disabled
              className="input-tool opacity-50"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              disabled
              className="input-tool opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Encryption Method</label>
          <select disabled className="input-tool opacity-50">
            <option>AES-256 (Strongest)</option>
            <option>AES-128</option>
            <option>ZipCrypto (Legacy)</option>
          </select>
        </div>

        <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
          <Lock className="h-5 w-5" />
          Create Protected ZIP
        </button>
      </div>
    </ToolLayout>
  );
};

export default PasswordZipTool;
