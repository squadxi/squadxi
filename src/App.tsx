import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Point de depart. Claude Code peut prendre le relais a partir d'ici
// pour construire l'ecran de jeu (main de cartes, scoring, boutique)
// en s'appuyant sur le GDD dans /docs et le schema dans /supabase/migrations.

export default function App() {
  const [playerCount, setPlayerCount] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setPlayerCount(count ?? 0))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40 }}>
      <h1>SquadXI — squelette de projet</h1>
      <p>
        Connexion Supabase : {playerCount === null ? 'chargement...' : `${playerCount} joueurs trouves en base`}
      </p>
      <p>Voir /docs/GDD-jeu-football-roguelike.md pour le design complet.</p>
    </div>
  )
}
