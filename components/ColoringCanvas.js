import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const ColoringCanvas = forwardRef(({ brushSize, currentColor, zoom, setZoom }, ref) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  // Canvas dimensions
  const canvasWidth = 800
  const canvasHeight = 600

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    setContext(ctx)

    // Set canvas internal size to match what we expect
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Canvas dimensions are properly set

    // Set initial background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Load default image
    loadDefaultImage(ctx)

    // Save initial state to history
    saveToHistory(ctx)
  }, [zoom])

  const loadDefaultImage = (ctx) => {
    const img = new Image()
    img.onload = () => {
      // Clear canvas with white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // Calculate scaling to fit image in canvas while maintaining aspect ratio
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
      const x = (canvasWidth - img.width * scale) / 2
      const y = (canvasHeight - img.height * scale) / 2
      
      // Draw the image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      
      // Save to history after image loads
      saveToHistory(ctx)
    }
    
    img.onerror = () => {
      // Fallback: draw simple outline if image fails to load
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.rect(200, 150, 400, 300)
      ctx.moveTo(250, 200)
      ctx.lineTo(550, 200)
      ctx.moveTo(300, 250)
      ctx.lineTo(500, 250)
      ctx.stroke()
    }
    
    // Replace 'default-coloring.png' with your image filename
    img.src = '/honor.png'
  }

  const saveToHistory = (ctx) => {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    
    // For mouse events, use offsetX/offsetY
    if (e.offsetX !== undefined && e.offsetY !== undefined) {
      return { x: e.offsetX, y: e.offsetY }
    }
    
    // For touch events, calculate manually
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e
    
    const x = (touch.clientX - rect.left) * (canvas.width / canvas.clientWidth)
    const y = (touch.clientY - rect.top) * (canvas.height / canvas.clientHeight)
    
    return { x, y }
  }

  const getEventCoordinates = (e) => {
    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY }
    }
    return { clientX: e.clientX, clientY: e.clientY }
  }

  const updateCursor = (e) => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Position cursor exactly where the mouse is (not where drawing happens)
    // The drawing alignment is correct, we just need cursor to show at mouse position
    const { clientX, clientY } = getEventCoordinates(e)
    
    cursor.style.left = `${clientX - brushSize / 2}px`
    cursor.style.top = `${clientY - brushSize / 2}px`
    cursor.style.width = `${brushSize}px`
    cursor.style.height = `${brushSize}px`
    cursor.style.display = 'block'
  }

  const startDrawing = (e) => {
    e.preventDefault() // Prevent scrolling on touch devices
    
    const { clientX, clientY } = getEventCoordinates(e)
    
    // Handle panning for multi-touch or right/middle click
    if ((e.touches && e.touches.length > 1) || e.button === 1 || e.button === 2) {
      setIsPanning(true)
      setLastPanPoint({ x: clientX, y: clientY })
      return
    }

    setIsDrawing(true)
    const coords = getCanvasCoordinates(e)
    
    if (context) {
      context.beginPath()
      context.moveTo(coords.x, coords.y)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = currentColor
      context.lineWidth = brushSize
    }
  }

  const draw = (e) => {
    e.preventDefault() // Prevent scrolling on touch devices
    
    const { clientX, clientY } = getEventCoordinates(e)
    
    if (isPanning) {
      const deltaX = clientX - lastPanPoint.x
      const deltaY = clientY - lastPanPoint.y
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }))
      setLastPanPoint({ x: clientX, y: clientY })
      return
    }

    // Only show cursor for mouse events (not touch)
    if (!e.touches) {
      updateCursor(e)
    }

    if (!isDrawing || !context) return

    const coords = getCanvasCoordinates(e)
    context.lineTo(coords.x, coords.y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing && context) {
      context.closePath()
      saveToHistory(context)
    }
    setIsDrawing(false)
  }

  const handleMouseLeave = () => {
    const cursor = cursorRef.current
    if (cursor) cursor.style.display = 'none'
    stopDrawing()
  }

  const handleTouchCancel = () => {
    stopDrawing()
  }

  const handleWheel = (e) => {
    e.preventDefault() // Prevent page scroll
    
    // Get wheel direction (positive = zoom out, negative = zoom in)
    const delta = e.deltaY
    const zoomFactor = 0.1
    
    // Calculate new zoom level
    let newZoom = zoom
    if (delta > 0) {
      // Zoom out
      newZoom = Math.max(0.25, zoom - zoomFactor)
    } else {
      // Zoom in
      newZoom = Math.min(3, zoom + zoomFactor)
    }
    
    setZoom(newZoom)
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex > 0 && context) {
        const newIndex = historyIndex - 1
        context.putImageData(history[newIndex], 0, 0)
        setHistoryIndex(newIndex)
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1 && context) {
        const newIndex = historyIndex + 1
        context.putImageData(history[newIndex], 0, 0)
        setHistoryIndex(newIndex)
      }
    },
    clear: () => {
      if (context) {
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvasWidth, canvasHeight)
        loadDefaultImage(context)
        saveToHistory(context)
      }
    },
    importImage: (file) => {
      if (context) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            context.fillStyle = 'white'
            context.fillRect(0, 0, canvasWidth, canvasHeight)
            
            // Calculate scaling to fit image in canvas
            const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
            const x = (canvasWidth - img.width * scale) / 2
            const y = (canvasHeight - img.height * scale) / 2
            
            context.drawImage(img, x, y, img.width * scale, img.height * scale)
            saveToHistory(context)
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    exportImage: () => {
      const canvas = canvasRef.current
      if (canvas) {
        const link = document.createElement('a')
        link.download = 'coloring-art.png'
        link.href = canvas.toDataURL()
        link.click()
      }
    }
  }))

  const canvasStyle = {
    width: `${800 * zoom}px`,
    height: `${600 * zoom}px`
  }

  return (
    <div 
      ref={containerRef}
      className="canvas-container"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={canvasStyle}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={handleMouseLeave}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={handleTouchCancel}
        onWheel={handleWheel}
      />
      <div ref={cursorRef} className="custom-cursor" />
    </div>
  )
})

ColoringCanvas.displayName = 'ColoringCanvas'

export default ColoringCanvas