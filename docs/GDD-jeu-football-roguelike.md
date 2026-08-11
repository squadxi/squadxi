# SquadXI — Roguelike de cartes football
### Document de Design (v0.1)

> Pitch : un roguelike de scoring par cartes, façon Balatro, où les cartes sont des joueurs de football réels. Tu construis des "mains" de joueurs qui combinent Championnat, Note et Nationalité pour marquer des points et gravir une saison de club — montée, titres, coupes.

---

## 1. Boucle de jeu (Core Loop)

Identique dans sa structure à Balatro, habillée football :

```
Saison → Journée (Ante) → Match (Blind) → Mercato (Shop) → Journée suivante → ...
```

- **Saison** = une run complète (partie).
- **Journée** = un palier de difficulté (équivalent Ante). Chaque journée contient 3 matchs.
- **Match** = un objectif de score à atteindre en un nombre limité de "manches de jeu" (mains jouées) et de changements (défausses) — équivalent Blind.
  - Match aller (Small Blind)
  - Match retour (Big Blind)
  - **Grand Rival** (Boss Blind) — un match avec une règle spéciale/pénalisante à contourner (voir §7).
- **Mercato** = la boutique entre chaque match : acheter des Tactiques (Jokers), des joueurs, des Trophées (upgrades), retirer/améliorer des cartes du deck.
- Fin de saison si tu échoues à atteindre le score requis à un match → **Game Over** (comme Balatro). Réussir tous les matchs d'une saison → progression vers la saison suivante (division supérieure) avec deck de départ enrichi ou nouveau run plus dur (mode "Boucle sans fin" à définir plus tard).

---

## 2. Le système de cartes — les 3 axes

Chaque carte joueur porte 3 attributs. Les deux premiers remplacent Couleur/Valeur de Balatro et servent à **détecter le type de main**. Le troisième est une couche de bonus qui se calcule **après** la main, comme les sceaux/éditions de Balatro.

| Axe Balatro | Axe foot | Rôle |
|---|---|---|
| Couleur (4) | **Championnat** (5) : Premier League, Liga, Serie A, Bundesliga, Ligue 1 | Détecte les "Alignements" (flush) |
| Valeur (1-13, As-Roi) | **Note** (As=le meilleur, 2=le plus faible) | Détecte Duo/Trio/Enchaînement/Carré |
| — (sceau/édition) | **Nationalité** | Bonus de mult additionnel, calculé après la main |

- Note : As = meilleur (Pelé, Messi, Maradona, Cruyff...), 13 valeurs → 2 = jeunes espoirs/joueurs de complément.
- Un deck complet = 5 championnats × 13 notes = **65 cartes** de base (contre 52 pour Balatro). On peut avoir plusieurs joueurs sur la même case Championnat/Note (ex : deux "As Ligue 1" possibles) pour varier le pool réel de joueurs — à trancher en §9.

---

## 3. Les mains (types de combinaisons)

Reprennent exactement la hiérarchie et les formules Balatro, renommées :

| Nom Balatro | Nom foot | Condition | Base Points | Base Mult |
|---|---|---|---|---|
| Carte haute | **Solo** | 1 carte | 5 | 1 |
| Paire | **Duo** | 2 même Note | 10 | 2 |
| Double paire | **Double Duo** | 2×2 même Note | 20 | 2 |
| Brelan | **Trio offensif** | 3 même Note | 30 | 3 |
| Suite | **Enchaînement** | 5 Notes consécutives | 30 | 4 |
| Couleur | **Alignement** | 5 même Championnat | 35 | 4 |
| Full | **Full** | Trio + Duo | 40 | 4 |
| Carré | **Carré magique** | 4 même Note | 60 | 7 |
| Quinte flush | **Sélection parfaite** | Enchaînement + Alignement | 100 | 8 |
| Quinte flush royale | **Onze de légende** | Sélection parfaite avec les 5 notes les plus hautes (As-Roi-Dame-Valet-10) | 160 | 12 |

