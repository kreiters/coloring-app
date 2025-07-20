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
  canvasRef,
  fillMode,
  setFillMode
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
        {/* Desktop Layout - Vertical */}
        <div className="d-none d-lg-block">
          <div className="row g-3">
            
            {/* Tool Selection */}
            <div className="col-12">
              <label className="form-label fw-bold">Tools</label>
              <div className="d-flex gap-2 mb-3">
                <button 
                  className={`btn ${!fillMode ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                  onClick={() => setFillMode(false)}
                  title="Brush Tool"
                >
                  🖌️ Brush
                </button>
                <button 
                  className={`btn ${fillMode ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                  onClick={() => setFillMode(true)}
                  title="Fill Tool"
                >
                  🪣 Fill
                </button>
              </div>
            </div>

            {/* Color Palette */}
            <div className="col-12">
              <label className="form-label fw-bold mb-2">Colors</label>
              <div className="color-palette mb-3">
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
            <div className="col-12">
              <label className="form-label fw-bold">
                Brush Size: {brushSize}px
              </label>
              <input
                type="range"
                className="form-range mb-3"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
            </div>

            {/* Zoom Controls */}
            <div className="col-12">
              <label className="form-label fw-bold">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                className="form-range mb-3"
                min="0.25"
                max="5"
                step="0.25"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
            </div>

            {/* Action Buttons */}
            <div className="col-12">
              <label className="form-label fw-bold mb-2">Actions</label>
              <div className="d-grid gap-2">
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={handleUndo}
                      title="Undo"
                    >
                      ↶ Undo
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={handleRedo}
                      title="Redo"
                    >
                      ↷ Redo
                    </button>
                  </div>
                </div>
                
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleClear}
                  title="Clear canvas"
                >
                  🗑️ Clear Canvas
                </button>
                
                <label className="btn btn-outline-primary" style={{ cursor: 'pointer' }}>
                  📁 Import Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button 
                  className="btn btn-outline-success"
                  onClick={handleExport}
                  title="Export image"
                >
                  💾 Export Image
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Layout - Horizontal */}
        <div className="d-lg-none">
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

            {/* Tool Selection */}
            <div className="col-12 col-md-2 col-lg-2">
              <div className="d-flex align-items-center gap-2">
                <label className="form-label fw-bold mb-0 text-nowrap">Tool:</label>
                <div className="d-flex gap-2 flex-fill">
                  <button 
                    className={`btn btn-sm ${!fillMode ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                    onClick={() => setFillMode(false)}
                    title="Brush Tool"
                  >
                    🖌️
                  </button>
                  <button 
                    className={`btn btn-sm ${fillMode ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                    onClick={() => setFillMode(true)}
                    title="Fill Tool"
                  >
                    🪣
                  </button>
                </div>
              </div>
            </div>

            {/* Brush Size */}
            <div className="col-12 col-md-3 col-lg-2">
              <div className="d-flex align-items-center gap-2">
                <label className="form-label fw-bold mb-0 text-nowrap">
                  Size: {brushSize}px
                </label>
                <input
                  type="range"
                  className="form-range flex-fill"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="col-12 col-md-3 col-lg-2">
              <div className="d-flex align-items-center gap-2">
                <label className="form-label fw-bold mb-0 text-nowrap">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  className="form-range flex-fill"
                  min="0.25"
                  max="5"
                  step="0.25"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="col-12 col-lg-4">
              <div className="d-flex w-100">
                <button 
                  className="btn btn-outline-secondary btn-sm flex-fill mx-1"
                  onClick={handleUndo}
                  title="Undo"
                >
                  Undo
                </button>
                
                <button 
                  className="btn btn-outline-secondary btn-sm flex-fill mx-1"
                  onClick={handleRedo}
                  title="Redo"
                >
                  Redo
                </button>
                
                <button 
                  className="btn btn-outline-danger btn-sm flex-fill mx-1"
                  onClick={handleClear}
                  title="Clear canvas"
                >
                  Clear
                </button>
                
                <label className="btn btn-outline-primary btn-sm flex-fill mx-1 d-flex align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
                  Import
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button 
                  className="btn btn-outline-success btn-sm flex-fill mx-1"
                  onClick={handleExport}
                  title="Export image"
                >
                  Export
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}