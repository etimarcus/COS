/**
 * Shared commitments store (demo)
 *
 * When a member signs up for a task in the Lower Left quadrant, a
 * commitment is stored here and automatically appears in the Dashboard
 * calendar. Persisted in localStorage; a window event keeps any mounted
 * views in sync within the same session.
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pos-commitments'
const CHANGE_EVENT = 'pos-commitments-changed'

export function getCommitments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* storage unavailable - demo only */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// Mock tasks carry no date, so scheduling picks a deterministic day in the
// next two weeks (hash of the task id) — stable across re-renders and sessions
export function scheduleDateFor(taskId) {
  let hash = 0
  for (const ch of String(taskId)) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  const d = new Date()
  d.setDate(d.getDate() + (hash % 13) + 1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function isCommitted(taskId) {
  return getCommitments().some(c => c.taskId === taskId)
}

export function addCommitment(task, layer) {
  const list = getCommitments()
  if (list.some(c => c.taskId === task.id)) return list

  const next = [
    ...list,
    {
      taskId: task.id,
      title: task.title,
      layer,
      date: scheduleDateFor(task.id),
      hours: task.hours_est,
      V: task.V,
    },
  ]
  save(next)
  return next
}

export function removeCommitment(taskId) {
  save(getCommitments().filter(c => c.taskId !== taskId))
}

// Reactive view of the store — re-renders on add/remove from any component
export function useCommitments() {
  const [commitments, setCommitments] = useState(getCommitments)

  useEffect(() => {
    const refresh = () => setCommitments(getCommitments())
    window.addEventListener(CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return commitments
}
