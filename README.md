# SquadXI — squelette de projet

Point de depart pour Claude Code. Structure :

```
squadxi/
├── docs/
│   ├── GDD-jeu-football-roguelike.md   <- Design complet (regles, economie, modes, legal, i18n)
│   ├── Prototype-scoring-jeu-football.xlsx <- Simulateur de scoring pour equilibrage
│   └── squadxi-landing.html            <- Maquette de landing page (reference visuelle, optionnel)
├── src/
│   ├── App.tsx                         <- Point d'entree, a construire
│   ├── main.tsx
│   └── lib/supabase.ts                 <- Client Supabase deja configure
├── supabase/
│   └── migrations/0001_init.sql        <- Schema complet + 65 joueurs + bareme + 30 tactiques + 95 trophees deja seedes
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example                        <- A copier en .env.local avec tes vraies cles Supabase
```

## Pour demarrer avec Claude Code

1. Decompresse ce dossier quelque part sur ton disque (ex: `~/projects/squadxi`).
2. Copie ce dossier dans ton repo GitHub `squadxi` (ou pousse-le directement avec `git init && git add . && git commit -m "init" && git push`).
3. Copie `.env.example` en `.env.local`, remplis avec l'URL et la cle anonyme de ton projet Supabase (Project Settings > API).
4. Dans le dossier, lance Claude Code (`claude` dans le terminal, ou ouvre le dossier dans Claude Code desktop/VS Code).
5. Applique la migration SQL dans ton projet Supabase : soit via `supabase db push` (CLI Supabase), soit en copiant-collant le contenu de `supabase/migrations/0001_init.sql` dans l'editeur SQL du dashboard Supabase.
6. Demande a Claude Code de lire `docs/GDD-jeu-football-roguelike.md` en premier, puis de construire l'ecran de jeu (main de cartes, detection de combo, boutique) en s'appuyant sur les tables deja en place.

## Commandes locales

```
npm install
npm run dev
```

## Etat actuel

- [x] Design complet (regles, economie, modes, monetisation, legal, i18n)
- [x] Prototype de scoring valide (tableur)
- [x] Schema Supabase + donnees de base (joueurs, bareme, tactiques, trophees)
- [ ] Ecran de jeu (main de cartes, detection de combo, animations de score)
- [ ] Authentification (email/mdp + Google/Apple)
- [ ] Boutique (Mercato)
- [ ] Mode Pro + Stripe
- [ ] Modes Championnat / Defi quotidien / Duel
- [ ] i18n (FR/EN/ES/PT/IT/DE)
