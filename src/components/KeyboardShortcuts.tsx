import React from 'react';
import { motion } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      category: "Playback",
      items: [
        { key: "Space", description: "Play / Pause" },
        { key: "←", description: "Seek backward 5 seconds" },
        { key: "→", description: "Seek forward 5 seconds" },
      ]
    },
    {
      category: "Notes",
      items: [
        { key: "N", description: "Add note at current time" },
        { key: "Double-click", description: "Add note at clicked position (waveform view)" },
        { key: "Click", description: "Select note or seek to position" },
      ]
    },
    {
      category: "Navigation",
      items: [
        { key: "V", description: "Toggle between waveform and list view" },
        { key: "?", description: "Show/hide keyboard shortcuts" },
        { key: "Esc", description: "Close dialogs or cancel editing" },
      ]
    },
    {
      category: "Editing",
      items: [
        { key: "Enter", description: "Save note edit" },
        { key: "Esc", description: "Cancel note edit" },
        { key: "Click note", description: "Start editing note content" },
      ]
    }
  ];

  return (
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
        className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">Master your workflow with these shortcuts</p>
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
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {shortcuts.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wide">
                  {category.category}
                </h3>
                
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {shortcut.key.split(' + ').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                            <kbd className="px-2 py-1 bg-muted text-xs font-mono rounded border border-border">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-background text-xs font-mono rounded border border-border">?</kbd> anytime to toggle this help
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
