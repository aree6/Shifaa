import { useEffect, useState } from 'react'
import { SHIFFA_DATA_CHANGED_EVENT } from './dataEvents'

export function useDataChanged() {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onChanged = () => setVersion((v) => v + 1)
    window.addEventListener(SHIFFA_DATA_CHANGED_EVENT, onChanged)
    window.addEventListener('storage', onChanged)
    return () => {
      window.removeEventListener(SHIFFA_DATA_CHANGED_EVENT, onChanged)
      window.removeEventListener('storage', onChanged)
    }
  }, [])

  return version
}
