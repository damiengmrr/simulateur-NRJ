import { CONFIG } from "./config.js";

const FORFAIT_NUMBER = { F1: 1, F2: 2, F3: 3, F4: 4, F5: 5 };
const FORFAIT_NAME = { 1: "F1", 2: "F2", 3: "F3", 4: "F4", 5: "F5" };

export function powerBand(power) {
  if (!Number.isFinite(power) || power < CONFIG.puissance.min || power > CONFIG.puissance.max) {
    return null;
  }
  return CONFIG.puissance.tranches.find((band) => power <= band.jusqua) ?? null;
}

export function distancePoints(distanceKm) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance < 0) {
    throw new RangeError("La distance doit être un nombre positif ou nul.");
  }
  const band = CONFIG.criteres.distance_km.find(
    (item) => (typeof item.jusqua === "number" && distance <= item.jusqua) || item.au_dela
  );
  return band.points;
}

export function rawForfait(score) {
  if (score >= CONFIG.seuils.F5) return "F5";
  if (score >= CONFIG.seuils.F4) return "F4";
  if (score >= CONFIG.seuils.F3) return "F3";
  if (score >= CONFIG.seuils.F2) return "F2";
  return "F1";
}

export function calculate(input) {
  const normalized = normalizeInput(input);
  const power = Number(normalized.puissance);
  if (!Number.isFinite(power)) {
    return { status: "incomplete", message: "Renseignez la puissance de l'installation." };
  }

  if (power < CONFIG.puissance.min || power > CONFIG.puissance.max) {
    return {
      status: "manual",
      puissance: power,
      message: "Devis manuel",
      reason: `La puissance doit être comprise entre ${CONFIG.puissance.min} et ${CONFIG.puissance.max} kWc pour appliquer un forfait.`
    };
  }

  const band = powerBand(power);
  const breakdown = [{ key: "puissance", label: "Puissance", value: `${formatDecimal(power)} kWc`, points: band.points }];
  let score = band.points;

  const criteriaOrder = [
    ["nombre_toits", "Nombre de toits"],
    ["etages", "Nombre d'étages"],
    ["accessibilite", "Accessibilité du toit"],
    ["age_toiture", "Âge de la toiture"],
    ["type_toiture", "Type de toiture"],
    ["passage_cables", "Passage des câbles"],
    ["alimentation", "Alimentation électrique"],
    ["batterie", "Batterie physique"],
    ["backup", "Backup"]
  ];

  for (const [key, label] of criteriaOrder) {
    const options = CONFIG.criteres[key];
    const value = normalized[key];
    if (!(value in options)) {
      throw new Error(`Valeur invalide pour ${key}: ${value}`);
    }
    const points = options[value];
    score += points;
    breakdown.push({ key, label, value, points });
  }

  const distance = Number(normalized.distance_km);
  const distPoints = distancePoints(distance);
  score += distPoints;
  breakdown.push({ key: "distance_km", label: "Distance depuis l'agence", value: `${formatDecimal(distance)} km`, points: distPoints });

  const brut = rawForfait(score);
  const brutNumber = FORFAIT_NUMBER[brut];
  const appliedNumber = Math.min(band.plafond, Math.max(band.plancher, brutNumber));
  const forfait = FORFAIT_NAME[appliedNumber];

  let adjustment = null;
  if (appliedNumber > brutNumber) adjustment = "plancher";
  if (appliedNumber < brutNumber) adjustment = "plafond";

  const explanation = adjustment
    ? `Score ${score} → ${brut}, ${adjustment === "plancher" ? "relevé" : "ramené"} à ${forfait} par le ${adjustment} de puissance (${band.libelle}).`
    : `Score ${score} → ${forfait}, dans la fourchette autorisée pour ${band.libelle}.`;

  return {
    status: "ok",
    puissance: power,
    score,
    brut,
    forfait,
    prix: CONFIG.prix[forfait],
    plancher: FORFAIT_NAME[band.plancher],
    plafond: FORFAIT_NAME[band.plafond],
    powerBand: band.libelle,
    adjustment,
    explanation,
    breakdown
  };
}


function normalizeInput(input) {
  const normalized = { ...input };
  if (["Pose au sol", "Carport", "Pergola"].includes(normalized.type_toiture)) {
    normalized.etages = "Plain-pied";
    normalized.accessibilite = "Facile";
    normalized.age_toiture = "Moins de 30 ans";
  }
  return normalized;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDecimal(value) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);
}
