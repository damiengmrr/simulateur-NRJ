export const CONFIG = Object.freeze({
  version: "28/09/2026",
  prix: { F1: 3000, F2: 4500, F3: 6000, F4: 7500, F5: 9000 },
  seuils: { F2: 6, F3: 12, F4: 20, F5: 28 },
  puissance: {
    min: 1,
    max: 12,
    tranches: [
      { jusqua: 3, points: 0, plancher: 1, plafond: 4, libelle: "1 à 3 kWc" },
      { jusqua: 6, points: 1, plancher: 1, plafond: 4, libelle: "> 3 à 6 kWc" },
      { jusqua: 9, points: 2, plancher: 2, plafond: 5, libelle: "> 6 à 9 kWc" },
      { jusqua: 12, points: 4, plancher: 3, plafond: 5, libelle: "> 9 à 12 kWc" }
    ]
  },
  criteres: {
    nombre_toits: { "1 toit": 0, "2 toits": 1, "3 toits": 3, "4 ou plus": 5 },
    etages: { "Plain-pied": 0, "1 étage": 2, "2 étages": 2, "3 ou plus": 2 },
    accessibilite: { Facile: 0, Moyen: 2, Difficile: 1 },
    age_toiture: { "Moins de 30 ans": 0, "30 à 45 ans": 2, "Plus de 45 ans": 5 },
    type_toiture: {
      "Bac acier": 0,
      "Toiture terrasse": 0,
      "Pose au sol": 0,
      "Tuile mécanique": 2,
      Fibrociment: 2,
      "Tuile canal": 5,
      Carport: 5,
      Pergola: 5
    },
    passage_cables: { Simple: 0, Moyenne: 2, Difficile: 3 },
    alimentation: { Monophasé: 0, Triphasé: 1 },
    batterie: { Non: 0, Oui: 3 },
    backup: { Non: 0, Oui: 3 },
    distance_km: [
      { jusqua: 30, points: 0 },
      { jusqua: 60, points: 2 },
      { au_dela: true, points: 4 }
    ]
  }
});
