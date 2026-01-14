export const SHIFFA_DATA_CHANGED_EVENT = 'shiffa:data-changed'

export function emitDataChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SHIFFA_DATA_CHANGED_EVENT))
}
