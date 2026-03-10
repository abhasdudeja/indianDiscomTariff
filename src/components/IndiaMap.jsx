import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import India from '@react-map/india'
import { getIdFromStateCodeOrName } from '../utils/stateMapping'
import { useStatesData } from '../contexts/StatesDataContext'
import { getDisplayableColumns } from '../config/columnConfig'
import './IndiaMap.css'

const IndiaMap = () => {
  const navigate = useNavigate()
  const { statesData, isLoading, error } = useStatesData()
  const [hoveredState, setHoveredState] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef(null)

  const handleStateHover = useCallback((stateIdentifier, event) => {
    // Try to get state ID from either state code or state name
    const stateId = getIdFromStateCodeOrName(stateIdentifier)

    // Try to find full state info from loaded data
    let state = null
    if (stateId && statesData.length > 0) {
      state = statesData.find(s => s.id === stateId) || null
    }

    // If we don't have data for this state, still show a basic tooltip with the state name
    if (!state) {
      // Derive a readable name:
      // - Prefer the original identifier (often already a proper name)
      // - Else, build from stateId (karnataka -> Karnataka, andhra-pradesh -> Andhra Pradesh)
      const baseName = typeof stateIdentifier === 'string' && stateIdentifier.trim()
        ? stateIdentifier.trim()
        : (stateId || '').trim()

      const prettyName = baseName
        ? baseName
            .replace(/[-_]+/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (ch) => ch.toUpperCase())
        : 'Unknown State/UT'

      state = {
        id: stateId || baseName || 'unknown',
        name: prettyName,
        utilities: [],
      }
    }

    setHoveredState(state)
    if (event) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }
    setShowTooltip(true)
  }, [statesData])

  const handleStateLeave = useCallback(() => {
    setShowTooltip(false)
    setHoveredState(null)
  }, [])

  const handleStateClick = useCallback((stateIdentifier, selectedStates) => {
    // The library might pass state name or code
    const identifier = stateIdentifier || (selectedStates && selectedStates.length > 0 ? selectedStates[0] : null)
    if (identifier) {
      const stateId = getIdFromStateCodeOrName(identifier)
      if (stateId) {
        // Navigate to utilities page for the state
        navigate(`/utilities/${stateId}`)
      } else {
        // Debug: log if state not found
        console.log('Click - State not found in mapping. Input:', identifier)
      }
    }
  }, [navigate])

  const handleMouseMove = useCallback((event) => {
    if (hoveredState) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
    }

    // Handle panning
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x
      const deltaY = event.clientY - dragStart.y
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setDragStart({ x: event.clientX, y: event.clientY })
    }
  }, [hoveredState, isDragging, dragStart])

  const handleMouseDown = (event) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (event) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))

    // Zoom towards mouse position - keep the point under cursor fixed
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const zoomFactor = newZoom / zoom
      setPan(prev => ({
        x: prev.x * zoomFactor + mouseX * (1 - zoomFactor),
        y: prev.y * zoomFactor + mouseY * (1 - zoomFactor)
      }))
    }

    setZoom(newZoom)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.2)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.2)
    setZoom(newZoom)
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Add event listeners to map paths after component mounts and data is loaded
  useEffect(() => {
    if (isLoading || statesData.length === 0) return

    const extractStateIdentifier = (element) => {
      // Try multiple ways to get the state identifier (code or name)

      // Check id attribute first (library often puts state name here with suffixes)
      const id = element.getAttribute('id') || ''
      if (id) {
        // Remove common prefixes and return
        const cleaned = id.replace(/^(state-|IN-|india-)/i, '')
        if (cleaned) {
          return cleaned
        }
      }

      // Check title attribute (library often uses this for state names)
      const title = element.getAttribute('title')
      if (title) {
        return title
      }

      // Check data attributes for state name
      const dataName = element.getAttribute('data-name') ||
        element.getAttribute('data-state-name') ||
        element.getAttribute('data-state')
      if (dataName) {
        return dataName
      }

      // Check other data attributes
      const dataState = element.getAttribute('data-state')
      const dataCode = element.getAttribute('data-code')
      const dataStateCode = element.getAttribute('data-state-code')
      const dataId = element.getAttribute('data-id')
      if (dataState || dataCode || dataStateCode || dataId) {
        return dataState || dataCode || dataStateCode || dataId
      }

      // Check class names
      const className = element.getAttribute('class') || ''
      // Look for state name in class
      const nameMatch = className.match(/state-([A-Za-z\s]+)/i)
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim()
      }
      // Look for 2-letter code in class
      const classMatch = className.match(/(?:^|\s)([A-Z]{2})(?:\s|$)/)
      if (classMatch && classMatch[1]) {
        return classMatch[1]
      }

      // Check if parent group has state identifier
      const parent = element.parentElement
      if (parent) {
        const parentId = parent.getAttribute('id') || ''
        if (parentId) {
          const cleaned = parentId.replace(/^(state-|IN-|india-)/i, '')
          if (cleaned) {
            return cleaned
          }
        }
        const parentTitle = parent.getAttribute('title')
        if (parentTitle) {
          return parentTitle
        }
      }

      return null
    }

    const handlePathMouseEnter = (event) => {
      const mouseEvent = event
      let target = mouseEvent.target

      // Traverse up the DOM tree to find the path or group element
      while (target && target !== document.body) {
        if (target.tagName === 'path' || target.tagName === 'g') {
          const stateIdentifier = extractStateIdentifier(target)
          if (stateIdentifier) {
            handleStateHover(stateIdentifier, mouseEvent)
            return
          }
        }
        target = target.parentElement
      }
    }

    const handlePathMouseLeave = () => {
      handleStateLeave()
    }

    // Wait for map to render, then attach listeners
    const attachListeners = () => {
      const mapContainer = document.querySelector('.india-map-component')
      if (!mapContainer) {
        setTimeout(attachListeners, 100)
        return
      }

      // Find all paths and groups in the map - try multiple selectors
      let paths = mapContainer.querySelectorAll('path, g')

      // If no paths found, try finding SVG first
      if (paths.length === 0) {
        const svg = mapContainer.querySelector('svg')
        if (svg) {
          paths = svg.querySelectorAll('path, g')
        }
      }

      if (paths.length === 0) {
        // Retry if paths not found yet
        setTimeout(attachListeners, 200)
        return
      }

      paths.forEach(path => {
        path.addEventListener('mouseenter', handlePathMouseEnter)
        path.addEventListener('mouseleave', handlePathMouseLeave)
      })
    }

    const timer = setTimeout(attachListeners, 500)

    return () => {
      clearTimeout(timer)
      const mapContainer = document.querySelector('.india-map-component')
      if (mapContainer) {
        const paths = mapContainer.querySelectorAll('path, g[data-state], g[id*="state"]')
        paths.forEach(path => {
          path.removeEventListener('mouseenter', handlePathMouseEnter)
          path.removeEventListener('mouseleave', handlePathMouseLeave)
        })
      }
    }
  }, [isLoading, statesData, handleStateHover, handleStateLeave])

  if (isLoading) {
    return (
      <div className="india-map-container">
        <div className="map-header">
          <h1>India States Map</h1>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="india-map-container">
        <div className="map-header">
          <h1>India States Map</h1>
          <p style={{ color: 'red' }}>Error: {error}</p>
          <p>Please ensure the CSV file exists at /public/states-data.csv</p>
        </div>
      </div>
    )
  }

  return (
    <div className="india-map-container">
      <div className="map-header">
        <h1>India EV Charging Tariff Map</h1>
        <p>Hover over a state/UT to see EV charging utilities, click to view tariff information</p>
        <p className="zoom-hint">Use mouse wheel to zoom, drag to pan</p>
      </div>

      <div className="map-wrapper">
        <div className="zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
            +
          </button>
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
            −
          </button>
          <button onClick={handleResetZoom} className="zoom-btn reset-btn" title="Reset Zoom">
            ⌂
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        </div>
        <div
          className="map-zoom-container"
          ref={mapContainerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div
            className="india-map-component"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            <India
              type="select-single"
              size={800}
              mapColor="#4a90e2"
              strokeColor="#ffffff"
              strokeWidth={1.5}
              hoverColor="#357abd"
              selectColor="#2c5aa0"
              hints={false}
              onSelect={handleStateClick}
            />
          </div>
        </div>
      </div>

      {showTooltip && hoveredState && (
        <div
          className="state-tooltip"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y - 10}px`,
          }}
        >
          <h3>{hoveredState.name}</h3>
          <div className="tooltip-content">
            {hoveredState.utilities && hoveredState.utilities.length > 0 ? (
              <>
                <p><strong>Number of Utilities:</strong> {hoveredState.utilities.length}</p>
                <div className="utilities-list">
                  <p><strong>Utility Providers:</strong></p>
                  <ul>
                    {hoveredState.utilities.map((utility) => (
                      <li key={utility.id}>
                        {utility.name} ({utility.type})
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="click-hint">Click to view EV charging tariff details</p>
              </>
            ) : (
              <>
                <p><strong>State/UT:</strong> {hoveredState.name}</p>
                <p>No utility information available</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IndiaMap
