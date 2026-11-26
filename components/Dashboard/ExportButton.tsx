// components/Dashboard/ExportButton.tsx

'use client'

import { useRef, useState } from 'react'
import { exportElementToPng } from '@/lib/export/exportElement'

interface ExportButtonProps {
  /** Ref vers l'élément à capturer (le dashboard entier) */
  targetRef: React.RefObject<HTMLElement | null>
  fileName: string
}

export function ExportButton({ targetRef, fileName }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    if (!targetRef.current) return
    setLoading(true)
    setError(null)
    try {
      await exportElementToPng(targetRef.current, fileName)
    } catch (e) {
      console.error('[export] failed:', e)
      setError('Export impossible. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {loading ? 'Export...' : 'Exporter en PNG'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}