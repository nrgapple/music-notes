import { useHotkeys } from 'react-hotkeys-hook';

interface KeyboardShortcutsConfig {
  togglePlayback: () => void;
  addNote: () => void;
  toggleView: () => void;
  showShortcuts: () => void;
  seekBackward: () => void;
  seekForward: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  // Space - Toggle playback
  useHotkeys('space', (e) => {
    e.preventDefault();
    config.togglePlayback();
  }, { enableOnFormTags: false });

  // N - Add note at current time
  useHotkeys('n', (e) => {
    e.preventDefault();
    config.addNote();
  }, { enableOnFormTags: false });

  // V - Toggle view mode
  useHotkeys('v', (e) => {
    e.preventDefault();
    config.toggleView();
  }, { enableOnFormTags: false });

  // ? - Show shortcuts help
  useHotkeys('shift+/', (e) => {
    e.preventDefault();
    config.showShortcuts();
  }, { enableOnFormTags: false });

  // Arrow keys for seeking
  useHotkeys('left', (e) => {
    e.preventDefault();
    config.seekBackward();
  }, { enableOnFormTags: false });

  useHotkeys('right', (e) => {
    e.preventDefault();
    config.seekForward();
  }, { enableOnFormTags: false });
}
