import { useRef } from "react";
import { Upload, Music } from "lucide-react";

interface AudioUploadZoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export const AudioUploadZone = ({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClick,
  onFileSelect,
  accept = "audio/*",
  maxSize = "100MB",
  multiple = false,
  title = "Drop audio file here or click to browse",
  subtitle = `Supports MP3, WAV, AAC, FLAC up to ${maxSize}`
}: AudioUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
    onClick();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (multiple) {
        Array.from(files).forEach(onFileSelect);
      } else if (files[0]) {
        onFileSelect(files[0]);
      }
    }
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleClick}
      className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${
          isDragging ? 'bg-primary/20' : 'bg-muted'
        }`}>
          <Music className={`w-8 h-8 md:w-10 md:h-10 ${
            isDragging ? 'text-primary' : 'text-muted-foreground'
          }`} />
        </div>

        <div>
          <p className="text-lg font-medium mb-1">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Choose Audio{multiple ? ' Files' : ' File'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        title={`Select ${multiple ? 'audio files' : 'an audio file'}`}
        aria-label="Audio file input"
      />
    </div>
  );
};