# 🎵 Vib Music Notes

A modern web application for taking notes on songs with interactive waveform visualization and real-time note previews.

## ✨ Features

- **🎧 Audio Import**: Drag and drop or select audio files (MP3, WAV, OGG, M4A)
- **📊 Waveform Visualization**: Interactive canvas-based waveform with note markers
- **📝 Note System**: Add timestamped notes that sync with playback
- **👁️ Dual Views**: Toggle between waveform timeline and organized list view
- **🎬 Note Previews**: Video-like note popups during playback
- **⌨️ Keyboard Shortcuts**: Efficient navigation and note-taking
- **🎨 Modern UI**: Dark theme with smooth animations and responsive design
- **🎯 Precise Navigation**: Click to seek, double-click to add notes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## 🎹 How to Use

### 1. Import Audio
- Drag and drop an audio file onto the upload area
- Or click to browse and select a file
- Supported formats: MP3, WAV, OGG, M4A

### 2. Navigate the Waveform
- **Click** anywhere on the waveform to jump to that time
- **Double-click** to add a note at that position
- **Hover** to see timestamp preview
- Use the **progress bar** at the bottom for scrubbing

### 3. Manage Notes
- **Waveform View**: Notes appear as colored dots on the timeline
- **List View**: All notes organized chronologically with editing options
- **Click** a note to select/deselect it
- **Edit** notes by clicking the edit button or clicking on note content

### 4. Playback Experience
- Notes automatically appear during playback like video subtitles
- Real-time indicators show which notes are currently active
- Smooth animations and timing-based appearance

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `N` | Add note at current time |
| `V` | Toggle waveform/list view |
| `?` | Show keyboard shortcuts |
| `←/→` | Seek backward/forward |
| `Enter` | Save note edit |
| `Esc` | Cancel edit or close dialogs |

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Web Audio API** - Audio processing and waveform generation
- **HTML5 Audio** - Playback control
- **Canvas API** - Waveform visualization

## 🎨 Design Philosophy

- **Minimalist Interface**: Clean, distraction-free design focused on the music
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Theme**: Easy on the eyes during long listening sessions
- **Smooth Interactions**: Fluid animations and transitions
- **Keyboard-First**: Efficient workflows with comprehensive shortcuts

## 🔧 Architecture

The app is built with a modular component architecture:

- **Audio Management**: Custom hooks for playback control and waveform generation
- **Note Management**: State management for timestamped notes
- **View System**: Toggle between waveform and list presentations
- **Real-time Sync**: Notes synchronized with audio playback
- **Canvas Rendering**: High-performance waveform visualization

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

*Requires modern browser with Web Audio API support*

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this project as inspiration for your own music note-taking tools.

---

**Happy note-taking! 🎵**
