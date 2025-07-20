# Coloring App

A responsive, interactive coloring application built with Next.js and Bootstrap. Perfect for both desktop and mobile devices.

## 🎨 Features

### Core Drawing Features
- **HTML5 Canvas Drawing**: Smooth, responsive drawing experience
- **Brush Size Control**: Adjustable brush size (1-50px) with real-time slider
- **Color Picker**: 16 preset colors plus custom color picker
- **Custom Cursor**: Visual brush cursor that matches selected brush size
- **Zoom & Pan**: Zoom in/out (25%-300%) with mouse panning support

### User Experience
- **Undo/Redo**: Full undo/redo functionality for mistake correction
- **Import Images**: Load your own images to color
- **Export Artwork**: Save your creations as PNG files
- **Default Coloring Page**: Loads with a simple flower design to get started
- **Clear Canvas**: Reset to original state with one click

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Bootstrap Integration**: Professional, mobile-first UI components
- **GitHub Pages Ready**: Configured for easy deployment
- **Modern React**: Built with React hooks and functional components

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/coloring-app.git
   cd coloring-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm run export
```

## 📁 Project Structure

```
coloring-app/
├── components/           # React components
│   ├── ColoringCanvas.js # Main canvas drawing component
│   └── Toolbar.js       # UI controls and tools
├── pages/               # Next.js pages
│   ├── _app.js         # App configuration
│   └── index.js        # Main page
├── public/             # Static assets
├── styles/             # CSS styles
│   └── globals.css     # Global styles and canvas styling
├── next.config.js      # Next.js configuration
└── package.json        # Dependencies and scripts
```

## 🎯 Architecture & Design Decisions

### Frontend Framework
- **Next.js**: Chosen for its excellent developer experience, built-in optimization, and easy deployment
- **React Hooks**: Modern functional components for clean, maintainable code
- **Bootstrap 5**: Responsive grid system and components for consistent UI

### Canvas Implementation
- **HTML5 Canvas API**: Direct pixel manipulation for smooth drawing performance
- **Mouse Event Handling**: Comprehensive mouse interaction for drawing and panning
- **Image Data Management**: Efficient undo/redo using canvas ImageData

### State Management
- **React useState**: Local component state for real-time drawing properties
- **useRef**: Direct DOM access for canvas operations and performance
- **History Management**: Custom implementation for undo/redo functionality

### Responsive Design
- **Mobile-First**: Bootstrap's mobile-first approach ensures great mobile experience
- **Touch Support**: Canvas events work seamlessly with touch devices
- **Flexible Layout**: Toolbar adapts to different screen sizes

## 🛠️ Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run export` - Export static files for deployment
- `npm run lint` - Run ESLint (when configured)

### Deployment to GitHub Pages

The project is pre-configured for GitHub Pages deployment:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

3. **Deploy**
   ```bash
   npm run export
   ```

## 🎨 Usage Guide

### Basic Drawing
1. Select a color from the palette or use the custom color picker
2. Adjust brush size with the slider
3. Click and drag on the canvas to draw
4. Use zoom controls to work on details

### Advanced Features
- **Pan**: Hold middle mouse button and drag to pan around the canvas
- **Undo/Redo**: Use the toolbar buttons or keyboard shortcuts
- **Import**: Click "Import" to load your own image
- **Export**: Click "Export" to save your artwork

## 🔧 Customization

### Adding New Colors
Edit the `colorPalette` array in `components/Toolbar.js`:

```javascript
const colorPalette = [
  '#000000', '#FFFFFF', '#FF0000', // ... add your colors
]
```

### Changing Default Image
Modify the `loadDefaultImage` function in `components/ColoringCanvas.js` to draw your preferred default image.

### Styling
- Global styles: `styles/globals.css`
- Component-specific styles: Inline styles in components
- Bootstrap classes: Applied directly to components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

See [FEATURES.md](FEATURES.md) for a list of planned features and improvements.