import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import ColoringCanvas from '../components/ColoringCanvas'
import Toolbar from '../components/Toolbar'

export default function Home() {
  const [brushSize, setBrushSize] = useState(10)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef(null)

  return (
    <div className="vh-100 d-flex flex-column">
      <Head>
        <title>Coloring App - Interactive Drawing</title>
        <meta name="description" content="A responsive coloring app built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toolbar
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        zoom={zoom}
        setZoom={setZoom}
        canvasRef={canvasRef}
      />

      <ColoringCanvas
        ref={canvasRef}
        brushSize={brushSize}
        currentColor={currentColor}
        zoom={zoom}
        setZoom={setZoom}
      />
    </div>
  )
}