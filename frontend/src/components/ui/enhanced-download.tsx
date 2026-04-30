import { useState } from "react";
import { Download, Copy, Share2, Eye, FileText, ImageIcon, Music2, Film, Check, Grid, List, ZoomIn, X } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    try {
      const link = document.createElement('a');
      
      if (url.startsWith('blob:')) {
        link.href = url;
      } else if (fileType === 'word') {
        const base64Data = url.startsWith('data:') ? url.split(',')[1] : url;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        link.href = URL.createObjectURL(blob);
      } else if (fileType === 'pdf') {
        const base64Data = url.startsWith('data:') ? url.split(',')[1] : url;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        link.href = URL.createObjectURL(blob);
      } else {
        link.href = url;
      }
      
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL if created
      if (link.href.startsWith('blob:')) {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      // console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download file. Please try again.",
        variant: "destructive",
      });
    }
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
        <div className="space-y-6">
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {multipleFiles.length} {multipleFiles.length === 1 ? 'file' : 'files'} converted
            </div>
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Files display */}
          {viewMode === 'grid' ? (
            /* Grid View - Professional Gallery */
            <div className={`grid gap-4 sm:gap-6 ${
              multipleFiles.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
              multipleFiles.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {multipleFiles.map((file, index) => (
                <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/20">
                  {/* Image Preview */}
                  {fileType === 'image' && file.url.startsWith('data:') && (
                    <div className="relative aspect-[3/4] sm:aspect-[4/3] overflow-hidden bg-muted/30">
                      <img
                        src={file.url}
                        alt={`Page ${file.page}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Overlay with page number */}
                      {multipleFiles.length > 1 && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-white border-0 text-xs">
                            Page {file.page}
                          </Badge>
                        </div>
                      )}
                      {/* Quick actions overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedImage(file.url)}
                          className="h-8 w-8 p-0 sm:h-10 sm:w-10"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadFile(file.url, file.name || 'download')}
                          className="h-8 w-8 p-0 sm:h-10 sm:w-10"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* File info */}
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {file.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                          </Badge>
                          {fileSize && (
                            <span className="text-xs text-muted-foreground">
                              {fileSize}
                            </span>
                          )}
                        </div>
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
            /* List View - Compact and Professional */
            <div className="space-y-3 max-w-4xl mx-auto">
              {multipleFiles.map((file, index) => (
                <Card key={index} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Thumbnail */}
                      {fileType === 'image' && file.url.startsWith('data:') && (
                        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/30 mx-auto sm:mx-0">
                          <img
                            src={file.url}
                            alt={`Page ${file.page}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* File info */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                          {multipleFiles.length > 1 && (
                            <Badge className={`${getFileColor()} variant="outline text-xs"`}>
                              Page {file.page}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                          <span>{fileType.toUpperCase()}</span>
                          {fileSize && <span>{fileSize}</span>}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        {fileType === 'image' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedImage(file.url)}
                            className="h-8 w-8 p-0"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => downloadFile(file.url, file.name || 'download')}
                          className="flex-1 sm:flex-none px-3 sm:px-4"
                        >
                          <Download className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="max-w-md mx-auto overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-8">
            <div className="space-y-6 text-center">
              {/* File Icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getFileColor()} mx-auto shadow-lg`}>
                {getFileIcon()}
              </div>
              
              {/* File Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-foreground">{fileName}</h4>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{fileType.toUpperCase()}</span>
                  {fileSize && <span>•</span>}
                  {fileSize && <span>{fileSize}</span>}
                  {pageCount && <span>•</span>}
                  {pageCount && <span>{pageCount} pages</span>}
                </div>
              </div>

              {/* Image Preview for image types */}
              {fileType === 'image' && data.startsWith('data:') && (
                <div className="rounded-xl border border-border overflow-hidden bg-muted/30 shadow-sm">
                  <img
                    src={data}
                    alt="Preview"
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
              )}
              
              {/* Action Button */}
              <Button
                onClick={() => downloadFile(data, fileName)}
                className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
