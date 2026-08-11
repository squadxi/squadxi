/**
 * Les noms de type de main viennent de la table hand_types (en francais).
 * Cette table fait le lien entre ce nom "donnee" et une clef i18n stable
 * pour l'affichage traduit (voir i18n/locales).
 */
export const HAND_TYPE_I18N_KEY: Record<string, string> = {
  Solo: 'solo',
  Duo: 'duo',
  'Double Duo': 'doubleDuo',
  'Trio offensif': 'trioOffensif',
  Enchainement: 'enchainement',
  Alignement: 'alignement',
  Full: 'full',
  'Carre magique': 'carreMagique',
  'Cinq identique': 'cinqIdentique',
  'Selection parfaite': 'selectionParfaite',
  'Onze de legende': 'onzeDeLegende',
}
