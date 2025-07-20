import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const ColoringCanvas = forwardRef(({ brushSize, currentColor, zoom }, ref) => {
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

    // Debug: Log actual canvas dimensions
    console.log('Canvas internal dimensions:', { width: canvas.width, height: canvas.height })
    console.log('Canvas CSS dimensions:', { 
      width: canvas.style.width, 
      height: canvas.style.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight
    })

    // Set initial background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Load default image
    loadDefaultImage(ctx)

    // Save initial state to history
    saveToHistory(ctx)
  }, [zoom])

  const loadDefaultImage = (ctx) => {
    // Create a simple default coloring page
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // Draw a simple flower outline
    ctx.beginPath()
    // Center circle
    ctx.arc(400, 300, 50, 0, 2 * Math.PI)
    // Petals
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const x = 400 + Math.cos(angle) * 80
      const y = 300 + Math.sin(angle) * 80
      ctx.moveTo(400, 300)
      ctx.arc(x, y, 30, 0, 2 * Math.PI)
    }
    // Stem
    ctx.moveTo(400, 350)
    ctx.lineTo(400, 500)
    // Leaves
    ctx.moveTo(380, 450)
    ctx.quadraticCurveTo(350, 430, 360, 470)
    ctx.moveTo(420, 450)
    ctx.quadraticCurveTo(450, 430, 440, 470)
    
    ctx.stroke()
  }

  const saveToHistory = (ctx) => {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Get the actual position relative to the canvas element
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top
    
    // Use the actual client dimensions (which account for border)
    const scaleX = canvas.width / canvas.clientWidth
    const scaleY = canvas.height / canvas.clientHeight
    
    const x = canvasX * scaleX
    const y = canvasY * scaleY
    
    // Debug logging to see what's happening
    console.log('Client coords:', { clientX, clientY })
    console.log('Canvas rect:', { left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    console.log('Canvas client dimensions:', { clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight })
    console.log('Canvas relative:', { canvasX, canvasY })
    console.log('Scale factors:', { scaleX, scaleY })
    console.log('Final coords:', { x, y })
    
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

  const updateCursor = (clientX, clientY) => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Position cursor exactly at mouse location with brush size
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
    const coords = getCanvasCoordinates(clientX, clientY)
    
    console.log('Starting to draw at canvas coords:', coords)
    
    if (context) {
      context.beginPath()
      context.moveTo(coords.x, coords.y)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = currentColor
      context.lineWidth = brushSize
      
      // Debug: Draw a small circle to show where we think we're drawing
      const originalFillStyle = context.fillStyle
      context.fillStyle = 'red'
      context.fillRect(coords.x - 2, coords.y - 2, 4, 4)
      context.fillStyle = originalFillStyle
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
      updateCursor(clientX, clientY)
    }

    if (!isDrawing || !context) return

    const coords = getCanvasCoordinates(clientX, clientY)
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
      />
      <div ref={cursorRef} className="custom-cursor" />
    </div>
  )
})

ColoringCanvas.displayName = 'ColoringCanvas'

export default ColoringCanvas