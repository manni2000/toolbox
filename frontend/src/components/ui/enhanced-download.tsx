import { useState } from "react";
import { Download, Copy, Share2, Eye, FileText, ImageIcon, Music2, Film, Check } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { useToast } from "@/hooks/use-toast";

interface EnhancedDownloadProps {
  data: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'word' | 'excel' | 'powerpoint' | 'zip' | 'audio' | 'video';
  title?: string;
  description?: string;
  fileSize?: string;
  dimensions?: { width: number; height: number };
  pageCount?: number;
  multipleFiles?: Array<{ url: string; name: string; page?: number }>;
}

export const EnhancedDownload = ({
  data,
  fileName,
  fileType,
  title,
  description,
  fileSize,
  dimensions,
  pageCount,
  multipleFiles
}: EnhancedDownloadProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'audio': return <Music2 className="h-5 w-5" />;
      case 'video': return <Film className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getFileColor = () => {
    switch (fileType) {
      case 'pdf': return 'bg-red-100 text-red-800 border-red-200';
      case 'image': return 'bg-green-100 text-green-800 border-green-200';
      case 'word': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excel': return 'bg-green-100 text-green-800 border-green-200';
      case 'powerpoint': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'zip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'audio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "File link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareFile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: description || `Check out this ${fileType} file`,
          url: data,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{title || 'Processing Complete'}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {multipleFiles && multipleFiles.length > 0 ? (
        <div className={`grid gap-4 ${multipleFiles.length === 1 ? 'grid-cols-1 justify-center' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-items-center'} max-w-7xl mx-auto w-full`}>
          {multipleFiles.map((file, index) => (
            <Card key={index} className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${multipleFiles.length === 1 ? 'max-w-md mx-auto w-full' : ''}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getFileColor()} variant="outline">
                      {file.page && `Page ${file.page}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {file.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{fileType.toUpperCase()}</span>
                    {fileSize && <span>•</span>}
                    {fileSize && <span>{fileSize}</span>}
                  </div>
                  <Button
                    onClick={() => downloadFile(file.url, file.name || 'download')}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-md mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor()} flex-shrink-0`}>
                  {getFileIcon()}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate text-foreground">{fileName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{fileType.toUpperCase()}</span>
                    {fileSize && <span>•</span>}
                    {fileSize && <span>{fileSize}</span>}
                    {pageCount && <span>•</span>}
                    {pageCount && <span>{pageCount} pages</span>}
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => downloadFile(data, fileName)}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
