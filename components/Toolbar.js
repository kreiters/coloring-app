import { useState } from 'react'

const colorPalette = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#008000', '#000080', '#800000'
]

export default function Toolbar({ 
  brushSize, 
  setBrushSize, 
  currentColor, 
  setCurrentColor, 
  zoom, 
  setZoom, 
  canvasRef 
}) {
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleUndo = () => {
    if (canvasRef.current && canvasRef.current.undo) {
      canvasRef.current.undo()
    }
  }

  const handleRedo = () => {
    if (canvasRef.current && canvasRef.current.redo) {
      canvasRef.current.redo()
    }
  }

  const handleClear = () => {
    if (canvasRef.current && canvasRef.current.clear) {
      canvasRef.current.clear()
    }
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file && canvasRef.current && canvasRef.current.importImage) {
      canvasRef.current.importImage(file)
    }
  }

  const handleExport = () => {
    if (canvasRef.current && canvasRef.current.exportImage) {
      canvasRef.current.exportImage()
    }
  }

  return (
    <div className="toolbar">
      <div className="container-fluid">
        <div className="row g-3 align-items-center">
          
          {/* Color Palette */}
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label fw-bold mb-2">Colors</label>
            <div className="color-palette">
              {colorPalette.map((color) => (
                <div
                  key={color}
                  className={`color-option ${currentColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="form-control form-control-color"
                style={{ width: '30px', height: '30px', padding: '1px' }}
                title="Custom color"
              />
            </div>
          </div>

          {/* Brush Size */}
          <div className="col-12 col-md-3 col-lg-2">
            <label className="form-label fw-bold">
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              className="form-range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
          </div>

          {/* Zoom Controls */}
          <div className="col-12 col-md-3 col-lg-2">
            <label className="form-label fw-bold">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              className="form-range"
              min="0.25"
              max="3"
              step="0.25"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>

          {/* Action Buttons */}
          <div className="col-12 col-lg-4">
            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleUndo}
                title="Undo"
              >
                ↶ Undo
              </button>
              
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleRedo}
                title="Redo"
              >
                ↷ Redo
              </button>
              
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleClear}
                title="Clear canvas"
              >
                🗑️ Clear
              </button>
              
              <label className="btn btn-outline-primary btn-sm">
                📁 Import
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button 
                className="btn btn-outline-success btn-sm"
                onClick={handleExport}
                title="Export image"
              >
                💾 Export
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}