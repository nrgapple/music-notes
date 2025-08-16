import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Clock, Palette } from 'lucide-react';
import { formatTime } from '@/utils/audio';
import { cn } from '@/utils/cn';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, color?: string) => void;
  timestamp: number;
  initialContent?: string;
  initialColor?: string;
  title?: string;
}

const NOTE_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

export function NoteModal({
  isOpen,
  onClose,
  onSave,
  timestamp,
  initialContent = '',
  initialColor = '#3b82f6',
  title = 'Add Note'
}: NoteModalProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setSelectedColor(initialColor);
    }
  }, [isOpen, initialContent, initialColor]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), selectedColor);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTime(timestamp)}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's happening at this moment in the song?"
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                autoFocus
              />
              <div className="text-xs text-muted-foreground mt-1">
                Press Cmd/Ctrl + Enter to save
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Note Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all focus-ring",
                      selectedColor === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg transition-colors focus-ring",
                content.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Save Note
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
