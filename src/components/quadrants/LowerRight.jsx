/**
 * Lower Right Quadrant - "ITS" Exterior Collective
 * Cell Dashboard - Real-time monitoring of the settlement
 *
 * Layers (mouse wheel to switch):
 * 1. Normal - Standard cell view
 * 2. Urgency - Sectors colored by demand (Green/Yellow/Red)
 * 3. Activity - Shows where work is happening
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { CellView } from './CellView.jsx'
import './LowerRight.css'

// Layer definitions
const LAYERS = [
  { id: 'normal', label: 'STATUS', icon: '', description: 'Standard cell view' },
  { id: 'urgency', label: 'CRISIS MAP', icon: '', description: 'Demand by sector (Green/Yellow/Red)' },
  { id: 'activity', label: 'TEAMS', icon: '', description: 'Active work in each zone' },
]

// Mock data for sector info - will come from database
const MOCK_SECTOR_DATA = {
  school: {
    name: 'Earth School',
    currentClass: 'Advanced Permaculture',
    teacher: 'María González',
    students: 24,
    nextClass: 'Natural Building (14:00)',
    alerts: [],
  },
  guild: {
    1: { name: 'Guild North', tasks: ['Tomato harvest', 'Irrigation sector A'], workshop: 'Carpentry - Community table', people: 12, alerts: ['We need 2 people for the harvest'] },
    2: { name: 'Guild Northeast', tasks: ['Greenhouse maintenance'], workshop: 'Blacksmithing - Tools', people: 8, alerts: [] },
    3: { name: 'Guild East', tasks: ['Fruit tree pruning', 'Composting'], workshop: 'Pottery - Vessels', people: 15, alerts: ['Urgent: Pest detected in apple trees'] },
    4: { name: 'Guild Southeast', tasks: ['Soil preparation'], workshop: 'Textiles - Blankets', people: 10, alerts: [] },
    5: { name: 'Guild South', tasks: ['Lettuce planting', 'Carrot harvest'], workshop: 'Bakery - Whole wheat bread', people: 14, alerts: ['Flour needed'] },
    6: { name: 'Guild Southwest', tasks: ['General irrigation'], workshop: 'Dairy - Fresh cheese', people: 9, alerts: [] },
    7: { name: 'Guild West', tasks: ['Canal maintenance'], workshop: 'Preserves - Jams', people: 11, alerts: [] },
    8: { name: 'Guild Northwest', tasks: ['Chicken care', 'Egg collection'], workshop: 'Tailoring - Repairs', people: 13, alerts: ['Hens with low output'] },
    9: { name: 'Guild Center-North', tasks: ['General cleaning'], workshop: 'Electronics - Panel repair', people: 7, alerts: [] },
    10: { name: 'Guild Center-South', tasks: ['New dome construction'], workshop: 'Adobe - Bricks', people: 18, alerts: ['We need more hands!', 'Materials missing'] },
  },
  urban: {
    name: 'Urban Sector',
    establishments: ['Clinic', 'Warehouse', 'Cold Storage', 'Treasury', 'Hostel'],
    alerts: ['Clinic: Low medication stock'],
  },
}

export function LowerRight({ onNavigate, onShowInfo, onExpand, expanded }) {
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0)
  const [infoBubble, setInfoBubble] = useState(null) // { type: 'school'|'guild'|'urban', data: {...} }
  const quadrantRef = useRef(null)
  const wheelAccumulator = useRef(0)

  const currentLayer = LAYERS[currentLayerIndex]

  // Layer info for display
  const layerInfo = useMemo(() => ({
    icon: currentLayer.icon,
    label: currentLayer.label,
    description: currentLayer.description,
  }), [currentLayer])

  // Wheel handler to switch layers
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    wheelAccumulator.current += e.deltaY
    const threshold = 25

    if (wheelAccumulator.current > threshold) {
      wheelAccumulator.current = 0
      setCurrentLayerIndex(prev => Math.min(LAYERS.length - 1, prev + 1))
    } else if (wheelAccumulator.current < -threshold) {
      wheelAccumulator.current = 0
      setCurrentLayerIndex(prev => Math.max(0, prev - 1))
    }
  }, [])

  // Handle clicks from CellView
  const handleCellNavigate = useCallback((destination) => {
    if (destination === 'school') {
      setInfoBubble({ type: 'school', data: MOCK_SECTOR_DATA.school })
    } else if (destination === 'guild') {
      // For now show guild 1, later we'll get the actual guild index from CellView
      const guildIndex = 1
      setInfoBubble({ type: 'guild', data: MOCK_SECTOR_DATA.guild[guildIndex], index: guildIndex })
    } else if (destination === 'compound') {
      onShowInfo?.('Compound: Housing view')
    }
  }, [onShowInfo])

  const closeBubble = useCallback(() => {
    setInfoBubble(null)
  }, [])

  return (
    <div
      ref={quadrantRef}
      className={`quadrant quadrant-lr ${expanded ? 'expanded' : ''}`}
      onWheel={handleWheel}
    >
      <span
        className="quadrant-label"
        onClick={(e) => { e.stopPropagation(); onExpand?.(); }}
      >
        ITS
      </span>

      {/* Layer indicator */}
      <div className="its-layer-indicator">
        <span className="layer-icon">{layerInfo.icon}</span>
        <span className="layer-name">{layerInfo.label}</span>
      </div>

      <div className="quadrant-content cell-view-container">
        {/* Base cell view */}
        <CellView onNavigate={handleCellNavigate} />

        {/* Urgency overlay */}
        {currentLayer.id === 'urgency' && (
          <div className="cell-overlay urgency-overlay">
            <UrgencyOverlay />
          </div>
        )}

        {/* Activity overlay */}
        {currentLayer.id === 'activity' && (
          <div className="cell-overlay activity-overlay">
            <ActivityOverlay />
          </div>
        )}
      </div>

      {/* Info bubble */}
      {infoBubble && (
        <InfoBubble
          type={infoBubble.type}
          data={infoBubble.data}
          index={infoBubble.index}
          onClose={closeBubble}
        />
      )}
    </div>
  )
}

