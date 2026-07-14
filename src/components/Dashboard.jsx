/**
 * Dashboard Module
 * Accessed via the central Wilber circle
 * Top bar with tabs, content area below
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCommitments, removeCommitment } from '../data/commitments'
import './Dashboard.css'

// Tab configuration
const TABS = [
  { id: 'deliberatorium', label: 'Deliberatorium', icon: '💡' },
  { id: 'economics', label: 'Economics', icon: '📊' },
  { id: 'cornucopia', label: 'Cornucopia', icon: '🌽' },
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

// ═══════════════════════════════════════════
// DELIBERATORIUM — Argument Map (Tree Layout)
// ═══════════════════════════════════════════

const ARGUMENT_LAYERS = [
  {
    name: 'Topics', desc: 'High-level discussion areas',
    root: {
      id: 'root', text: 'Building Rubania Community', type: 'root', children: [
        { id: 't1', text: 'Infrastructure priorities', type: 'support', relation: 'includes' },
        { id: 't2', text: 'Governance model', type: 'support', relation: 'includes' },
        { id: 't3', text: 'Economic system', type: 'support', relation: 'includes' },
        { id: 't4', text: 'Education approach', type: 'support', relation: 'includes' },
      ]
    }
  },
  {
    name: 'Claims', desc: 'Main positions being debated',
    root: {
      id: 'root', text: 'What should we build first?', type: 'root', children: [
        { id: 'c1', text: 'Build school first', type: 'support', relation: 'because', children: [
          { id: 'c1a', text: 'Education enables everything else', type: 'support', relation: 'because' },
          { id: 'c1b', text: "Children's development can't wait", type: 'support', relation: 'because' },
        ]},
        { id: 'c2', text: 'Build clinic first', type: 'oppose', relation: 'but', children: [
          { id: 'c2a', text: 'Health is prerequisite for learning', type: 'support', relation: 'because' },
          { id: 'c2b', text: "Sick children can't attend school", type: 'support', relation: 'because' },
        ]},
      ]
    }
  },
  {
    name: 'Arguments', desc: 'Detailed reasoning',
    root: {
      id: 'root', text: 'Build school first', type: 'root', children: [
        { id: 'a1', text: 'Cognitive development peaks in early years', type: 'support', relation: 'because', children: [
          { id: 'a1a', text: 'Brain plasticity highest before age 7', type: 'support', relation: 'because' },
          { id: 'a1b', text: 'Language acquisition has critical period', type: 'support', relation: 'because' },
        ]},
        { id: 'a2', text: 'Educated workforce builds everything else', type: 'support', relation: 'because', children: [
          { id: 'a2a', text: 'Literacy needed for all other skills', type: 'support', relation: 'because' },
        ]},
        { id: 'a3', text: 'Adults can delay, children cannot', type: 'support', relation: 'because' },
        { id: 'a4', text: 'School requires healthy children to attend', type: 'oppose', relation: 'however', children: [
          { id: 'a4a', text: 'Basic health can be addressed with simpler measures', type: 'oppose', relation: 'but' },
        ]},
      ]
    }
  },
  {
    name: 'Evidence', desc: 'Data and sources',
    root: {
      id: 'root', text: 'Cognitive development peaks early', type: 'root', children: [
        { id: 'e1', text: 'Perry Preschool Study (1962-1967)', type: 'neutral', relation: 'evidence', children: [
          { id: 'e1a', text: '123 African-American children, ages 3-4', type: 'neutral', relation: 'methodology' },
          { id: 'e1b', text: 'Followed for 40 years', type: 'neutral', relation: 'methodology' },
        ]},
        { id: 'e2', text: 'Heckman & Masterov 2007', type: 'neutral', relation: 'evidence', children: [
          { id: 'e2a', text: '13:1 ROI over lifetime', type: 'support', relation: 'finding' },
          { id: 'e2b', text: 'Effects strongest for disadvantaged', type: 'support', relation: 'finding' },
        ]},
        { id: 'e3', text: 'UNESCO Global Education Report 2024', type: 'neutral', relation: 'evidence' },
      ]
    }
  },
  {
    name: 'Personal', desc: 'Your private annotations',
    root: {
      id: 'root', text: 'My thoughts on school-first', type: 'root', children: [
        { id: 'p1', text: 'I agree, but worried about teacher availability', type: 'support', relation: 'note' },
        { id: 'p2', text: 'Need to ask Maria about rural school experience', type: 'neutral', relation: 'todo' },
        { id: 'p3', text: 'Research modular building costs', type: 'neutral', relation: 'todo' },
        { id: 'p4', text: 'Overall confidence: 75% school-first is correct', type: 'support', relation: 'assessment' },
      ]
    }
  },
]

const LAYER_ICONS = ['\u{1F310}', '\u{1F4AC}', '\u2696\uFE0F', '\u{1F4CA}', '\u{1F464}']

function layoutTree(rootNode, containerWidth) {
  const nodeWidth = 160, nodeHeight = 60, hGap = 40, vGap = 80
  const positions = []
  function calc(n, d, startX, availW) {
    const children = n.children || []
    const nx = d === 0 ? containerWidth / 2 : startX + availW / 2
    const ny = 100 + d * (nodeHeight + vGap)
    positions.push({ ...n, x: nx, y: ny, width: nodeWidth, height: nodeHeight })
    if (children.length > 0) {
      const totalW = children.length * nodeWidth + (children.length - 1) * hGap
      const childStart = nx - totalW / 2
      children.forEach((c, i) => {
        const cw = nodeWidth + hGap
        calc(c, d + 1, childStart + i * cw, cw)
      })
    }
  }
  calc(rootNode, 0, 0, containerWidth)
  return positions
}

function buildParentMap(node, parent, map) {
  if (parent) map[node.id] = parent
  ;(node.children || []).forEach(c => buildParentMap(c, node, map))
  return map
}

function ArgumentMap() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const svgRef = useRef(null)
  const transformRef = useRef(null)
  const [currentLayer, setCurrentLayer] = useState(0)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panStartX: 0, panStartY: 0 })

  const applyTransform = useCallback(() => {
    if (!transformRef.current) return
    transformRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`
  }, [])

  const renderLayer = useCallback((idx) => {
    const canvas = canvasRef.current, svg = svgRef.current, container = containerRef.current
    if (!canvas || !svg || !container) return
    canvas.innerHTML = ''
    svg.innerHTML = ''
    const layer = ARGUMENT_LAYERS[idx]
    const cw = container.clientWidth || 960
    const positions = layoutTree(layer.root, cw)
    const parentMap = buildParentMap(layer.root, null, {})
    const posMap = {}
    positions.forEach(p => { posMap[p.id] = p })
    svg.setAttribute('width', cw * 3)
    svg.setAttribute('height', cw * 2)
    svg.style.overflow = 'visible'

    positions.forEach(pos => {
      const par = parentMap[pos.id]
      if (!par || !posMap[par.id]) return
      const pp = posMap[par.id]
      const fromX = pp.x, fromY = pp.y + pp.height + 10, toX = pos.x, toY = pos.y - 5
      const midY = (fromY + toY) / 2
      let color
      switch (pos.type) {
        case 'support': color = '#34d399'; break
        case 'oppose': color = '#fb7185'; break
        case 'neutral': color = '#38bdf8'; break
        default: color = '#71717a'
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`)
      path.setAttribute('stroke', color)
      path.setAttribute('stroke-width', '2')
      path.setAttribute('fill', 'none')
      path.setAttribute('opacity', '0.7')
      svg.appendChild(path)
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      const s = 6
      arrow.setAttribute('points', `${toX},${toY} ${toX - s},${toY - s * 1.5} ${toX + s},${toY - s * 1.5}`)
      arrow.setAttribute('fill', color)
      svg.appendChild(arrow)
      if (pos.relation && ['because', 'but', 'however'].includes(pos.relation)) {
        const label = document.createElement('div')
        label.className = `argmap-conn-label ${pos.relation}`
        label.textContent = pos.relation
        label.style.left = ((fromX + toX) / 2 - 25) + 'px'
        label.style.top = (midY - 8) + 'px'
        canvas.appendChild(label)
      }
    })

    positions.forEach(pos => {
      const node = document.createElement('div')
      node.className = `argmap-node ${pos.type}`
      node.textContent = pos.text
      node.style.left = (pos.x - pos.width / 2) + 'px'
      node.style.top = pos.y + 'px'
      node.style.width = pos.width + 'px'
      canvas.appendChild(node)
    })
    applyTransform()
  }, [applyTransform])

  const switchLayer = useCallback((idx) => {
    const i = Math.max(0, Math.min(ARGUMENT_LAYERS.length - 1, idx))
    setCurrentLayer(i)
    panRef.current = { x: 0, y: 0 }
    zoomRef.current = 1
    renderLayer(i)
  }, [renderLayer])

  useEffect(() => {
    renderLayer(currentLayer)
    const onResize = () => renderLayer(currentLayer)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [currentLayer, renderLayer])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const oldZ = zoomRef.current
      zoomRef.current = Math.max(0.3, Math.min(2.5, oldZ - e.deltaY * 0.001))
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const r = zoomRef.current / oldZ
      panRef.current.x = mx - (mx - panRef.current.x) * r
      panRef.current.y = my - (my - panRef.current.y) * r
      applyTransform()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyTransform])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onDown = (e) => {
      if (e.target.classList.contains('argmap-node')) return
      dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panStartX: panRef.current.x, panStartY: panRef.current.y }
    }
    const onMove = (e) => {
      if (!dragRef.current.active) return
      panRef.current.x = dragRef.current.panStartX + (e.clientX - dragRef.current.startX)
      panRef.current.y = dragRef.current.panStartY + (e.clientY - dragRef.current.startY)
      applyTransform()
    }
    const onUp = () => { dragRef.current.active = false }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { el.removeEventListener('mousedown', onDown); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [applyTransform])

  const layer = ARGUMENT_LAYERS[currentLayer]

  return (
    <div className="argmap-wrap">
      <div className="argmap-container" ref={containerRef}>
        <div className="argmap-transform" ref={transformRef}>
          <svg ref={svgRef} className="argmap-svg" />
          <div ref={canvasRef} className="argmap-canvas" />
        </div>
      </div>
      <div className="argmap-overlay">
        <div className="argmap-layer-info">
          <div className="argmap-layer-name">{layer.name}</div>
          <div className="argmap-layer-desc">{layer.desc}</div>
        </div>
        <div className="argmap-layer-nav">
          {ARGUMENT_LAYERS.map((l, i) => (
            <button key={i} className={`argmap-layer-btn ${currentLayer === i ? 'active' : ''}`} onClick={() => switchLayer(i)}>
              <span className="argmap-layer-icon">{LAYER_ICONS[i]}</span>
              <span className="argmap-layer-label">{l.name}</span>
            </button>
          ))}
        </div>
        <div className="argmap-legend">
          <div className="argmap-legend-item"><span className="argmap-dot" style={{ background: '#fbbf24' }} />Root claim</div>
          <div className="argmap-legend-item"><span className="argmap-dot" style={{ background: '#34d399' }} />Support (because)</div>
          <div className="argmap-legend-item"><span className="argmap-dot" style={{ background: '#fb7185' }} />Oppose (but)</div>
        </div>
        <div className="argmap-instructions"><kbd>Scroll</kbd> Zoom &nbsp; <kbd>Drag</kbd> Pan</div>
      </div>
    </div>
  )
}

// Helper Components for Economics tab
const WeightBar = ({ label, value, color }) => (
  <div className="weight-bar">
    <div className="weight-label">{label}</div>
    <div className="weight-track">
      <div
        className="weight-fill"
        style={{ width: `${value * 100 * 2}%`, background: color }}
      />
    </div>
    <div className="weight-value">{(value * 100).toFixed(1)}%</div>
  </div>
)

const DualWeightBar = ({ label, actionPercent, weight, color }) => (
  <div className="dual-weight-bar">
    <div className="dual-weight-label">{label}</div>
    <div className="dual-bars">
      <div className="bar-row">
        <span className="bar-type">Action</span>
        <div className="dual-track">
          <div
            className="dual-fill action-fill"
            style={{ width: `${actionPercent}%`, background: color, opacity: 0.6 }}
          />
        </div>
        <span className="bar-value">{actionPercent.toFixed(1)}%</span>
      </div>
      <div className="bar-row">
        <span className="bar-type">Weight</span>
        <div className="dual-track">
          <div
            className="dual-fill weight-fill"
            style={{ width: `${weight * 100 * 2}%`, background: color }}
          />
        </div>
        <span className="bar-value">{(weight * 100).toFixed(1)}%</span>
      </div>
    </div>
  </div>
)

const ActioBar = ({ label, value, color }) => (
  <div className="actio-bar">
    <div className="actio-label">{label}</div>
    <div className="actio-track">
      <div
        className="actio-fill"
        style={{ width: `${value * 100}%`, background: color }}
      />
    </div>
    <div className="actio-value">{(value * 100).toFixed(0)}%</div>
  </div>
)

const DevotioBar = ({ label, value }) => (
  <div className="devotio-bar">
    <div className="devotio-label">{label}</div>
    <div className="devotio-track">
      <div
        className="devotio-fill"
        style={{ width: `${value}%` }}
      />
    </div>
    <div className="devotio-value">{value}</div>
  </div>
)

// Mock economic data — Economics tab runs in shell mode until DB schema is implemented
//
// Model: PRAXION is composed of three dimensions (Cognitio, Sympathia, Labor).
// VOLUNTAS is NOT a dimension of Praxion — it is a per-task multiplier the
// community sets to incentivize or disincentivize specific jobs.
// Distribution order: Income → Reserve → Basic Share for everyone → the
// remainder is the Bonus Pool. Only then is the exchange rate computed
// (Bonus Pool ÷ total Praxion), and each person's Praxion sets their bonus.
const MOCK_MEMBER_COUNT = 24

const MOCK_PERIOD = {
  id: 'mock-period-1',
  period_number: 7,
  status: 'closed',
  weight_cognitive: 0.42,
  weight_emotional: 0.33,
  weight_physical: 0.25,
  total_cognitive: 9500,
  total_emotional: 12200,
  total_physical: 16100,
  total_praxion: 25000,
  basic_share: 700,
  reserve_ratio: 0.2,
}

const MOCK_SUMMARY = {
  total_minutes: 2400,
  weighted_cognitive: 960,
  weighted_emotional: 780,
  weighted_physical: 660,
  voluntas_multiplier: 1.12,
  devotio_coefficient: 1.15,
  praxion_earned: 1063.4,
  praxion_accumulated: 350,
}

const MOCK_DEVOTIO = {
  vocatio: 78,
  opus: 65,
  societas: 82,
  familia: 60,
  salus: 70,
}

const MOCK_TREASURY = [
  { movement_type: 'Wholesale Sales', amount: 18000 },
  { movement_type: 'Local Sales', amount: 9500 },
  { movement_type: 'Visitor Sales', amount: 7500 },
]

// Voluntas: community-set multipliers to attract or repel labor per task
const MOCK_VOLUNTAS_TASKS = [
  { task: 'Night care shifts', multiplier: 1.5, note: 'Chronically understaffed' },
  { task: 'Compost & sanitation', multiplier: 1.3, note: 'Few volunteers' },
  { task: 'Kitchen rotation', multiplier: 1.0, note: 'Balanced' },
  { task: 'Front desk / visitors', multiplier: 0.9, note: 'Slightly oversubscribed' },
  { task: 'Orchard harvest', multiplier: 0.8, note: 'Everyone wants it' },
]

const MOCK_WALLET_TRANSACTIONS = [
  { date: 'Jul 12', label: 'Converted to USD', amount: -200 },
  { date: 'Jul 09', label: 'Surplus market — vegetables box', amount: -45.5 },
  { date: 'Jul 01', label: 'Praxion bonus — Period 7', amount: 476.4 },
  { date: 'Jul 01', label: 'Basic share — Period 7', amount: 700 },
]

const getWeightInsight = (period) => {
  const weights = [
    { name: 'Cognitio', value: period.weight_cognitive },
    { name: 'Sympathia', value: period.weight_emotional },
    { name: 'Labor', value: period.weight_physical },
  ]

  const sorted = [...weights].sort((a, b) => b.value - a.value)
  const scarcest = sorted[0]
  const abundant = sorted[sorted.length - 1]

  return `${scarcest.name} was scarcest this period (${(scarcest.value * 100).toFixed(1)}% weight), while ${abundant.name} was most abundant (${(abundant.value * 100).toFixed(1)}% weight). Those who contributed ${scarcest.name} earn Praxion faster.`
}

export function Dashboard({ onBack, memberId }) {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('deliberatorium')

  // Task commitments signed up from the Lower Left quadrant
  const commitments = useCommitments()

  // Economics tab state — shell mode, see MOCK_* constants above
  const [loading] = useState(false)
  const [period] = useState(MOCK_PERIOD)
  const [summary, setSummary] = useState(MOCK_SUMMARY)
  const [devotio] = useState(MOCK_DEVOTIO)
  const [treasury] = useState(MOCK_TREASURY)
  const [walletTransactions, setWalletTransactions] = useState(MOCK_WALLET_TRANSACTIONS)
  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  // Distribution waterfall: rate exists only AFTER reserve + basic shares
  const ecoIncome = treasury.reduce((s, t) => s + parseFloat(t.amount), 0)
  const ecoReserve = ecoIncome * period.reserve_ratio
  const ecoBasicSharePool = period.basic_share * MOCK_MEMBER_COUNT
  const ecoBonusPool = ecoIncome - ecoReserve - ecoBasicSharePool
  const ecoExchangeRate = ecoBonusPool / period.total_praxion

  const walletBalance = walletTransactions.reduce((s, t) => s + t.amount, 0)

  const handleRedeem = async () => {
    const amount = parseFloat(redeemAmount)
    if (isNaN(amount) || amount <= 0) return

    if (amount > summary.praxion_accumulated) {
      alert(`Maximum available: ${summary.praxion_accumulated.toFixed(2)} Praxion`)
      return
    }

    setRedeeming(true)
    const rubanReceived = amount * ecoExchangeRate
    setSummary({
      ...summary,
      praxion_accumulated: summary.praxion_accumulated - amount,
    })
    setWalletTransactions([
      { date: 'Today', label: `Redeemed ${amount.toFixed(2)} Praxion stake`, amount: rubanReceived },
      ...walletTransactions,
    ])
    setRedeemAmount('')
    setRedeeming(false)
    alert(`Redeemed ${amount} Praxion for ₽${rubanReceived.toFixed(2)} Ruban Cash (demo)`)
  }

  const formatPercent = (value) => (value * 100).toFixed(1) + '%'
  const formatNumber = (value, decimals = 2) =>
    value ? parseFloat(value).toFixed(decimals) : '0'

  // Economics tab content
  const renderEconomicsTab = () => {
    if (loading) {
      return <div className="eco-loading">Loading economic data...</div>
    }

    if (!period) {
      return <div className="eco-empty">No closed periods yet</div>
    }

    return (
      <div className="eco-content">

        {/* Treasury Section */}
        <section className="eco-section eco-treasury">
          <h2>Treasury &amp; Distribution Order</h2>
          <p className="eco-desc">
            Funded by surplus production. Distribution follows a strict order: reserves first,
            then everyone's basic share, and only the remainder becomes the bonus pool.
          </p>
          <div className="treasury-flow">
            <div className="treasury-sources">
              {treasury.filter(t => t.amount > 0).map((t, i) => (
                <div key={i} className="treasury-item income">
                  <span className="label">{t.movement_type}</span>
                  <span className="value">+{formatNumber(t.amount)}</span>
                </div>
              ))}
            </div>
            <div className="treasury-arrow">→</div>
            <div className="treasury-total">
              <div className="label">1. Total Income</div>
              <div className="value">${formatNumber(ecoIncome)}</div>
            </div>
            <div className="treasury-arrow">→</div>
            <div className="treasury-reserve">
              <div className="label">2. Reserve ({formatPercent(period.reserve_ratio)})</div>
              <div className="value negative">-${formatNumber(ecoReserve)}</div>
            </div>
            <div className="treasury-arrow">→</div>
            <div className="treasury-reserve">
              <div className="label">3. Basic Share ({MOCK_MEMBER_COUNT} × ₽{period.basic_share})</div>
              <div className="value negative">-${formatNumber(ecoBasicSharePool)}</div>
            </div>
            <div className="treasury-arrow">→</div>
            <div className="treasury-surplus">
              <div className="label">4. Bonus Pool</div>
              <div className="value highlight">${formatNumber(ecoBonusPool)}</div>
            </div>
          </div>
          <div className="exchange-rate-line">
            <span className="rate-label">Exchange rate (computed only after steps 2 &amp; 3):</span>
            <span className="rate-formula">
              Bonus Pool ÷ Total Praxion = ${formatNumber(ecoBonusPool)} ÷ {formatNumber(period.total_praxion, 0)} =
            </span>
            <span className="rate-value">₽{formatNumber(ecoExchangeRate, 3)} / Praxion</span>
          </div>
        </section>

        {/* Surplus Pricing Section */}
        <section className="eco-section eco-pricing-tiers">
          <h2>Surplus Pricing</h2>
          <p className="eco-desc">Locals pay wholesale price. Visitors get a worse exchange rate.</p>
          <div className="pricing-tiers two-tier">
            <div className="tier-card local">
              <div className="tier-label">Local / Wholesale</div>
              <div className="tier-price">₽1.00</div>
              <div className="tier-desc">Members & bulk sales — best price</div>
            </div>
            <div className="tier-card visitor">
              <div className="tier-label">Visitor</div>
              <div className="tier-price">$1.50+</div>
              <div className="tier-desc">Tourists — worse exchange rate</div>
            </div>
          </div>
          <p className="pricing-note">
            Visitor demand affects pricing — higher demand increases their rate. Locals always pay wholesale.
          </p>
        </section>

        {/* Voluntas Section — task incentive multipliers, NOT a Praxion dimension */}
        <section className="eco-section eco-voluntas">
          <h2>Voluntas — Task Incentives</h2>
          <p className="eco-desc">
            Voluntas is not a component of Praxion. It is a multiplier the community sets per
            job to incentivize understaffed tasks and disincentivize oversubscribed ones.
          </p>
          <div className="voluntas-tasks">
            {MOCK_VOLUNTAS_TASKS.map((t) => (
              <div key={t.task} className={`voluntas-task ${t.multiplier > 1 ? 'boost' : t.multiplier < 1 ? 'damp' : 'neutral'}`}>
                <span className="vt-name">{t.task}</span>
                <span className="vt-note">{t.note}</span>
                <span className="vt-multiplier">×{t.multiplier.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <p className="voluntas-note">
            Praxion earned on a task is multiplied by its Voluntas. Multipliers are revised
            each period as sign-ups rebalance.
          </p>
        </section>

        {/* Emergent Weights Section */}
        <section className="eco-section eco-weights">
          <h2>Emergent Weights — Praxion Dimensions</h2>
          <p className="eco-desc">
            Praxion is composed of three dimensions. Scarcity determines value: less abundant = higher weight.
          </p>
          {(() => {
            const totalAction = (period.total_cognitive || 0) +
                               (period.total_emotional || 0) + (period.total_physical || 0)
            const cognitioPercent = totalAction > 0 ? ((period.total_cognitive || 0) / totalAction) * 100 : 33.3
            const sympathiaPercent = totalAction > 0 ? ((period.total_emotional || 0) / totalAction) * 100 : 33.3
            const laborPercent = totalAction > 0 ? ((period.total_physical || 0) / totalAction) * 100 : 33.3

            return (
              <div className="weights-grid dual">
                <DualWeightBar
                  label="Cognitio"
                  actionPercent={cognitioPercent}
                  weight={period.weight_cognitive}
                  color="var(--cognitio)"
                />
                <DualWeightBar
                  label="Sympathia"
                  actionPercent={sympathiaPercent}
                  weight={period.weight_emotional}
                  color="var(--sympathia)"
                />
                <DualWeightBar
                  label="Labor"
                  actionPercent={laborPercent}
                  weight={period.weight_physical}
                  color="var(--labor)"
                />
              </div>
            )
          })()}
          <p className="weights-insight">
            {getWeightInsight(period)}
          </p>
        </section>

        {/* Personal Profile Section */}
        {summary && (
          <section className="eco-section eco-profile">
            <h2>Your Contribution Profile</h2>
            <div className="profile-grid">
              <div className="profile-actio">
                <h3>ACTIO Vector</h3>
                <p className="profile-minutes">{summary.total_minutes} minutes worked</p>
                <div className="actio-bars">
                  <ActioBar
                    label="C"
                    value={summary.weighted_cognitive / summary.total_minutes}
                    color="var(--cognitio)"
                  />
                  <ActioBar
                    label="S"
                    value={summary.weighted_emotional / summary.total_minutes}
                    color="var(--sympathia)"
                  />
                  <ActioBar
                    label="L"
                    value={summary.weighted_physical / summary.total_minutes}
                    color="var(--labor)"
                  />
                </div>
                <div className="profile-voluntas">
                  <span className="pv-label">Avg. Voluntas on your tasks</span>
                  <span className="pv-value">×{formatNumber(summary.voluntas_multiplier, 2)}</span>
                </div>
              </div>

              {devotio && (
                <div className="profile-devotio">
                  <h3>DEVOTIO Coefficient</h3>
                  <div className="devotio-value">{formatNumber(summary.devotio_coefficient, 2)}×</div>
                  <div className="devotio-bars">
                    <DevotioBar label="Vocatio" value={devotio.vocatio} />
                    <DevotioBar label="Opus" value={devotio.opus} />
                    <DevotioBar label="Societas" value={devotio.societas} />
                    <DevotioBar label="Familia" value={devotio.familia} />
                    <DevotioBar label="Salus" value={devotio.salus} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Praxion & Bonus Section */}
        {summary && (() => {
          const praxionRate =
            (summary.weighted_cognitive / summary.total_minutes) * period.weight_cognitive +
            (summary.weighted_emotional / summary.total_minutes) * period.weight_emotional +
            (summary.weighted_physical / summary.total_minutes) * period.weight_physical
          const personalBonus = summary.praxion_earned * ecoExchangeRate

          return (
            <section className="eco-section eco-exchange">
              <h2>Your Praxion &amp; Bonus</h2>
              <p className="eco-desc">
                Praxion measures your weighted contribution. It does not set the pool —
                it determines your share of the bonus after basic shares are paid.
              </p>
              <div className="exchange-formula">
                <span className="formula-part" style={{color: 'var(--cognitio)'}}>
                  {formatPercent(summary.weighted_cognitive / summary.total_minutes)} × {formatNumber(period.weight_cognitive, 3)}
                </span>
                <span className="formula-op">+</span>
                <span className="formula-part" style={{color: 'var(--sympathia)'}}>
                  {formatPercent(summary.weighted_emotional / summary.total_minutes)} × {formatNumber(period.weight_emotional, 3)}
                </span>
                <span className="formula-op">+</span>
                <span className="formula-part" style={{color: 'var(--labor)'}}>
                  {formatPercent(summary.weighted_physical / summary.total_minutes)} × {formatNumber(period.weight_physical, 3)}
                </span>
                <span className="formula-op">=</span>
                <span className="formula-result">{formatNumber(praxionRate, 3)} Praxion/min</span>
              </div>
              <div className="exchange-formula praxion-total">
                <span className="formula-part">{summary.total_minutes} min</span>
                <span className="formula-op">×</span>
                <span className="formula-part">{formatNumber(praxionRate, 3)}</span>
                <span className="formula-op">×</span>
                <span className="formula-part" style={{color: 'var(--voluntas)'}}>
                  {formatNumber(summary.voluntas_multiplier, 2)} Voluntas
                </span>
                <span className="formula-op">×</span>
                <span className="formula-part">{formatNumber(summary.devotio_coefficient, 2)} DEVOTIO</span>
                <span className="formula-op">=</span>
                <span className="formula-result">{formatNumber(summary.praxion_earned)} Praxion</span>
              </div>
              <div className="exchange-formula praxion-bonus">
                <span className="formula-part">{formatNumber(summary.praxion_earned)} Praxion</span>
                <span className="formula-op">×</span>
                <span className="formula-part">₽{formatNumber(ecoExchangeRate, 3)}</span>
                <span className="formula-op">=</span>
                <span className="formula-result">₽{formatNumber(personalBonus)} bonus</span>
              </div>
              <p className="exchange-insight">
                Your basic share of ₽{formatNumber(period.basic_share)} is unconditional. Your
                {' '}{formatNumber(summary.praxion_earned)} Praxion converted to a
                {' '}₽{formatNumber(personalBonus)} bonus at this period's rate.
              </p>
            </section>
          )
        })()}

        {/* Wallet Section (demo) */}
        {summary && (
          <section className="eco-section eco-wallet">
            <h2>Wallet</h2>
            <p className="eco-desc">Demo preview — balances and movements are illustrative.</p>

            <div className="wallet-layout">
              {/* Balance card */}
              <div className="wallet-card">
                <div className="wallet-card-header">
                  <span className="wallet-brand">RUBAN</span>
                  <span className="wallet-period">Period {period.period_number}</span>
                </div>
                <div className="wallet-balance">
                  <span className="wallet-balance-label">Available balance</span>
                  <span className="wallet-balance-value">₽ {formatNumber(walletBalance)}</span>
                </div>
                <div className="wallet-sub-balances">
                  <div className="wallet-sub">
                    <span className="ws-label">Basic share</span>
                    <span className="ws-value">₽ {formatNumber(period.basic_share)}</span>
                  </div>
                  <div className="wallet-sub">
                    <span className="ws-label">Praxion bonus</span>
                    <span className="ws-value">₽ {formatNumber(summary.praxion_earned * ecoExchangeRate)}</span>
                  </div>
                  <div className="wallet-sub">
                    <span className="ws-label">Praxion stake</span>
                    <span className="ws-value">{formatNumber(summary.praxion_accumulated)} ⚡</span>
                  </div>
                </div>
                <div className="wallet-actions">
                  <button className="wallet-btn" onClick={() => alert('Demo: buy surplus production with Ruban Cash')}>
                    📦 Buy surplus
                  </button>
                  <button className="wallet-btn" onClick={() => alert('Demo: convert Ruban Cash to USD')}>
                    💵 To USD
                  </button>
                </div>
              </div>

              {/* Transactions */}
              <div className="wallet-transactions">
                <h3>Movements</h3>
                <div className="wallet-tx-list">
                  {walletTransactions.map((tx, i) => (
                    <div key={i} className="wallet-tx">
                      <span className="tx-date">{tx.date}</span>
                      <span className="tx-label">{tx.label}</span>
                      <span className={`tx-amount ${tx.amount >= 0 ? 'in' : 'out'}`}>
                        {tx.amount >= 0 ? '+' : '−'}₽{formatNumber(Math.abs(tx.amount))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Redeem accumulated Praxion stake */}
                <div className="redeem-section">
                  <h3>Redeem Praxion Stake</h3>
                  <p className="redeem-desc">
                    Convert accumulated Praxion to Ruban Cash at this period's rate
                    (₽{formatNumber(ecoExchangeRate, 3)}), or keep it as a future stake.
                  </p>
                  <div className="redeem-form">
                    <input
                      type="number"
                      placeholder="Praxion to redeem"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      max={summary.praxion_accumulated}
                      step="0.01"
                    />
                    <span className="available">Available: {formatNumber(summary.praxion_accumulated)}</span>
                    <button
                      onClick={handleRedeem}
                      disabled={redeeming || !redeemAmount}
                      className="redeem-btn"
                    >
                      {redeeming ? 'Processing...' : 'Redeem'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cycle Visual */}
        <section className="eco-section eco-cycle">
          <h2>The Cycle</h2>
          <div className="cycle-visual">
            <div className="cycle-step">
              <div className="step-num">1</div>
              <div className="step-text">Work</div>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
              <div className="step-num">2</div>
              <div className="step-text">Register</div>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
              <div className="step-num">3</div>
              <div className="step-text">Close</div>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step active">
              <div className="step-num">4</div>
              <div className="step-text">Decide</div>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
              <div className="step-num">5</div>
              <div className="step-text">Anchor</div>
            </div>
            <div className="cycle-arrow">↺</div>
          </div>
        </section>

        <footer className="eco-footer">
          <p>"We recognize that human effort has texture, and distribution must honor that texture."</p>
          <span>— Gift Economy 2.0</span>
        </footer>
      </div>
    )
  }

  // Calendar tab content — commitments signed in the LL quadrant land here
  const renderCalendarTab = () => {
    const LAYER_COLORS = { HOMESTEAD: '#34d399', GUILD: '#818cf8', CELL: '#fbbf24' }

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const monthLabel = today.toLocaleDateString('en', { month: 'long', year: 'numeric' })
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const byDay = {}
    commitments.forEach(c => {
      const dt = new Date(c.date)
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate()
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(c)
      }
    })

    const upcoming = [...commitments].sort((a, b) => new Date(a.date) - new Date(b.date))

    return (
      <div className="calendar-tab">
        <header className="calendar-header">
          <h1>📅 Calendar</h1>
          <p className="calendar-subtitle">
            Tasks you sign up for in the WE quadrant appear here automatically
          </p>
        </header>

        <div className="calendar-layout">
          {/* Month grid */}
          <section className="calendar-month">
            <h2>{monthLabel}</h2>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="calendar-dow">{d}</div>
              ))}
              {cells.map((day, i) => (
                <div
                  key={i}
                  className={`calendar-cell ${day === null ? 'empty' : ''} ${day === today.getDate() ? 'today' : ''}`}
                >
                  {day && <span className="cell-day">{day}</span>}
                  {day && byDay[day]?.map(c => (
                    <div
                      key={c.taskId}
                      className="calendar-chip"
                      style={{ '--layer-color': LAYER_COLORS[c.layer] || '#888' }}
                      title={`${c.title} (${c.layer}, ~${c.hours}h)`}
                    >
                      {c.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="calendar-legend">
              {Object.entries(LAYER_COLORS).map(([layer, color]) => (
                <span key={layer} className="legend-entry">
                  <span className="legend-swatch" style={{ background: color }} />
                  {layer}
                </span>
              ))}
            </div>
          </section>

          {/* Upcoming commitments */}
          <section className="calendar-upcoming">
            <h2>Your Commitments</h2>
            {upcoming.length === 0 ? (
              <p className="calendar-empty">
                No commitments yet. Open the WE quadrant (lower left) and sign up
                for a task — it will show up here.
              </p>
            ) : (
              <div className="upcoming-list">
                {upcoming.map(c => (
                  <div key={c.taskId} className="upcoming-item" style={{ '--layer-color': LAYER_COLORS[c.layer] || '#888' }}>
                    <div className="upcoming-date">
                      <span className="ud-day">{new Date(c.date).getDate()}</span>
                      <span className="ud-month">{new Date(c.date).toLocaleDateString('en', { month: 'short' })}</span>
                    </div>
                    <div className="upcoming-info">
                      <span className="upcoming-title">{c.title}</span>
                      <span className="upcoming-meta">{c.layer} · ~{c.hours}h · V = {c.V?.toFixed(1)}</span>
                    </div>
                    <button
                      className="upcoming-remove"
                      title="Remove from calendar"
                      onClick={() => removeCommitment(c.taskId)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-view">
      {/* Top Bar */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <button className="topbar-back-btn" onClick={onBack}>
            ←
          </button>
          <div className="topbar-brand">
            <span className="brand-title">C.O.S.</span>
            <span className="brand-subtitle">Dashboard</span>
          </div>
        </div>

        <div className="topbar-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`topbar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="topbar-right">
          <button className="topbar-signout" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'cornucopia' && (
          <div className="cornucopia-tab">
            <header className="cornucopia-header">
              <h1>🌽 Cornucopia</h1>
              <p className="cornucopia-subtitle">Customize your weekly food basket from available production</p>
            </header>

            <section className="customize-section">
              <h2>Customize Your Basket</h2>
              <p className="customize-desc">Adjust quantities within available limits. What you don't take becomes surplus.</p>

              <div className="product-list">
                {/* Vegetables */}
                <div className="product-category">
                  <h3>🥬 Vegetables</h3>
                  <div className="product-row">
                    <span className="product-name">Mixed Greens</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="500" step="100" min="0" max="1000" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 1000g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Root Vegetables</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="1000" step="250" min="0" max="2000" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 2000g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Tomatoes</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="750" step="250" min="0" max="1500" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 1500g available</span>
                  </div>
                </div>

                {/* Meat */}
                <div className="product-category">
                  <h3>🥩 Meat</h3>
                  <div className="product-row">
                    <span className="product-name">Pastured Beef</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="500" step="100" min="0" max="1000" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 1000g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Pastured Chicken</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="1" step="1" min="0" max="2" />
                      <span className="qty-unit">whole</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 2 available</span>
                  </div>
                </div>

                {/* Dairy & Eggs */}
                <div className="product-category">
                  <h3>🥛 Dairy & Eggs</h3>
                  <div className="product-row">
                    <span className="product-name">Fresh Milk</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="2" step="0.5" min="0" max="4" />
                      <span className="qty-unit">L</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 4L available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Yoghurt</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="500" step="250" min="0" max="1000" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 1000g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Cheese</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="250" step="50" min="0" max="500" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 500g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Eggs</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="12" step="6" min="0" max="24" />
                      <span className="qty-unit">units</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 24 available</span>
                  </div>
                </div>

                {/* Pantry */}
                <div className="product-category">
                  <h3>🍯 Pantry</h3>
                  <div className="product-row">
                    <span className="product-name">Honey</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="250" step="50" min="0" max="500" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 500g available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Sourdough Bread</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="1" step="1" min="0" max="2" />
                      <span className="qty-unit">loaf</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 2 available</span>
                  </div>
                  <div className="product-row">
                    <span className="product-name">Grains & Flour</span>
                    <div className="product-controls">
                      <button className="qty-btn">−</button>
                      <input type="number" className="qty-input" defaultValue="1000" step="500" min="0" max="2000" />
                      <span className="qty-unit">g</span>
                      <button className="qty-btn">+</button>
                    </div>
                    <span className="product-available">/ 2000g available</span>
                  </div>
                </div>
              </div>

              <div className="basket-actions">
                <button className="btn-save-basket">Save My Basket</button>
                <button className="btn-reset-basket">Reset to Default</button>
              </div>
            </section>

            <section className="pickup-section">
              <h2>Pickup</h2>
              <div className="pickup-info">
                <div className="pickup-detail">
                  <span className="pickup-label">Location</span>
                  <span className="pickup-value">Community Store</span>
                </div>
                <div className="pickup-detail">
                  <span className="pickup-label">Available</span>
                  <span className="pickup-value">Saturday 8am - 12pm</span>
                </div>
                <div className="pickup-detail">
                  <span className="pickup-label">Status</span>
                  <span className="pickup-value status-ready">Ready for pickup</span>
                </div>
              </div>
            </section>

            <p className="cornucopia-note">
              What you don't allocate becomes surplus — sold at wholesale or to visitors.
              You can also trade with other members.
            </p>
          </div>
        )}

        {activeTab === 'deliberatorium' && <ArgumentMap />}

        {activeTab === 'economics' && renderEconomicsTab()}

        {activeTab === 'wallet' && (
          <div className="tab-placeholder">
            <h2>Wallet</h2>
            <p>View your balance and transactions</p>
          </div>
        )}

        {activeTab === 'calendar' && renderCalendarTab()}

        {activeTab === 'settings' && (
          <div className="tab-placeholder">
            <h2>Settings</h2>
            <p>Configure your preferences</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
