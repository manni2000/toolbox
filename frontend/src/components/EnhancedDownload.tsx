import { useState } from 'react';
import { Download, Copy, Check, FileDown, FileText } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface DownloadOption {
  label: string;
  format: string;
  icon?: React.ReactNode;
  action: () => void | Promise<void>;
}

interface EnhancedDownloadProps {
  options?: DownloadOption[];
  primaryAction?: () => void | Promise<void>;
  primaryLabel?: string;
  copyText?: string;
  showCopy?: boolean;
  fileName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

/**
 * Enhanced download/export component with multiple format support
 */
export const EnhancedDownload = ({
  options = [],
  primaryAction,
  primaryLabel = 'Download',
  copyText,
  showCopy = true,
  fileName,
  className,
  variant = 'default',
  size = 'default',
}: EnhancedDownloadProps) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.copied();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error({ title: 'Copy failed', description: 'Could not copy to clipboard' });
    }
  };

  const handlePrimaryDownload = async () => {
    if (!primaryAction) return;

    setIsDownloading(true);
    try {
      await primaryAction();
      toast.downloaded(fileName);
    } catch (error) {
      toast.error({ title: 'Download failed', description: 'Could not download file' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOptionDownload = async (option: DownloadOption) => {
    try {
      await option.action();
      toast.downloaded(`${fileName || 'file'}.${option.format}`);
    } catch (error) {
      toast.error({ title: 'Download failed', description: `Could not download ${option.format}` });
    }
  };

  // Single download button (no options)
  if (options.length === 0 && !showCopy) {
    return (
      <Button
        onClick={handlePrimaryDownload}
        disabled={isDownloading}
        variant={variant}
        size={size}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        {isDownloading ? 'Downloading...' : primaryLabel}
      </Button>
    );
  }

  // Download with copy button
  if (options.length === 0 && showCopy && copyText) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Button
          onClick={handlePrimaryDownload}
          disabled={isDownloading}
          variant={variant}
          size={size}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Downloading...' : primaryLabel}
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          size={size}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="sr-only">Copy</span>
        </Button>
      </div>
    );
  }

  // Multiple download options with dropdown
  return (
    <div className={cn('flex gap-2', className)}>
      {showCopy && copyText && (
        <Button onClick={handleCopy} variant="outline" size={size}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      )}

      {options.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={variant} size={size} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {primaryLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {options.map((option, index) => (
              <div key={index}>
                {index > 0 && index % 3 === 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => handleOptionDownload(option)}>
                  {option.icon || <FileDown className="w-4 h-4 mr-2" />}
                  <span>{option.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground uppercase">
                    {option.format}
                  </span>
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : options.length === 1 ? (
        <Button
          onClick={() => handleOptionDownload(options[0])}
          variant={variant}
          size={size}
          className="flex-1"
        >
          {options[0].icon || <Download className="w-4 h-4 mr-2" />}
          {options[0].label}
        </Button>
      ) : (
        <Button
          onClick={handlePrimaryDownload}
          disabled={isDownloading}
          variant={variant}
          size={size}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Downloading...' : primaryLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Utility for downloading files
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Utility for downloading text as file
 */
export const downloadText = (text: string, filename: string, mimeType = 'text/plain') => {
  const blob = new Blob([text], { type: mimeType });
  downloadFile(blob, filename);
};

/**
 * Utility for downloading JSON
 */
export const downloadJSON = (data: Record<string, unknown>, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadText(json, filename, 'application/json');
};
