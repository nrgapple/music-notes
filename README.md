# 🎵 Music Notes

A Flume-inspired web application for taking dynamic notes on songs with immersive waveform visualization, beat-synchronized effects, and cinematic note previews.

## ✨ Features

- **🎧 Audio Import**: Drag and drop or select audio files (MP3, WAV, OGG, M4A)
- **📊 Waveform Visualization**: Interactive canvas-based waveform with note markers
- **📝 Note System**: Add timestamped notes that sync with playback
- **👁️ Dual Views**: Toggle between waveform timeline and organized list view
- **🎬 Cinematic Note Previews**: Beat-synchronized note popups with dynamic animations
- **🎛️ Audio Visualizer**: Real-time frequency analysis with Flume-inspired particle effects
- **💫 Beat Detection**: Notes react to music with pulsing, floating, and pop animations
- **⌨️ Keyboard Shortcuts**: Efficient navigation and note-taking
- **📦 Project Export/Import**: Share projects as .mnz files with audio and notes included
- **🎨 Flume-Inspired Design**: Electric blues, ethereal purples, and space-age aesthetics
- **✨ Dynamic Effects**: Glassmorphism, gradient animations, and responsive visual feedback
- **💾 Local Storage**: Uses IndexedDB for reliable client-side persistence

## 🚀 Live Demo

Visit the live application: [https://music-notes.vercel.app](https://music-notes.vercel.app)

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **IndexedDB + sql.js** - Client-side database with SQL querying
- **Web Audio API** - Audio processing and waveform generation
- **Canvas API** - High-performance waveform visualization

## 🏗️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/adamgeiger/music-notes.git
cd music-notes

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Deploy!

### Environment Requirements

- **No server required** - Runs entirely in the browser
- **IndexedDB support** - Modern browsers (Chrome 23+, Firefox 10+, Safari 7+)
- **Web Audio API** - For waveform generation and audio processing

## 🎹 How to Use

### 1. Create a Project
- Upload an audio file (drag & drop or file picker)
- The app automatically creates a project with your song

### 2. Take Notes
- **Double-click** on the waveform to add notes at specific timestamps
- **Press 'N'** to add a note at the current playback position
- **Click** note markers to view/edit existing notes

### 3. Navigate & Play
- **Click** anywhere on the waveform to jump to that time
- **Spacebar** to play/pause
- **Left/Right arrows** to seek backward/forward
- **'V'** to toggle between waveform and list views

### 4. Share Projects
- **Export**: Hover over any project and click the download icon to export as `.mnz` file
- **Import**: Click "Import Project" to load a `.mnz` file from another device
- **What's included**: Original audio file, all notes with timestamps, and project metadata

### 5. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `N` | Add note at current time |
| `V` | Toggle waveform/list view |
| `?` | Show keyboard shortcuts |
| `←/→` | Seek backward/forward 5s |
| `Enter` | Save note edit |
| `Esc` | Cancel edit or close dialogs |

## 🔧 Architecture

- **Client-Side Only**: No backend required, all data stored locally
- **IndexedDB Storage**: Reliable persistence with large storage capacity
- **Separated Concerns**: Audio files stored as blobs, metadata in SQLite
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works on desktop and mobile devices

## 🐛 Debugging

The app includes built-in debugging tools accessible via browser console:

```javascript
// Check storage usage
await dbDebug.getStorageInfo()

// List all projects and notes
await dbDebug.listProjects()

// Test database connection
await dbDebug.testConnection()

// Clear all data (for testing)
await dbDebug.clearAllData()
```

## 📄 License

MIT License - feel free to use this project as inspiration for your own music analysis tools.

---

**Happy note-taking! 🎵**