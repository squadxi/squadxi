import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrophyRow } from '../types'
import './TrophyToast.css'

interface TrophyToastProps {
  trophies: TrophyRow[]
  onDismiss: (id: number) => void
}

export function TrophyToast({ trophies, onDismiss }: TrophyToastProps) {
  const { t } = useTranslation()

  return (
    <div className="sqx-toast-stack">
      {trophies.map((trophy) => (
        <ToastItem key={trophy.id} trophy={trophy} label={t('trophies.unlockedToast', { nom: trophy.ligne })} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ trophy, label, onDismiss }: { trophy: TrophyRow; label: string; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(trophy.id), 4000)
    return () => clearTimeout(timer)
  }, [trophy.id, onDismiss])

  return (
    <div className="sqx-toast" onClick={() => onDismiss(trophy.id)}>
      🏆 {label} ({trophy.palier})
    </div>
  )
}
