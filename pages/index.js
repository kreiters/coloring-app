import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import ColoringCanvas from '../components/ColoringCanvas'
import Toolbar from '../components/Toolbar'

export default function Home() {
  const [brushSize, setBrushSize] = useState(10)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [zoom, setZoom] = useState(1)
  const [fillMode, setFillMode] = useState(false)
  const canvasRef = useRef(null)

  return (
    <div className="vh-100 d-flex flex-column">
      <Head>
        <title>Coloring App - Interactive Drawing</title>
        <meta name="description" content="A responsive coloring app built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* PWA and native app appearance */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f8f9fa" />
        
        {/* Hide browser UI for fullscreen experience */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
      </Head>

      {/* Desktop Layout */}
      <div className="d-none d-lg-flex flex-row h-100">
        {/* Canvas Section - Left Half */}
        <div className="w-50 d-flex">
          <ColoringCanvas
            ref={canvasRef}
            brushSize={brushSize}
            currentColor={currentColor}
            zoom={zoom}
            setZoom={setZoom}
            fillMode={fillMode}
          />
        </div>
        
        {/* Controls Section - Right Half */}
        <div className="w-50 d-flex flex-column">
          {/* Title Bar */}
          <div className="bg-primary text-white p-3">
            <h2 className="h4 mb-0">🎨 Coloring Studio</h2>
            <small className="opacity-75">Digital Art & Coloring</small>
          </div>
          
          {/* Toolbar */}
          <div className="flex-grow-1 overflow-auto">
            <Toolbar
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              currentColor={currentColor}
              setCurrentColor={setCurrentColor}
              zoom={zoom}
              setZoom={setZoom}
              canvasRef={canvasRef}
              fillMode={fillMode}
              setFillMode={setFillMode}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="d-lg-none d-flex flex-column h-100">
        <Toolbar
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          zoom={zoom}
          setZoom={setZoom}
          canvasRef={canvasRef}
          fillMode={fillMode}
          setFillMode={setFillMode}
        />

        <ColoringCanvas
          ref={canvasRef}
          brushSize={brushSize}
          currentColor={currentColor}
          zoom={zoom}
          setZoom={setZoom}
          fillMode={fillMode}
        />
      </div>
    </div>
  )
}