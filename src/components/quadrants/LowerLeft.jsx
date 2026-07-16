/**
 * Lower Left Quadrant - "WE" Collective Interior
 *
 * Three holonic layers: Homestead (~12), Guild (~96), Cell (~1000)
 * Collective vector reveals scarcity → orders tasks
 * Tasks have 3-dimensional composition: Cognitio, Sympathia, Labor
 * Voluntas (V) is a task-level coefficient, not a dimension
 */

import { useState, useCallback, useMemo } from 'react'
import { useCommitments, addCommitment, removeCommitment } from '../../data/commitments'
import './LowerLeft.css'

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const LAYERS = ['HOMESTEAD', 'GUILD', 'CELL']
const PREVIEW_COUNT = 3

const COLORS = {
  cognitio: '#BA7517',
  sympathia: '#0F6E56',
  labor: '#993C1D'
}

// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════

const MOCK_TASKS = {
  HOMESTEAD: [
    { id: 'h1',  title: 'Neighbor mediation — dome 3',                   cognitio: 0.20, sympathia: 0.60, labor: 0.20, spots: 2,  filled: 0, V: 1.4, hours_est: 2, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Facilitate a conversation between dome 3 neighbors about shared space use', resources: 'Meeting room, whiteboard' },
    { id: 'h2',  title: 'Tuesday collective kitchen',                    cognitio: 0.10, sympathia: 0.50, labor: 0.40, spots: 4,  filled: 3, V: 0.8, hours_est: 4, origin: 'DEBATE', status: 'ACTIVE', description: 'Prepare a community meal for 12 people', resources: 'Community kitchen, garden ingredients' },
    { id: 'h3',  title: 'Dome 4 roof repair',                            cognitio: 0.10, sympathia: 0.15, labor: 0.75, spots: 2,  filled: 0, V: 1.6, hours_est: 6, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Fix a leak detected in the dome 4 roof', resources: 'Ladder, sealant, waterproof tarp' },
    { id: 'h4',  title: 'Shed tool inventory',                           cognitio: 0.50, sympathia: 0.10, labor: 0.40, spots: 2,  filled: 1, V: 1.0, hours_est: 3, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Catalog all tools and flag the ones that need replacement', resources: 'Spreadsheet, labels' },
    { id: 'h5',  title: 'Community reading session',                     cognitio: 0.45, sympathia: 0.45, labor: 0.10, spots: 6,  filled: 5, V: 0.5, hours_est: 2, origin: 'DEBATE', status: 'ACTIVE', description: 'Read and discuss chapter 4 of the permaculture manual', resources: 'Covered space, copies of the text' },
    { id: 'h6',  title: 'Greywater system cleaning',                     cognitio: 0.15, sympathia: 0.05, labor: 0.80, spots: 3,  filled: 2, V: 1.3, hours_est: 4, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Unclog filters and inspect the biodigester pipes', resources: 'Gloves, plumbing tools' },
    { id: 'h7',  title: 'Childcare — afternoon shift',                   cognitio: 0.10, sympathia: 0.70, labor: 0.20, spots: 2,  filled: 2, V: 0.4, hours_est: 4, origin: 'DEBATE', status: 'ACTIVE', description: 'Look after the homestead children during the afternoon', resources: 'Play area, snacks' },
    { id: 'h8',  title: 'Raised garden bed preparation',                 cognitio: 0.20, sympathia: 0.05, labor: 0.75, spots: 4,  filled: 1, V: 1.5, hours_est: 5, origin: 'DEBATE', status: 'ACTIVE', description: 'Build and fill 3 new raised beds for the season', resources: 'Wood, soil, compost, nails' },
    { id: 'h9',  title: 'Perimeter biodiversity mapping',                cognitio: 0.65, sympathia: 0.15, labor: 0.20, spots: 2,  filled: 0, V: 1.2, hours_est: 6, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Identify and record plant and animal species along the homestead edge', resources: 'Field guide, camera, notebook' },
  ],
  GUILD: [
    { id: 'g1',  title: 'Zone B irrigation system design',               cognitio: 0.65, sympathia: 0.10, labor: 0.25, spots: 3,  filled: 1, V: 1.3, hours_est: 8, origin: 'DEBATE', status: 'ACTIVE', description: 'Plan and implement a drip irrigation system for zone B of the garden', resources: 'PE piping, drippers, solar pump' },
    { id: 'g2',  title: 'Thermophilic composting workshop',              cognitio: 0.40, sympathia: 0.35, labor: 0.25, spots: 6,  filled: 5, V: 0.6, hours_est: 3, origin: 'DEBATE', status: 'ACTIVE', description: 'Teach thermophilic composting techniques to new members', resources: 'Compost bin, thermometer, dry material' },
    { id: 'g3',  title: 'Main greenhouse harvest',                       cognitio: 0.05, sympathia: 0.15, labor: 0.80, spots: 8,  filled: 7, V: 1.1, hours_est: 5, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Pick ripe tomatoes and peppers', resources: 'Harvest crates, pruning shears' },
    { id: 'g4',  title: 'Barn solar panel calibration',                  cognitio: 0.60, sympathia: 0.05, labor: 0.35, spots: 2,  filled: 1, V: 1.4, hours_est: 4, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Adjust the angle and inspect connections of the photovoltaic system', resources: 'Multimeter, Allen key, inverter documentation' },
    { id: 'g5',  title: 'Q3 crop rotation planning',                     cognitio: 0.70, sympathia: 0.15, labor: 0.15, spots: 4,  filled: 3, V: 0.9, hours_est: 6, origin: 'DEBATE', status: 'ACTIVE', description: 'Define what gets planted in each plot for the next quarter', resources: 'Plot map, crop history' },
    { id: 'g6',  title: 'North perimeter fence repair',                  cognitio: 0.05, sympathia: 0.10, labor: 0.85, spots: 5,  filled: 2, V: 1.5, hours_est: 8, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Replace broken posts and tighten wire in the north sector', resources: 'Wooden posts, wire, tensioners, cement' },
    { id: 'g7',  title: 'Food fermentation workshop',                    cognitio: 0.35, sympathia: 0.40, labor: 0.25, spots: 8,  filled: 8, V: 0.3, hours_est: 3, origin: 'DEBATE', status: 'ACTIVE', description: 'Make sauerkraut, kimchi and water kefir as a group', resources: 'Jars, salt, vegetables, kefir grains' },
    { id: 'g8',  title: 'Rainwater harvesting system inspection',        cognitio: 0.45, sympathia: 0.05, labor: 0.50, spots: 3,  filled: 0, V: 1.6, hours_est: 5, origin: 'DEBATE', status: 'ACTIVE', description: 'Inspect tanks, gutters and filters before the dry season', resources: 'Ladder, sealant, spare filters' },
    { id: 'g9',  title: 'Solar food dryer construction',                 cognitio: 0.30, sympathia: 0.05, labor: 0.65, spots: 4,  filled: 3, V: 1.2, hours_est: 10, origin: 'DEBATE', status: 'ACTIVE', description: 'Build a solar dehydrator from recycled materials', resources: 'Glass, wood, metal mesh, black paint' },
  ],
  CELL: [
    { id: 'c1',  title: 'Q2 energy audit',                               cognitio: 0.70, sympathia: 0.10, labor: 0.20, spots: 4,  filled: 2, V: 1.5, hours_est: 16, origin: 'DEBATE', status: 'ACTIVE', description: 'Measure the energy consumption of all domes and shared systems', resources: 'Multimeter, logging spreadsheet, inverter access' },
    { id: 'c2',  title: 'New member welcome festival',                   cognitio: 0.15, sympathia: 0.65, labor: 0.20, spots: 12, filled: 11, V: 0.7, hours_est: 8, origin: 'DEBATE', status: 'ACTIVE', description: 'Organize an integration day for 15 new cell members', resources: 'Amphitheater space, food, music' },
    { id: 'c3',  title: 'Internal road maintenance',                     cognitio: 0.05, sympathia: 0.10, labor: 0.85, spots: 10, filled: 2, V: 1.8, hours_est: 12, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Repair and level roads eroded by rain', resources: 'Gravel, shovels, wheelbarrows, compactor' },
    { id: 'c4',  title: 'Monthly internal market design',                cognitio: 0.40, sympathia: 0.40, labor: 0.20, spots: 6,  filled: 5, V: 0.8, hours_est: 10, origin: 'DEBATE', status: 'ACTIVE', description: 'Plan logistics and layout for the cell barter market', resources: 'Floor plans, tables, canopies' },
    { id: 'c5',  title: 'Solar light post installation',                 cognitio: 0.25, sympathia: 0.05, labor: 0.70, spots: 8,  filled: 6, V: 1.2, hours_est: 12, origin: 'DEBATE', status: 'ACTIVE', description: 'Install 12 solar lights along the main roads', resources: 'Posts, lights, cement, cables' },
    { id: 'c6',  title: 'Cell skills and trades census',                 cognitio: 0.55, sympathia: 0.35, labor: 0.10, spots: 5,  filled: 4, V: 0.9, hours_est: 8, origin: 'DEBATE', status: 'ACTIVE', description: 'Interview all members and build a directory of competencies', resources: 'Digital form, interview space' },
    { id: 'c7',  title: 'Fruit tree planting day',                       cognitio: 0.10, sympathia: 0.25, labor: 0.65, spots: 20, filled: 18, V: 0.5, hours_est: 6, origin: 'DEBATE', status: 'ACTIVE', description: 'Plant 50 fruit trees in the cell food forest zone', resources: 'Saplings, shovels, mulch, temporary irrigation' },
    { id: 'c8',  title: 'Drafting the conflict resolution protocol',     cognitio: 0.60, sympathia: 0.30, labor: 0.10, spots: 3, filled: 2, V: 1.3, hours_est: 12, origin: 'DEBATE', status: 'ACTIVE', description: 'Document a formal mediation and escalation process for the cell', resources: 'Reference documents, work space' },
    { id: 'c9',  title: 'General cleaning of common spaces',             cognitio: 0.05, sympathia: 0.15, labor: 0.80, spots: 15, filled: 14, V: 0.4, hours_est: 4, origin: 'SPONTANEOUS', status: 'ACTIVE', description: 'Sweep, tidy and disinfect all shared-use spaces', resources: 'Brooms, rags, cleaning supplies' },
  ]
}

const MOCK_COLLECTIVE = {
  HOMESTEAD: { cognitio: 0.15, sympathia: 0.62, labor: 0.23 },
  GUILD:     { cognitio: 0.38, sympathia: 0.28, labor: 0.34 },
  CELL:      { cognitio: 0.25, sympathia: 0.35, labor: 0.40 },
}

// ═══════════════════════════════════════════
// SVG HELPERS
// ═══════════════════════════════════════════

function TriSVG({ c, s, l, size = 48 }) {
  const h = size * (Math.sqrt(3) / 2)
  const pts = [
    [size / 2, 0],
    [size, h],
    [0, h],
  ]
  const px = c * pts[0][0] + s * pts[1][0] + l * pts[2][0]
  const py = c * pts[0][1] + s * pts[1][1] + l * pts[2][1]

  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} className="tri-svg">
      <polygon points={`${pts[0][0]},${pts[0][1]} ${px},${py} ${pts[2][0]},${pts[2][1]}`} fill={COLORS.cognitio} opacity="0.7" />
      <polygon points={`${pts[0][0]},${pts[0][1]} ${pts[1][0]},${pts[1][1]} ${px},${py}`} fill={COLORS.sympathia} opacity="0.7" />
      <polygon points={`${pts[2][0]},${pts[2][1]} ${px},${py} ${pts[1][0]},${pts[1][1]}`} fill={COLORS.labor} opacity="0.7" />
      <polygon points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <circle cx={px} cy={py} r={size * 0.06} fill="#fff" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
    </svg>
  )
}

function CompositionBar({ c, s, l }) {
  return (
    <div className="we-comp-bar">
      <div className="we-comp-seg" style={{ flex: c, backgroundColor: COLORS.cognitio }} />
      <div className="we-comp-seg" style={{ flex: s, backgroundColor: COLORS.sympathia }} />
      <div className="we-comp-seg" style={{ flex: l, backgroundColor: COLORS.labor }} />
    </div>
  )
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function LowerLeft({ onNavigate, onShowInfo, onExpand, expanded, userId }) {
  const [activeLayer, setActiveLayer] = useState('HOMESTEAD')
  const [expandedTask, setExpandedTask] = useState(null)
  const commitments = useCommitments()

  const handleSignUp = useCallback((e, task) => {
    e.stopPropagation()
    if (commitments.some(c => c.taskId === task.id)) {
      removeCommitment(task.id)
      onShowInfo?.(`You left: ${task.title} — removed from your calendar`)
    } else {
      const next = addCommitment(task, activeLayer)
      const added = next.find(c => c.taskId === task.id)
      const day = new Date(added.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })
      onShowInfo?.(`You signed up for: ${task.title} — scheduled for ${day} in your calendar`)
    }
  }, [commitments, activeLayer, onShowInfo])

  const collective = MOCK_COLLECTIVE[activeLayer]
  const tasks = MOCK_TASKS[activeLayer]

  const scarcity = useMemo(() => {
    const dims = [
      { key: 'cognitio', label: 'Cognitio', val: collective.cognitio },
      { key: 'sympathia', label: 'Sympathia', val: collective.sympathia },
      { key: 'labor', label: 'Labor', val: collective.labor },
    ]
    dims.sort((a, b) => a.val - b.val)
    return dims[0]
  }, [collective])

  // Sort: most subscribed first (filled/spots ratio descending)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (b.filled / b.spots) - (a.filled / a.spots))
  }, [tasks])

  // In grid view show only PREVIEW_COUNT, in expanded show all
  const visibleTasks = expanded ? sortedTasks : sortedTasks.slice(0, PREVIEW_COUNT)

  const handleClick = () => {
    if (!expanded) {
      onNavigate?.('contributions')
    }
  }

  const handleTaskClick = useCallback((e, task) => {
    e.stopPropagation()
    setExpandedTask(prev => prev?.id === task.id ? null : task)
  }, [])

  const handleLayerChange = useCallback((e, layer) => {
    e.stopPropagation()
    setActiveLayer(layer)
    setExpandedTask(null)
  }, [])

  return (
    <div className={`quadrant quadrant-ll ${expanded ? 'expanded' : ''}`} onClick={handleClick}>
      <span className="quadrant-label" onClick={(e) => { e.stopPropagation(); onExpand?.(); }}>WE</span>

      <div className="quadrant-content we-content">
        {/* Layer selector + collective triangle */}
        <div className="we-layer-row">
          <div className="we-layer-tabs">
            {LAYERS.map(layer => (
              <button
                key={layer}
                className={`we-layer-tab ${activeLayer === layer ? 'active' : ''}`}
                onClick={(e) => handleLayerChange(e, layer)}
              >
                {layer}
              </button>
            ))}
          </div>
          <div className="we-collective-tri" onClick={e => e.stopPropagation()}>
            <TriSVG c={collective.cognitio} s={collective.sympathia} l={collective.labor} size={48} />
          </div>
        </div>

        {/* Scarcity indicator */}
        <div className="we-scarcity" onClick={e => e.stopPropagation()}>
          <div className="we-scarcity-left">
            <span className="we-scarcity-label">LAYER SCARCITY</span>
            <span className="we-scarcity-value">{scarcity.label} scarce</span>
          </div>
          <div className="we-scarcity-pcts">
            {[
              { key: 'cognitio', label: 'C' },
              { key: 'sympathia', label: 'S' },
              { key: 'labor', label: 'L' },
            ].map(d => (
              <div key={d.key} className="we-pct-row">
                <span className="we-pct-dot" style={{ backgroundColor: COLORS[d.key] }} />
                <span className="we-pct-label">{d.label}</span>
                <span className="we-pct-val">{Math.round(collective[d.key] * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div className="we-task-list" onClick={e => e.stopPropagation()}>
          {visibleTasks.map(task => {
            const committed = commitments.some(c => c.taskId === task.id)
            return (
            <div
              key={task.id}
              className={`we-task-card ${expandedTask?.id === task.id ? 'expanded' : ''}`}
              onClick={(e) => handleTaskClick(e, task)}
            >
              <div className="we-task-row">
                <div className="we-task-tri">
                  <TriSVG c={task.cognitio} s={task.sympathia} l={task.labor} size={42} />
                </div>
                <div className="we-task-info">
                  <span className="we-task-title">
                    {task.title}
                    {committed && <span className="we-committed-badge" title="In your calendar">📅</span>}
                  </span>
                  <CompositionBar c={task.cognitio} s={task.sympathia} l={task.labor} />
                </div>
                <span className="we-task-spots">{task.filled}/{task.spots}</span>
              </div>

              {/* Expanded detail */}
              {expandedTask?.id === task.id && (
                <div className="we-task-detail">
                  <p className="we-task-desc">{task.description}</p>
                  <div className="we-task-meta">
                    <span>~{task.hours_est}h per person</span>
                    <span>V = {task.V.toFixed(1)}</span>
                    <span className={`we-origin we-origin-${task.origin.toLowerCase()}`}>
                      {task.origin === 'DEBATE' ? 'Debate' : 'Spontaneous'}
                    </span>
                  </div>
                  {task.resources && (
                    <div className="we-task-resources">
                      <span className="we-resources-label">Resources:</span> {task.resources}
                    </div>
                  )}
                  {committed && (
                    <div className="we-committed-note">
                      Scheduled for {new Date(commitments.find(c => c.taskId === task.id).date).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  )}
                  <button
                    className={`we-btn-anotarme ${committed ? 'committed' : ''}`}
                    onClick={(e) => handleSignUp(e, task)}
                  >
                    {committed ? '✓ SIGNED UP — REMOVE ME' : 'SIGN ME UP'}
                  </button>
                </div>
              )}
            </div>
            )
          })}

          {/* Show count hint in grid mode */}
          {!expanded && sortedTasks.length > PREVIEW_COUNT && (
            <div className="we-more-hint" onClick={(e) => { e.stopPropagation(); onExpand?.(); }}>
              +{sortedTasks.length - PREVIEW_COUNT} more tasks — click to expand
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LowerLeft
