/**
 * NarrativeBubble - Narrativa comunitaria parametrizada
 *
 * Muestra un texto descompuesto en bloques significantes (tokens) con
 * tonalidades por tipo semántico. Cada bloque es clickeable: abre un panel
 * donde se puede dar/quitar relevancia (votar) a las variantes existentes
 * o proponer una nueva. La variante con mayor relevancia es la vigente.
 *
 * Demo: votos y propuestas del usuario se persisten en localStorage.
 */

import { useState, useCallback, useEffect } from 'react'
import { NARRATIVES, TOKEN_TYPES } from '../../data/demoNarratives'
import './NarrativeBubble.css'

const emptyUserData = { votes: {}, proposals: {} }

const loadUserData = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key))
    return { ...emptyUserData, ...stored }
  } catch {
    return emptyUserData
  }
}

export function NarrativeBubble({ narrativeId, onClose, onShowInfo }) {
  const narrative = NARRATIVES[narrativeId]
  const storageKey = `pos-narrative-${narrativeId}`

  const [userData, setUserData] = useState(() => loadUserData(storageKey))
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [proposalText, setProposalText] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(userData))
    } catch { /* storage full or unavailable - demo only */ }
  }, [userData, storageKey])

  // Variantes de un bloque = las de base + las propuestas por el usuario
  const getVariants = useCallback((block) => {
    const proposed = userData.proposals[block.id] || []
    return [...block.variants, ...proposed]
  }, [userData.proposals])

  // Relevancia = votos base + voto del usuario (-1, 0, +1)
  const getScore = useCallback((blockId, variant) => {
    const userVote = userData.votes[blockId]?.[variant.id] || 0
    return variant.votes + userVote
  }, [userData.votes])

  // Variante vigente = la de mayor relevancia
  const getActiveVariant = useCallback((block) => {
    const variants = getVariants(block)
    return variants.reduce((best, v) =>
      getScore(block.id, v) > getScore(block.id, best) ? v : best
    , variants[0])
  }, [getVariants, getScore])

  const handleVote = useCallback((blockId, variantId, direction) => {
    setUserData(prev => {
      const blockVotes = { ...(prev.votes[blockId] || {}) }
      // Votar de nuevo en la misma dirección quita el voto (toggle)
      blockVotes[variantId] = blockVotes[variantId] === direction ? 0 : direction
      return { ...prev, votes: { ...prev.votes, [blockId]: blockVotes } }
    })
  }, [])

  const handlePropose = useCallback((blockId) => {
    const text = proposalText.trim()
    if (!text) return
    setUserData(prev => {
      const existing = prev.proposals[blockId] || []
      const newVariant = {
        id: `user-${existing.length + 1}`,
        text,
        votes: 0,
        author: 'Tú',
      }
      return { ...prev, proposals: { ...prev.proposals, [blockId]: [...existing, newVariant] } }
    })
    setProposalText('')
    onShowInfo?.('Variante propuesta - ahora puede recibir votos')
  }, [proposalText, onShowInfo])

  if (!narrative) return null

  const selectedBlock = selectedBlockId
    ? narrative.blocks.find(b => b.id === selectedBlockId)
    : null

  return (
    <div className="narrative-overlay" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div className="narrative-content" onClick={(e) => e.stopPropagation()}>
        <button className="bubble-close" onClick={onClose}>×</button>

        <h3>{narrative.title}</h3>
        <span className="narrative-category">{narrative.category}</span>
        <p className="narrative-intro">{narrative.intro}</p>

        {/* Leyenda de tipos semánticos */}
        <div className="narrative-legend">
          {Object.entries(TOKEN_TYPES).map(([key, type]) => (
            <span key={key} className="legend-item" style={{ '--token-color': type.color }}>
              <span className="legend-dot" />
              {type.label}
            </span>
          ))}
        </div>

        {/* Texto tokenizado */}
        <div className="narrative-text">
          {narrative.blocks.map((block, i) => {
            if (!block.variants) {
              return <span key={i} className="narrative-fixed">{block.text}</span>
            }
            const active = getActiveVariant(block)
            const variantCount = getVariants(block).length
            const isSelected = selectedBlockId === block.id
            return (
              <button
                key={block.id}
                className={`narrative-token ${isSelected ? 'selected' : ''}`}
                style={{ '--token-color': TOKEN_TYPES[block.type].color }}
                onClick={() => {
                  setSelectedBlockId(isSelected ? null : block.id)
                  setProposalText('')
                }}
                title={`${TOKEN_TYPES[block.type].label} - ${variantCount} variante${variantCount !== 1 ? 's' : ''}`}
              >
                {active.text}
                {variantCount > 1 && <sup className="token-count">{variantCount}</sup>}
              </button>
            )
          })}
        </div>

        {/* Panel de variantes del bloque seleccionado */}
        {selectedBlock && (
          <div className="variants-panel" style={{ '--token-color': TOKEN_TYPES[selectedBlock.type].color }}>
            <div className="variants-header">
              <span className="variants-type">
                <span className="legend-dot" />
                {TOKEN_TYPES[selectedBlock.type].label}
              </span>
              <span className="variants-hint">Dale o quitale relevancia a las variantes, o proponé una nueva</span>
            </div>

            <div className="variants-list">
              {getVariants(selectedBlock)
                .map(v => ({ ...v, score: getScore(selectedBlock.id, v) }))
                .sort((a, b) => b.score - a.score)
                .map((variant, idx) => {
                  const userVote = userData.votes[selectedBlock.id]?.[variant.id] || 0
                  const isActive = idx === 0
                  return (
                    <div key={variant.id} className={`variant-item ${isActive ? 'active' : ''}`}>
                      <div className="variant-votes">
                        <button
                          className={`vote-btn up ${userVote === 1 ? 'voted' : ''}`}
                          onClick={() => handleVote(selectedBlock.id, variant.id, 1)}
                          title="Dar relevancia"
                        >
                          ▲
                        </button>
                        <span className="vote-score">{variant.score}</span>
                        <button
                          className={`vote-btn down ${userVote === -1 ? 'voted' : ''}`}
                          onClick={() => handleVote(selectedBlock.id, variant.id, -1)}
                          title="Quitar relevancia"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="variant-body">
                        <span className="variant-text">{variant.text}</span>
                        <span className="variant-meta">
                          {isActive && <span className="variant-badge">vigente</span>}
                          propuesta por {variant.author}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="variant-propose">
              <input
                type="text"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePropose(selectedBlock.id) }}
                placeholder="Proponer una nueva variante para este bloque..."
              />
              <button
                className="btn-propose"
                onClick={() => handlePropose(selectedBlock.id)}
                disabled={!proposalText.trim()}
              >
                Proponer
              </button>
            </div>
          </div>
        )}

        <p className="narrative-note">
          Narrativa viva: el texto se compone con la variante más relevante de cada bloque.
        </p>
      </div>
    </div>
  )
}

export default NarrativeBubble