*(Ces valeurs de base sont un point de départ à équilibrer en playtest — même logique que Balatro.)*

### Bonus Nationalité (couche 3)
Une fois la main jouée, on regarde parmi les cartes utilisées : chaque paire de joueurs partageant la **même nationalité** ajoute un petit bonus de mult (ex : +0.5 mult par paire). Si une carte partage **à la fois** Championnat (déjà comptée dans l'Alignement) ET Nationalité avec une autre carte de la main → bonus doublé sur cette paire. C'est le "combo magnifique" que tu voulais : Championnat + Nationalité alignés = pic de score.

---

## 4. Économie — les Ballons

- Monnaie : **Ballons** (⚽), équivalent du `$` de Balatro.
- Gains : Ballons de fin de match (score atteint), intérêts sur Ballons non dépensés (comme Balatro, plafonnés), bonus de "manches restantes non jouées".
- Dépenses au Mercato : acheter des Tactiques, acheter/retirer/améliorer des joueurs, acheter des Trophées.

---

## 5. Tactiques (équivalent Jokers)

Objets passifs achetés en boutique, jusqu'à N slots actifs simultanément (5 pour le prototype, voir §9). **Cible : une trentaine de Tactiques** à concevoir pour avoir assez de variété/rejouabilité (Balatro en a 150, mais ~30 est un bon objectif pour un MVP jouable). À faire : lister les 30, en couvrant plusieurs familles d'effets (voir ébauche ci-dessous) pour éviter que la boutique ne tourne toujours pareil.

Quelques exemples pour donner le ton :

- **Sélectionneur Africain** — +50 points par joueur africain dans la main jouée.
- **Cœur de Bavière** — x2 mult si tous les joueurs de la main sont du même Championnat.
- **Diaspora** — +1 mult par nationalité différente présente dans la main (à l'inverse de la logique "même nationalité").
- **Pressing Haut** — les Duo rapportent +Note en points bonus.
- **Meneur de Jeu** — la carte la plus à gauche de la main jouée voit sa Note comptée deux fois.
- **Effet Cruyff** — Carré magique rapporte x2 mult supplémentaire.

---

## 6. Consommables

Deux familles, comme Tarot/Planète dans Balatro :

- **Cartes Tactiques** (= Tarot) : effet ponctuel à usage unique — changer la Note ou le Championnat d'une carte, dupliquer une carte, transformer un joueur, etc.
- **Trophées** (= Cartes Planète) : améliorent définitivement la valeur de base d'un type de main (ex : le Trophée "Ballon d'Or" augmente points+mult de base du Carré magique à chaque utilisation).

---

## 7. Grands Rivaux (Boss Blinds)

Le match "Grand Rival" en fin de journée impose une contrainte à contourner, ex :
- **"Le Bus Parqué"** — les Alignements (flush) ne rapportent aucun bonus de Championnat ce match.
- **"Le Volcan"** (Boca/River style) — les Duo composés de deux joueurs de même club rival direct sont annulés.
- **"VAR"** — la carte la plus forte de chaque main jouée est ignorée dans le calcul.

---

## 8. Progression de la Saison

- Structure narrative : **Saison de club** — Division 2 → Division 1 → Coupe nationale → Coupe d'Europe, avec montée/descente symbolique entre les runs (méta-progression légère, façon "stakes" de Balatro).
- Chaque saison réussie débloque un niveau de difficulté supérieur pour la suivante (adversaires plus forts, Grands Rivaux plus punitifs) et débloque du contenu permanent (nouveaux Tactiques disponibles au pool, nouveaux joueurs).

---

## 9. Décisions actées (v0.2)

1. **Noms de joueurs** : vrais noms réels retenus pour le prototype (Pelé, Messi, etc.). ⚠️ Risque juridique confirmé et assumé pour l'instant (droit à l'image, droits fédératifs) — à réévaluer sérieusement **avant toute publication/monétisation réelle** : soit basculer sur des joueurs fictifs inspirés, soit sécuriser une licence. Ne pas lancer la version publique/payante sans avoir tranché ce point.
2. **Deck** : 65 cartes strict — 5 Championnats × 13 Notes, un seul joueur réel par case Championnat/Note. Implique de choisir avec soin *quel* joueur incarne chaque case (ex : seul un joueur peut être "As Ligue 1").
3. **Mains/défausses/slots** : on colle aux valeurs Balatro pour le prototype — 5 mains jouées et 3 défausses par match, 5 slots de Tactiques actifs. Sujet à équilibrage après playtest.
4. **Structure de run** : saison fixe (montée + coupes) avec fin claire, puis relance d'une nouvelle saison — pas de mode sans fin pour l'instant.
5. **Stack technique** : React + Vite + Supabase + déploiement Vercel, en cohérence avec APOGÉE et app-stream-lab. Point de vigilance : soigner les animations de scoring (Framer Motion ou Canvas) pour retrouver le feeling "juteux" de Balatro.
6. **Direction artistique** : épuré/vectoriel façon Balatro (silhouettes, couleurs flat) — palette, typographie et logo à creuser une fois le prototype de scoring validé.

---

## 10bis. Extension commerciale (Mode Pro, comptes, trophées, i18n)

Décisions actées pour la version visant la publication/monétisation :

**Modes de jeu retenus**
- **Saison de club** (mode de base, **gratuit et complet**) — le mode décrit en §1-9, deck = 65 cartes multi-championnats, sans limitation de contenu ni de nombre de parties.
- **Mode Championnat** (Mode Pro) — deck limité aux 13 joueurs d'un seul championnat ; l'axe "couleur" devient le **Club** (5 clubs de ce championnat) au lieu du Championnat, pour retrouver la mécanique Duo/Alignement/etc. à l'échelle club. Bon fit avec l'habillage "saison de club".
- **Défi quotidien** (Mode Pro, inclus au MVP) — seed fixe partagé par tous les joueurs ce jour-là (même deck, mêmes Grands Rivaux), classement comparatif. Fort potentiel de rétention/viralité malgré le fait d'être payant.
- **Duel / Multijoueur asynchrone** (Mode Pro, inclus au MVP) — deux joueurs affrontent le même seed, le meilleur score de saison gagne.
- Pistes non retenues pour le MVP, à ré-évaluer plus tard : Mode Sélection nationale, Mode Sans Fin (antes infinies après la saison).
- Implication technique pour Défi quotidien / Duel : génération de seed déterministe pour le deck et les Grands Rivaux, table de scores/classement dans Supabase, et pour le Duel un mécanisme de matchmaking ou d'invitation asynchrone (pas de temps réel nécessaire).

**Mode Pro**
- Le **Mode de base (Saison de club) est gratuit et complet**, sans limitation — pas de restriction de contenu, de deck ou de nombre de parties.
- Le Mode Pro débloque du **contenu additionnel** : Mode Championnat, Défi quotidien, Duel/Multijoueur — et, par extension, les **Trophées liés à ces modes**, qui restent visibles (grisés/verrouillés) pour tout le monde afin de donner envie de passer au payant (effet vitrine/FOMO), sans être cachés.
- **Tarification** : CHF 2.-/mois en abonnement, **ou** CHF 15.- en achat unique à vie (lifetime). Double option pour capter aussi bien l'achat impulsif que l'engagement long terme.
- Implication technique : système de paiement gérant à la fois un abonnement récurrent ET un achat unique donnant un accès permanent (Stripe gère les deux nativement — mode "subscription" et mode "payment" à usage unique).

**Comptes utilisateurs**
- **Compte obligatoire dès le lancement** (pas de mode invité), pour simplifier la construction technique et parce que Défi quotidien/Duel nécessitent de toute façon une identité persistante pour les classements.
- Inscription email/mot de passe **et** connexion Google/Apple, au choix.
- Géré via Supabase Auth (cohérent avec le reste de la stack).

**Trophées (~100)**
- Mélange des 3 familles : performance en jeu (score/main), collection (posséder des joueurs/championnats), progression meta (saisons complétées, défis spéciaux).
- Difficulté échelonnée de facile à quasi-impossible (façon trophées PlayStation : Bronze/Argent/Or/Platine ou équivalent foot à inventer, ex : Bronze/Argent/Or/Légende).
- Tous les Trophées liés au **Mode de base** sont accessibles gratuitement à tous. Les Trophées liés aux **modes Mode Pro** (Mode Championnat, Défi quotidien, Duel) restent **visibles mais verrouillés** pour les non-abonnés — effet vitrine qui donne envie de débloquer le Mode Pro, sans jamais cacher leur existence.
- Implication technique : table de suivi de progression par utilisateur dans Supabase, avec triggers/checks après chaque run, et un flag "verrouillé/débloqué" par trophée selon le statut d'abonnement.

**Internationalisation**
- Langues de lancement : **Français, Anglais, Espagnol, Portugais, Italien**.
- Implication technique : architecture i18n dès le départ (fichiers de traduction par clé, pas de texte en dur dans le code), pour éviter une refonte plus tard. Les noms de joueurs et championnats n'ont pas besoin de traduction, mais tous les noms de Tactiques, Trophées, types de mains ("Duo", "Alignement"...) doivent être traduits.
- Point d'attention : l'allemand n'est pas dans la liste malgré le championnat Bundesliga et le marché suisse-alémanique — à confirmer que c'est voulu.

## 10quater. Structure juridique, légal & PC/mobile

**Structure**
- Le jeu sera publié sous une **nouvelle entité/marque dédiée**, distincte d'App-Labs et d'Arc-en-Vins SA. Implique de choisir un nom de marque/société et une forme juridique (à voir avec un fiduciaire/avocat suisse — Sàrl la plus probable vu le profil).

**PC / Mobile — approche recommandée**
- **Web responsive + Progressive Web App (PWA)**, pas d'app native au lancement.
- Justification : un seul code à maintenir (cohérent avec React/Vite déjà choisi), pas de commission de 15-30% App Store/Play Store sur l'abonnement Mode Pro, possibilité d'ajouter des apps natives plus tard sans réécrire la logique métier si le jeu prend.
- Implication design : interface pensée mobile-first (la majorité des joueurs seront sur téléphone), adaptée ensuite au grand écran plutôt que l'inverse.

**Volet légal à préparer avant le lancement public**
- **CGU** (Conditions Générales d'Utilisation) — règles d'usage du site/jeu.
- **CGV** (Conditions Générales de Vente) — spécifiques à l'abonnement Mode Pro (durée, renouvellement automatique, résiliation, remboursement).
- **Politique de confidentialité** — conforme RGPD (si joueurs UE) et LPD (loi suisse sur la protection des données), à adapter selon le marché cible final.
- **Politique de cookies** — bannière de consentement si tracking/analytics.
- **Mentions légales** — identité de l'entité éditrice, hébergeur, contact.
- **Point de vigilance spécifique à ce projet** : l'usage de vrais noms de joueurs (Pelé, Messi...) reste le risque juridique le plus important une fois une société commerciale et un abonnement payant en jeu — validation juridique prévue plus tard, une fois le prototype jouable, avant le lancement public (voir §10ter).
- Marché cible confirmé : **mondial dès le départ**. Implique une conformité plus large que prévu initialement : RGPD (UE), LPD (Suisse), LGPD (Brésil), et probablement des équivalents dans d'autres juridictions selon la traction réelle (ex. CCPA aux États-Unis) — un point à valider avec le même conseil juridique que pour le droit à l'image, pour mutualiser la démarche.

## 10ter. Points ouverts

Tous les points tranchés, sauf le nom de marque final (voir pistes ci-dessous) :

1. ✅ Paliers de Trophées : **Amateur / Semi-pro / Pro / Légende**.
2. ✅ Allemand ajouté aux langues de lancement → liste finale : **Français, Anglais, Espagnol, Portugais, Italien, Allemand**.
3. ✅ Prestataire de paiement : **Stripe** (gère nativement abonnement + achat unique).
4. ✅ Matchmaking Duel : les trois options disponibles — code d'invitation, liste d'amis intégrée, et adversaire aléatoire.
5. ✅ **Nom de marque : SquadXI** (le "XI" = onze en anglais, double sens foot/effectif). Vérification rapide : pas de conflit trouvé (à la différence de "SquadRoyale", déjà pris par un jeu mobile de stratégie militaire, et de "PitchDeck", déjà pris par plusieurs produits). Reste à faire avant officialisation : recherche formelle de marque déposée (IPI en Suisse / EUIPO en UE) et vérification de disponibilité des domaines (.com, .football, .io).
6. ✅ Marché cible : **mondial dès le départ**.
7. ✅ Validation juridique du risque droit à l'image : **plus tard, une fois le prototype jouable, avant le lancement public** — pas un blocage immédiat, mais un jalon obligatoire avant toute mise en ligne commerciale.

## 11. Prochaine étape suggérée

Avant de coder quoi que ce soit : valider le scoring sur papier ou dans un tableur (comme le moteur de pricing d'APOGÉE) — vérifier que la courbe de score par main/Championnat/Nationalité est amusante et équilibrée avant d'investir dans l'UI.

---

## 12. Annexe — Les 30 Tactiques (v0.1)

Objectif : couvrir plusieurs familles d'effets pour que la boutique ne tourne jamais pareil deux fois. Prix indicatifs en Ballons ⚽ (à équilibrer en playtest, comme le Barème). Raretés : **Commune** (facile à trouver), **Rare**, **Légendaire** (rare, très impactante).

### Famille Nationalité (renforce le "combo magnifique")

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 1 | Diaspora | Commune | 5 | +1 Mult par nationalité différente présente dans la main jouée. |
| 2 | Sélectionneur National | Rare | 10 | Mult ×1.5 si les 5 joueurs de la main partagent la même Nationalité. |
| 3 | Transfert International | Rare | 10 | Une carte choisie peut compter pour 2 Nationalités au choix (permanent, jusqu'à revente). |
| 4 | Doublette Historique | Rare | 10 | +Mult ×1.5 supplémentaire chaque fois que le bonus combo Championnat+Nationalité se déclenche plus d'une fois dans la même main. |

### Famille Championnat

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 5 | Cœur de Bavière | Rare | 10 | Mult ×2 si les 5 joueurs de la main sont du même Championnat. |
| 6 | Ultras | Commune | 5 | +15 points par carte partageant le Championnat le plus joué depuis le début du match. |

### Famille Points/Mult liés à la Note

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 7 | Détection de Talents | Commune | 5 | +20 points par carte de Note ≤5 jouée dans la main. |
| 8 | Ballon d'Or | Rare | 10 | +3 Mult si la main contient un As (Note 14). |
| 9 | Pressing Haut | Commune | 5 | Les Duo rapportent des points bonus égaux à la Note du duo. |
| 10 | Retraité Prestigieux | Commune | 5 | Chaque carte de Note ≥12 (Valet/Dame/Roi/As) jouée rapporte +10 points fixes. |
| 11 | Doyen du Vestiaire | Commune | 5 | +0.5 Mult par carte de Note ≤4 présente dans le deck total (pas seulement la main). |
| 12 | Bizuth Prometteur | Commune | 5 | +1 Mult par carte de Note ≤6 jouée dans la main. |

### Famille Type de main

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 13 | Effet Cruyff | Légendaire | 18 | Carré magique (ou mieux) rapporte ×2 Mult supplémentaire. |

### Famille Timing du match

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 14 | Sortie de Vestiaire | Commune | 5 | +2 Mult sur la toute première main jouée de chaque match. |
| 15 | Dernier Quart d'Heure | Rare | 9 | +3 Mult sur la dernière main jouée du match. |

### Famille Ordre de carte

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 16 | Capitanat | Rare | 9 | La carte jouée en 1ère position voit sa Note doublée pour la détection de main. |
| 17 | Numéro 10 | Commune | 5 | La carte en position centrale (3e) de la main gagne +Mult égal à sa Note/2. |

### Famille Économie (Ballons)

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 18 | Banc de Touche | Commune | 4 | +1 Ballon à chaque carte défaussée. |
| 19 | Sponsor Maillot | Commune | 5 | +5 Ballons à chaque match remporté. |
| 20 | Merchandising | Rare | 9 | Le plafond d'intérêts sur les Ballons non dépensés est augmenté de 2. |
| 21 | Sélection B | Commune | 5 | Les mains Trio offensif ou mieux rapportent +1 Ballon par carte utilisée. |

### Famille Risque/récompense

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 22 | Agent Véreux | Rare | 8 | Vend automatiquement la carte de plus faible Note de la main jouée pour des Ballons bonus, mais la retire définitivement du deck. |
| 23 | Carton Rouge | Rare | 9 | La carte de plus haute Note jouée est ignorée dans le calcul des points, mais Mult ×2 en compensation. |

### Famille Utilitaire / mécaniques spéciales

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 24 | Coup Franc Direct | Rare | 9 | 1 fois par match : transforme un Solo en Duo en dupliquant temporairement une carte. |
| 25 | Sang Neuf | Rare | 10 | Entre chaque match, remplace automatiquement la carte de plus faible Note du deck par une carte aléatoire de Note supérieure. |
| 26 | VAR Favorable | Légendaire | 20 | Annule l'effet pénalisant d'un Grand Rival, une fois par match. |
| 27 | Doublure de Luxe | Légendaire | 18 | 1 fois par match : autorise à rejouer une main déjà utilisée sans consommer de main disponible. |
| 28 | Légende Vivante | Légendaire | 20 | 1 fois par saison : transforme n'importe quelle carte jouée en As, pour cette main uniquement. |

### Famille Méta-progression (liée aux Trophées/saisons)

| # | Nom | Rareté | Prix | Effet |
|---|---|---|---|---|
| 29 | Cantera (Formation du Club) | Légendaire | 20 | +1 Mult permanent par saison déjà complétée sur le compte. |
| 30 | Palmarès | Légendaire | 18 | +1 Ballon de départ par Trophée déjà débloqué sur le compte (plafonné, à définir). |

**Répartition** : 4 Nationalité · 2 Championnat · 6 Points/Mult sur Note · 1 Type de main · 2 Timing · 2 Ordre de carte · 4 Économie · 2 Risque/récompense · 5 Utilitaire · 2 Méta-progression.

**Points à équilibrer en playtest** : les Légendaires (6 sur 30, 20%) sont peut-être trop nombreuses pour un pool de départ — Balatro vise plutôt ~10-15% de taux d'apparition Legendary. À ajuster via la fréquence d'apparition en boutique plutôt que via le nombre d'objets créés.

---

## 13. Annexe — Les ~100 Trophées (v0.1)

Structure : 3 familles (Performance, Collection, Progression) déclinées chacune en plusieurs "lignes" de Trophées, chaque ligne progressant sur 4 paliers **Amateur → Semi-pro → Pro → Légende**. Ça donne une grille lisible plutôt que 100 idées isolées, et c'est facile à étendre plus tard.

### Famille Performance (score/main) — 8 lignes × 4 paliers = 32 Trophées

| Ligne | Amateur | Semi-pro | Pro | Légende |
|---|---|---|---|---|
| Score en une main | Atteins 200 pts en une main | 1 000 pts | 5 000 pts | 20 000 pts |
| Score en un match | Atteins 500 pts sur un match | 3 000 pts | 15 000 pts | 60 000 pts |
| Score en une saison | Atteins 5 000 pts cumulés sur une saison | 25 000 pts | 100 000 pts | 500 000 pts |
| Duo joués | Joue 10 Duo au total | 50 Duo | 200 Duo | 1 000 Duo |
| Alignements joués | Joue 5 Alignements | 25 Alignements | 100 Alignements | 500 Alignements |
| Carrés magiques | Réalise 1 Carré magique | 10 Carrés magiques | 50 Carrés magiques | 200 Carrés magiques |
| Sélections parfaites | Réalise 1 Sélection parfaite | 5 Sélections parfaites | 20 Sélections parfaites | 100 Sélections parfaites |
| Onze de légende | Réalise 1 Onze de légende | 3 Onze de légende | 10 Onze de légende | 50 Onze de légende |

### Famille Collection (joueurs/championnats possédés) — 7 lignes × 4 paliers = 28 Trophées

| Ligne | Amateur | Semi-pro | Pro | Légende |
|---|---|---|---|---|
| Cartes découvertes | Découvre 10 joueurs différents | 30 joueurs | 50 joueurs | Les 65 joueurs du deck de base |
| Collection Premier League | Découvre 5 joueurs PL | 8 joueurs PL | 11 joueurs PL | Les 13 joueurs PL |
| Collection Liga | Découvre 5 joueurs Liga | 8 joueurs Liga | 11 joueurs Liga | Les 13 joueurs Liga |
| Collection Serie A | Découvre 5 joueurs Serie A | 8 joueurs Serie A | 11 joueurs Serie A | Les 13 joueurs Serie A |
| Collection Bundesliga | Découvre 5 joueurs Bundesliga | 8 joueurs Bundesliga | 11 joueurs Bundesliga | Les 13 joueurs Bundesliga |
| Collection Ligue 1 | Découvre 5 joueurs Ligue 1 | 8 joueurs Ligue 1 | 11 joueurs Ligue 1 | Les 13 joueurs Ligue 1 |
| Nationalités représentées | Joue des cartes de 5 nationalités différentes | 10 nationalités | 15 nationalités | 20 nationalités |

### Famille Progression (méta, saisons, défis) — 9 lignes × 4 paliers = 36 Trophées

| Ligne | Amateur | Semi-pro | Pro | Légende |
|---|---|---|---|---|
| Saisons complétées | Termine 1 saison | 5 saisons | 20 saisons | 100 saisons |
| Titres remportés | Remporte 1 titre de champion | 5 titres | 20 titres | 50 titres |
| Grands Rivaux battus | Bats 3 Grands Rivaux | 15 Grands Rivaux | 50 Grands Rivaux | 150 Grands Rivaux |
| Tactiques débloquées | Possède 5 Tactiques différentes utilisées | 15 Tactiques | 25 Tactiques | Les 30 Tactiques |
| Saison sans défaite | — | Termine une saison sans perdre un match | Termine 3 saisons sans perdre un match | Termine 10 saisons sans perdre un match |
| Défi quotidien | Complète 1 Défi quotidien | 10 Défis quotidiens | 50 Défis quotidiens | 200 Défis quotidiens (streak) |
| Duel | Gagne 1 Duel | 10 Duels | 50 Duels | 200 Duels |
| Mode Championnat | Termine 1 saison en Mode Championnat | 5 saisons | 20 saisons | Termine une saison dans les 5 championnats |
| Économie | Accumule 500 Ballons au total gagnés | 5 000 Ballons | 25 000 Ballons | 100 000 Ballons |

**Total : 32 + 28 + 36 = 96 Trophées.** Il manque 4 pour arriver à ~100 — bon espace pour des **Trophées secrets/spéciaux non alignés sur la grille** (ex : "Termine une saison en jouant uniquement des Solo", "Bats un Grand Rival avec exactement le score minimum requis", "Joue une main avec 5 nationalités différentes ET 5 championnats différents") — à inventer une fois le jeu jouable, pour capturer des moments de jeu imprévus plutôt que de forcer des cases.

**Rappel monétisation** : les lignes liées au Mode Championnat, Défi quotidien et Duel restent **visibles mais verrouillées** pour les non-abonnés (voir §10bis) — elles doivent apparaître grisées dans l'UI, pas masquées.
