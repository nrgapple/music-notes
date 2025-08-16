import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, FileAudio } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsLoading(true);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));

    if (audioFile) {
      try {
        await onFileUpload(audioFile);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    setIsLoading(false);
  }, [onFileUpload]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsLoading(true);
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
      setIsLoading(false);
    }
  }, [onFileUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto p-8"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
          isDragOver
            ? "border-primary bg-primary/5 scale-105"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? (
              <Upload className="w-8 h-8" />
            ) : isDragOver ? (
              <FileAudio className="w-8 h-8" />
            ) : (
              <Music className="w-8 h-8" />
            )}
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {isLoading ? 'Loading audio file...' : 'Upload your music'}
            </h3>
            <p className="text-muted-foreground">
              {isDragOver
                ? 'Drop your audio file here'
                : 'Drag and drop an audio file or click to browse'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Supported formats:</span>
            <div className="flex gap-1">
              {['MP3', 'WAV', 'OGG', 'M4A'].map((format) => (
                <span
                  key={format}
                  className="px-2 py-1 bg-muted rounded text-xs font-mono"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
