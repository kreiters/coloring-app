import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const ColoringCanvas = forwardRef(({ brushSize, currentColor, zoom, setZoom, fillMode }, ref) => {
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
  const [cursorCanvasPosition, setCursorCanvasPosition] = useState({ x: 0, y: 0 })
  const [isGesturing, setIsGesturing] = useState(false)
  const gestureTimeoutRef = useRef(null)

  // Canvas dimensions - responsive
  const [canvasWidth, setCanvasWidth] = useState(800)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [displayWidth, setDisplayWidth] = useState(800)
  const [displayHeight, setDisplayHeight] = useState(600)

  // Update canvas dimensions based on screen size
  useEffect(() => {
    const updateCanvasDimensions = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      // Calculate responsive dimensions while maintaining 4:3 aspect ratio
      const aspectRatio = 4 / 3
      let baseWidth, baseHeight
      
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than canvas aspect ratio
        baseHeight = Math.min(containerHeight * 0.85, 600)
        baseWidth = baseHeight * aspectRatio
      } else {
        // Container is taller than canvas aspect ratio  
        baseWidth = Math.min(containerWidth * 0.85, 800)
        baseHeight = baseWidth / aspectRatio
      }
      
      // Ensure minimum size for usability
      baseWidth = Math.max(baseWidth, 300)
      baseHeight = Math.max(baseHeight, 225)
      
      setDisplayWidth(baseWidth)
      setDisplayHeight(baseHeight)
      
      // Keep internal canvas size consistent for high quality
      setCanvasWidth(800)
      setCanvasHeight(600)
    }

    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    window.addEventListener('orientationchange', updateCanvasDimensions)
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions)
      window.removeEventListener('orientationchange', updateCanvasDimensions)
    }
  }, [])

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

    // Try to load from session storage first, otherwise load default image
    if (!loadFromSessionStorage(ctx)) {
      // Load default image
      loadDefaultImage(ctx)
      // Save initial state to history
      saveToHistory(ctx)
    }
  }, [])

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
    img.src = `${process.env.NODE_ENV === 'production' ? '/coloring-app' : ''}/honor.png`
  }

  const saveToHistory = (ctx) => {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // Save to session storage with a small delay to ensure canvas is updated
    setTimeout(() => saveToSessionStorage(ctx), 10)
  }

  const saveToSessionStorage = (ctx) => {
    try {
      const canvas = canvasRef.current
      if (canvas) {
        const dataURL = canvas.toDataURL()
        sessionStorage.setItem('coloringCanvas', dataURL)
      }
    } catch (error) {
      console.warn('Could not save to session storage:', error)
    }
  }

  const loadFromSessionStorage = (ctx) => {
    try {
      const savedData = sessionStorage.getItem('coloringCanvas')
      if (savedData) {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return
          
          const actualWidth = canvas.width
          const actualHeight = canvas.height
          
          ctx.clearRect(0, 0, actualWidth, actualHeight)
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, actualWidth, actualHeight)
          ctx.drawImage(img, 0, 0)
          saveToHistory(ctx)
        }
        img.src = savedData
        return true
      }
    } catch (error) {
      console.warn('Could not load from session storage:', error)
    }
    return false
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : null
  }

  const getPixelColor = (imageData, x, y, width) => {
    const index = (y * width + x) * 4
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    }
  }

  const setPixelColor = (imageData, x, y, width, color) => {
    const index = (y * width + x) * 4
    imageData.data[index] = color.r
    imageData.data[index + 1] = color.g
    imageData.data[index + 2] = color.b
    imageData.data[index + 3] = color.a
  }

  const colorsMatch = (color1, color2, tolerance = 0) => {
    return Math.abs(color1.r - color2.r) <= tolerance &&
           Math.abs(color1.g - color2.g) <= tolerance &&
           Math.abs(color1.b - color2.b) <= tolerance &&
           Math.abs(color1.a - color2.a) <= tolerance
  }

  const floodFill = (ctx, startX, startY, fillColor) => {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const targetColor = getPixelColor(imageData, startX, startY, canvasWidth)
    const newColor = hexToRgb(fillColor)
    
    if (colorsMatch(targetColor, newColor)) return

    const tolerance = 15
    const stack = [{x: startX, y: startY}]
    const visited = new Set()

    while (stack.length > 0) {
      const {x, y} = stack.pop()
      
      if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue
      
      const key = `${x},${y}`
      if (visited.has(key)) continue
      
      const currentColor = getPixelColor(imageData, x, y, canvasWidth)
      if (!colorsMatch(currentColor, targetColor, tolerance)) continue
      
      visited.add(key)
      setPixelColor(imageData, x, y, canvasWidth, newColor)
      
      stack.push({x: x + 1, y: y})
      stack.push({x: x - 1, y: y})
      stack.push({x: x, y: y + 1})
      stack.push({x: x, y: y - 1})
    }

    ctx.putImageData(imageData, 0, 0)
    
    requestAnimationFrame(() => {
      saveToHistory(ctx)
    })
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

    const { clientX, clientY } = getEventCoordinates(e)
    
    // Calculate the actual brush size as it appears on screen (accounting for zoom)
    const actualBrushSize = brushSize * zoom
    
    if (isPanning) {
      // During panning, position cursor based on its canvas position + current pan
      const screenX = cursorCanvasPosition.x + pan.x
      const screenY = cursorCanvasPosition.y + pan.y
      
      cursor.style.left = `${screenX - actualBrushSize / 2}px`
      cursor.style.top = `${screenY - actualBrushSize / 2}px`
    } else {
      // Normal mouse movement - follow mouse exactly
      cursor.style.left = `${clientX - actualBrushSize / 2}px`
      cursor.style.top = `${clientY - actualBrushSize / 2}px`
      
      // Calculate and store cursor position relative to canvas (accounting for current pan)
      const canvasRelativeX = clientX - pan.x
      const canvasRelativeY = clientY - pan.y
      setCursorCanvasPosition({ x: canvasRelativeX, y: canvasRelativeY })
    }
    
    cursor.style.width = `${actualBrushSize}px`
    cursor.style.height = `${actualBrushSize}px`
    cursor.style.display = 'block'
  }

  const startDrawing = (e) => {
    e.preventDefault() // Prevent scrolling on touch devices
    
    const { clientX, clientY } = getEventCoordinates(e)
    
    // Handle multi-touch gestures (pinch/pan)
    if (e.touches && e.touches.length > 1) {
      setIsGesturing(true)
      clearTimeout(gestureTimeoutRef.current)
      setIsPanning(true)
      setLastPanPoint({ x: clientX, y: clientY })
      // Store cursor position relative to canvas when panning starts
      const canvasRelativeX = clientX - pan.x
      const canvasRelativeY = clientY - pan.y
      setCursorCanvasPosition({ x: canvasRelativeX, y: canvasRelativeY })
      return
    }
    
    // Handle right/middle click panning for desktop
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true)
      setLastPanPoint({ x: clientX, y: clientY })
      // Store cursor position relative to canvas when panning starts
      const canvasRelativeX = clientX - pan.x
      const canvasRelativeY = clientY - pan.y
      setCursorCanvasPosition({ x: canvasRelativeX, y: canvasRelativeY })
      return
    }
    
    // Prevent drawing if we're in gesture mode
    if (isGesturing) {
      return
    }

    const coords = getCanvasCoordinates(e)
    
    if (fillMode && context) {
      floodFill(context, Math.floor(coords.x), Math.floor(coords.y), currentColor)
    } else {
      setIsDrawing(true)
      
      if (context) {
        context.beginPath()
        context.moveTo(coords.x, coords.y)
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.strokeStyle = currentColor
        context.lineWidth = brushSize
      }
    }
  }

  const draw = (e) => {
    e.preventDefault() // Prevent scrolling on touch devices
    
    const { clientX, clientY } = getEventCoordinates(e)
    
    if (isPanning) {
      const deltaX = clientX - lastPanPoint.x
      const deltaY = clientY - lastPanPoint.y
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: clientX, y: clientY })
      
      // Update cursor position during panning (for non-touch events)
      if (!e.touches) {
        updateCursor(e)
      }
      return
    }

    // Only show cursor for mouse events (not touch)
    if (!e.touches) {
      updateCursor(e)
    }

    if (!isDrawing || !context || fillMode) return

    const coords = getCanvasCoordinates(e)
    context.lineTo(coords.x, coords.y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false)
      
      // If we were in gesture mode, set a cooldown before allowing drawing again
      if (isGesturing) {
        clearTimeout(gestureTimeoutRef.current)
        gestureTimeoutRef.current = setTimeout(() => {
          setIsGesturing(false)
        }, 200) // 200ms cooldown
      }
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
        saveToSessionStorage(context)
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1 && context) {
        const newIndex = historyIndex + 1
        context.putImageData(history[newIndex], 0, 0)
        setHistoryIndex(newIndex)
        saveToSessionStorage(context)
      }
    },
    clear: () => {
      if (context) {
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvasWidth, canvasHeight)
        loadDefaultImage(context)
        saveToHistory(context)
        // Clear session storage when clearing canvas
        sessionStorage.removeItem('coloringCanvas')
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
    width: `${displayWidth * zoom}px`,
    height: `${displayHeight * zoom}px`,
    transform: `translate(${pan.x}px, ${pan.y}px)`
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