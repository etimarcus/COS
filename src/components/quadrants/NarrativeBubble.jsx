/**
 * NarrativeBubble - Parameterized community narrative
 *
 * Displays a text decomposed into meaningful blocks (tokens) with
 * shades by semantic type. Each block is clickable: it opens a panel
 * where you can add/remove relevance (vote) on the existing variants
 * or propose a new one. The variant with the most relevance is the current one.
 *
 * Demo: the user's votes and proposals are persisted in localStorage.
 */

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  // Variants of a block = the base ones + those proposed by the user
  const getVariants = useCallback((block) => {
    const proposed = userData.proposals[block.id] || []
    return [...block.variants, ...proposed]
  }, [userData.proposals])

  // Relevance = base votes + the user's vote (-1, 0, +1)
  const getScore = useCallback((blockId, variant) => {
    const userVote = userData.votes[blockId]?.[variant.id] || 0
    return variant.votes + userVote
  }, [userData.votes])

  // Current variant = the one with the most relevance
  const getActiveVariant = useCallback((block) => {
    const variants = getVariants(block)
    return variants.reduce((best, v) =>
      getScore(block.id, v) > getScore(block.id, best) ? v : best
    , variants[0])
  }, [getVariants, getScore])

  const handleVote = useCallback((blockId, variantId, direction) => {
    setUserData(prev => {
      const blockVotes = { ...(prev.votes[blockId] || {}) }
      // Voting again in the same direction removes the vote (toggle)
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
        author: 'You',
      }
      return { ...prev, proposals: { ...prev.proposals, [blockId]: [...existing, newVariant] } }
    })
    setProposalText('')
    onShowInfo?.('Variant proposed - it can now receive votes')
  }, [proposalText, onShowInfo])

  if (!narrative) return null

  const selectedBlock = selectedBlockId
    ? narrative.blocks.find(b => b.id === selectedBlockId)
    : null

  // Portal to body: fixed ancestors (os-container) trap z-index in WebKit,
  // leaving the cross dividers and center disc above the overlay
  return createPortal(
    <div className="narrative-overlay" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div className="narrative-content" onClick={(e) => e.stopPropagation()}>
        <button className="bubble-close" onClick={onClose}>×</button>

        <h3>{narrative.title}</h3>
        <span className="narrative-category">{narrative.category}</span>
        <p className="narrative-intro">{narrative.intro}</p>

        {/* Semantic type legend */}
        <div className="narrative-legend">
          {Object.entries(TOKEN_TYPES).map(([key, type]) => (
            <span key={key} className="legend-item" style={{ '--token-color': type.color }}>
              <span className="legend-dot" />
              {type.label}
            </span>
          ))}
        </div>

        {/* Tokenized text */}
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
                title={`${TOKEN_TYPES[block.type].label} - ${variantCount} variant${variantCount !== 1 ? 's' : ''}`}
              >
                {active.text}
                {variantCount > 1 && <sup className="token-count">{variantCount}</sup>}
              </button>
            )
          })}
        </div>

        {/* Variants panel for the selected block */}
        {selectedBlock && (
          <div className="variants-panel" style={{ '--token-color': TOKEN_TYPES[selectedBlock.type].color }}>
            <div className="variants-header">
              <span className="variants-type">
                <span className="legend-dot" />
                {TOKEN_TYPES[selectedBlock.type].label}
              </span>
              <span className="variants-hint">Add or remove relevance from the variants, or propose a new one</span>
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
                          title="Add relevance"
                        >
                          ▲
                        </button>
                        <span className="vote-score">{variant.score}</span>
                        <button
                          className={`vote-btn down ${userVote === -1 ? 'voted' : ''}`}
                          onClick={() => handleVote(selectedBlock.id, variant.id, -1)}
                          title="Remove relevance"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="variant-body">
                        <span className="variant-text">{variant.text}</span>
                        <span className="variant-meta">
                          {isActive && <span className="variant-badge">current</span>}
                          proposed by {variant.author}
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
                placeholder="Propose a new variant for this block..."
              />
              <button
                className="btn-propose"
                onClick={() => handlePropose(selectedBlock.id)}
                disabled={!proposalText.trim()}
              >
                Propose
              </button>
            </div>
          </div>
        )}

        <p className="narrative-note">
          Living narrative: the text is composed from the most relevant variant of each block.
        </p>
      </div>
    </div>,
    document.body
  )
}

export default NarrativeBubble
