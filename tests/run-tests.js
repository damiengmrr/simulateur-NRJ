import assert from "node:assert/strict";
import { calculate } from "../assets/js/calculator.js";

const base = {
  nombre_toits: "1 toit",
  etages: "Plain-pied",
  accessibilite: "Facile",
  age_toiture: "Moins de 30 ans",
  type_toiture: "Bac acier",
  passage_cables: "Simple",
  alimentation: "Monophasé",
  batterie: "Non",
  backup: "Non",
  distance_km: 0
};

const cases = [
  { n: 1, input: { ...base, puissance: 3 }, score: 0, brut: "F1", forfait: "F1" },
  { n: 2, input: { ...base, puissance: 6, type_toiture: "Tuile canal", etages: "1 étage", accessibilite: "Moyen", passage_cables: "Moyenne", age_toiture: "30 à 45 ans" }, score: 14, brut: "F3", forfait: "F3" },
  { n: 3, input: { ...base, puissance: 6, type_toiture: "Tuile canal", etages: "1 étage", accessibilite: "Moyen", passage_cables: "Moyenne", age_toiture: "30 à 45 ans", batterie: "Oui" }, score: 17, brut: "F3", forfait: "F3" },
  { n: 4, input: { ...base, puissance: 6, type_toiture: "Tuile canal", etages: "1 étage", accessibilite: "Moyen", passage_cables: "Moyenne", age_toiture: "30 à 45 ans", batterie: "Oui", backup: "Oui" }, score: 20, brut: "F4", forfait: "F4" },
  { n: 5, input: { ...base, puissance: 9, type_toiture: "Tuile mécanique", etages: "1 étage", alimentation: "Triphasé" }, score: 7, brut: "F2", forfait: "F2" },
  { n: 6, input: { ...base, puissance: 9.5, type_toiture: "Tuile mécanique", etages: "1 étage", alimentation: "Triphasé" }, score: 9, brut: "F2", forfait: "F3" },
  { n: 7, input: { ...base, puissance: 12 }, score: 4, brut: "F1", forfait: "F3" },
  { n: 8, input: { ...base, puissance: 8, etages: "1 étage", accessibilite: "Difficile", age_toiture: "Plus de 45 ans", type_toiture: "Tuile canal", passage_cables: "Difficile", batterie: "Oui", distance_km: 45 }, score: 23, brut: "F4", forfait: "F4" },
  { n: 9, input: { ...base, puissance: 10, nombre_toits: "3 toits", etages: "2 étages", accessibilite: "Moyen", age_toiture: "Plus de 45 ans", type_toiture: "Tuile canal", passage_cables: "Difficile", alimentation: "Triphasé", batterie: "Oui", backup: "Oui" }, score: 31, brut: "F5", forfait: "F5" },
  { n: 10, input: { ...base, puissance: 4, nombre_toits: "3 toits", etages: "2 étages", accessibilite: "Moyen", age_toiture: "Plus de 45 ans", type_toiture: "Tuile canal", passage_cables: "Difficile", alimentation: "Triphasé", batterie: "Oui", backup: "Oui" }, score: 28, brut: "F5", forfait: "F4" },
  { n: 11, input: { ...base, puissance: 6 }, score: 1, brut: "F1", forfait: "F1" },
  { n: 12, input: { ...base, puissance: 6.5 }, score: 2, brut: "F1", forfait: "F2" }
];

for (const test of cases) {
  const result = calculate(test.input);
  assert.equal(result.status, "ok", `Cas ${test.n}: statut`);
  assert.equal(result.score, test.score, `Cas ${test.n}: score`);
  assert.equal(result.brut, test.brut, `Cas ${test.n}: forfait brut`);
  assert.equal(result.forfait, test.forfait, `Cas ${test.n}: forfait appliqué`);
}

for (const [n, puissance] of [[13, 0.5], [14, 13]]) {
  const result = calculate({ ...base, puissance });
  assert.equal(result.status, "manual", `Cas ${n}: devis manuel`);
}

// Bornes explicites de distance : 30 km reste à 0 point, 60 km vaut 2 points, au-delà vaut 4 points.
assert.equal(calculate({ ...base, puissance: 3, distance_km: 30 }).score, 0, "Distance 30 km");
assert.equal(calculate({ ...base, puissance: 3, distance_km: 60 }).score, 2, "Distance 60 km");
assert.equal(calculate({ ...base, puissance: 3, distance_km: 60.1 }).score, 4, "Distance > 60 km");

// Les critères non pertinents sont neutralisés par le moteur, même sans passer par l'interface.
const ground = calculate({
  ...base,
  puissance: 3,
  type_toiture: "Pose au sol",
  etages: "3 ou plus",
  accessibilite: "Moyen",
  age_toiture: "Plus de 45 ans"
});
assert.equal(ground.score, 0, "Pose au sol neutralise étages, accès et âge");

console.log("✓ 14/14 cas de référence validés + contrôles de bornes et normalisation");