// Urgency Overlay Component - Shows sectors colored by demand
function UrgencyOverlay() {
  // Mock data - will come from database later
  const sectorStatus = [
    { id: 'guild-1', angle: 36, status: 'green' },
    { id: 'guild-2', angle: 72, status: 'yellow' },
    { id: 'guild-3', angle: 108, status: 'red' },
    { id: 'guild-4', angle: 144, status: 'green' },
    { id: 'guild-5', angle: 180, status: 'yellow' },
    { id: 'guild-6', angle: 216, status: 'green' },
    { id: 'guild-7', angle: 252, status: 'green' },
    { id: 'guild-8', angle: 288, status: 'yellow' },
    { id: 'guild-9', angle: 324, status: 'green' },
    { id: 'guild-10', angle: 360, status: 'red' },
  ]

  const statusColors = {
    green: 'rgba(34, 197, 94, 0.4)',
    yellow: 'rgba(234, 179, 8, 0.4)',
    red: 'rgba(239, 68, 68, 0.5)',
  }

  return (
    <svg className="urgency-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {sectorStatus.map((sector, i) => {
        const startAngle = (sector.angle - 36) * Math.PI / 180 - Math.PI / 2
        const endAngle = sector.angle * Math.PI / 180 - Math.PI / 2
        const innerR = 25
        const outerR = 42

        const x1 = 50 + Math.cos(startAngle) * innerR
        const y1 = 50 + Math.sin(startAngle) * innerR
        const x2 = 50 + Math.cos(startAngle) * outerR
        const y2 = 50 + Math.sin(startAngle) * outerR
        const x3 = 50 + Math.cos(endAngle) * outerR
        const y3 = 50 + Math.sin(endAngle) * outerR
        const x4 = 50 + Math.cos(endAngle) * innerR
        const y4 = 50 + Math.sin(endAngle) * innerR

        return (
          <path
            key={sector.id}
            d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}`}
            fill={statusColors[sector.status]}
            stroke={statusColors[sector.status].replace('0.4', '0.8').replace('0.5', '0.9')}
            strokeWidth="0.5"
          />
        )
      })}
    </svg>
  )
}

// Activity Overlay Component - Shows active work indicators
function ActivityOverlay() {
  // Mock data - will come from database later
  const activeWork = [
    { id: 'guild-3', angle: 108, type: 'taller', pulse: true },
    { id: 'guild-5', angle: 180, type: 'cosecha', pulse: true },
    { id: 'guild-8', angle: 288, type: 'construccion', pulse: false },
    { id: 'school', angle: 0, type: 'clase', pulse: true },
  ]

  const workIcons = {
    taller: '🔧',
    cosecha: '🌾',
    construccion: '🏗️',
    clase: '📚',
  }

  return (
    <svg className="activity-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {activeWork.map((work) => {
        const angle = work.angle * Math.PI / 180 - Math.PI / 2
        const r = work.id === 'school' ? 0 : 33
        const x = 50 + Math.cos(angle) * r
        const y = 50 + Math.sin(angle) * r

        return (
          <g key={work.id}>
            {work.pulse && (
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="none"
                stroke="rgba(0, 212, 255, 0.7)"
                strokeWidth="0.5"
                className="pulse-ring"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r="3"
              fill="rgba(0, 212, 255, 0.4)"
              stroke="rgba(0, 212, 255, 1)"
              strokeWidth="0.4"
            />
            <text
              x={x}
              y={y + 1}
              fontSize="3"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {workIcons[work.type]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Info Bubble Component - Shows detailed info for clicked sector
function InfoBubble({ type, data, index, onClose }) {
  if (type === 'school') {
    return (
      <div className="its-info-bubble" onClick={(e) => e.stopPropagation()}>
        <button className="bubble-close" onClick={onClose}>×</button>
        <h3>🏫 {data.name}</h3>
        <div className="bubble-section">
          <span className="section-label">Current class</span>
          <span className="section-value">{data.currentClass}</span>
        </div>
        <div className="bubble-section">
          <span className="section-label">Teacher</span>
          <span className="section-value">{data.teacher}</span>
        </div>
        <div className="bubble-section">
          <span className="section-label">Students</span>
          <span className="section-value">{data.students}</span>
        </div>
        <div className="bubble-section">
          <span className="section-label">Next class</span>
          <span className="section-value">{data.nextClass}</span>
        </div>
        {data.alerts.length > 0 && (
          <div className="bubble-alerts">
            {data.alerts.map((alert, i) => (
              <div key={i} className="alert-item">⚠️ {alert}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === 'guild') {
    return (
      <div className="its-info-bubble" onClick={(e) => e.stopPropagation()}>
        <button className="bubble-close" onClick={onClose}>×</button>
        <h3>🏘️ {data.name}</h3>
        <div className="bubble-section">
          <span className="section-label">Active people</span>
          <span className="section-value">{data.people}</span>
        </div>
        <div className="bubble-section">
          <span className="section-label">Workshop</span>
          <span className="section-value">{data.workshop}</span>
        </div>
        <div className="bubble-section tasks-section">
          <span className="section-label">Tasks in progress</span>
          <ul className="tasks-list">
            {data.tasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </div>
        {data.alerts.length > 0 && (
          <div className="bubble-alerts">
            {data.alerts.map((alert, i) => (
              <div key={i} className="alert-item">⚠️ {alert}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

export default LowerRight
