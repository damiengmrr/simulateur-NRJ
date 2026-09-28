import { CONFIG } from "./config.js";
import { calculate, formatPrice } from "./calculator.js";

const UI = {
  nombre_toits: {
    label: "Nombre de toits à installer",
    options: ["1 toit", "2 toits", "3 toits", "4 ou plus"]
  },
  etages: {
    label: "Nombre d'étages",
    options: ["Plain-pied", "1 étage", "2 étages", "3 ou plus"]
  },
  type_toiture: {
    label: "Type de toiture",
    options: [
      { value: "Bac acier", label: "Bac acier" },
      { value: "Toiture terrasse", label: "Toiture terrasse", sublabel: "avec ou sans gravier" },
      { value: "Pose au sol", label: "Pose au sol" },
      { value: "Tuile mécanique", label: "Tuile mécanique" },
      { value: "Fibrociment", label: "Fibrociment" },
      { value: "Tuile canal", label: "Tuile canal" },
      { value: "Carport", label: "Carport" },
      { value: "Pergola", label: "Pergola" }
    ],
    wide: true
  },
  accessibilite: {
    label: "Accessibilité du toit",
    options: ["Facile", "Moyen", "Difficile"]
  },
  age_toiture: {
    label: "Âge de la toiture",
    options: ["Moins de 30 ans", "30 à 45 ans", "Plus de 45 ans"]
  },
  passage_cables: {
    label: "Passage des câbles",
    options: ["Simple", "Moyenne", "Difficile"]
  },
  alimentation: {
    label: "Alimentation électrique",
    options: ["Monophasé", "Triphasé"]
  },
  batterie: {
    label: "Batterie physique",
    options: ["Non", "Oui"]
  },
  backup: {
    label: "Backup",
    options: ["Non", "Oui"]
  }
};

const DEFAULTS = {
  nombre_toits: "1 toit",
  etages: "Plain-pied",
  accessibilite: "Facile",
  age_toiture: "Moins de 30 ans",
  type_toiture: "Bac acier",
  passage_cables: "Simple",
  alimentation: "Monophasé",
  batterie: "Non",
  backup: "Non"
};

const NOT_APPLICABLE_ROOFS = new Set(["Pose au sol", "Carport", "Pergola"]);
const NOT_APPLICABLE_KEYS = ["etages", "accessibilite", "age_toiture"];

const powerInput = document.querySelector("#puissance");
const distanceInput = document.querySelector("#distance_km");
const powerError = document.querySelector("#powerError");
const distanceError = document.querySelector("#distanceError");
const resultKicker = document.querySelector("#resultKicker");
const resultTitle = document.querySelector("#resultTitle");
const resultPrice = document.querySelector("#resultPrice");
const resultScore = document.querySelector("#resultScore");
const openDetails = document.querySelector("#openDetails");
const detailsDialog = document.querySelector("#detailsDialog");
const breakdown = document.querySelector("#breakdown");
const detailSummary = document.querySelector("#detailSummary");
const detailExplanation = document.querySelector("#detailExplanation");
const fibroWarning = document.querySelector("#fibroWarning");
const backupWarning = document.querySelector("#backupWarning");
const notApplicableNotice = document.querySelector("#notApplicableNotice");

for (const [key, definition] of Object.entries(UI)) {
  renderChoiceGroup(key, definition);
}

for (const input of document.querySelectorAll("input")) {
  input.addEventListener("change", handleAnyChange);
  input.addEventListener("input", handleAnyChange);
}

for (const button of document.querySelectorAll("[data-power]")) {
  button.addEventListener("click", () => {
    powerInput.value = button.dataset.power;
    powerInput.dispatchEvent(new Event("input", { bubbles: true }));
    powerInput.focus();
  });
}

document.querySelector("#resetTop").addEventListener("click", requestReset);
document.querySelector("#resetBottom").addEventListener("click", requestReset);
document.querySelector("#closeDetails").addEventListener("click", () => detailsDialog.close());
openDetails.addEventListener("click", () => {
  if (!openDetails.disabled) detailsDialog.showModal();
});
detailsDialog.addEventListener("click", (event) => {
  if (event.target === detailsDialog) detailsDialog.close();
});

updateSpecialRules();
updateResult();

function renderChoiceGroup(key, definition) {
  const mount = document.querySelector(`#group-${key}`);
  const criterion = document.createElement("fieldset");
  criterion.className = "criterion choice-criterion";
  criterion.dataset.criterion = key;

  const legend = document.createElement("legend");
  legend.className = "criterion-title";
  legend.textContent = definition.label;
  criterion.appendChild(legend);

  const choices = document.createElement("div");
  choices.className = `choices ${definition.wide ? "choices-wide" : ""}`;

  for (const rawOption of definition.options) {
    const option = typeof rawOption === "string" ? { value: rawOption, label: rawOption } : rawOption;
    const label = document.createElement("label");
    label.className = "choice";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = key;
    radio.value = option.value;
    radio.checked = option.value === DEFAULTS[key];

    const content = document.createElement("span");
    content.className = "choice-content";

    const main = document.createElement("span");
    main.className = "choice-label";
    main.textContent = option.label;
    content.appendChild(main);

    if (option.sublabel) {
      const sub = document.createElement("span");
      sub.className = "choice-sublabel";
      sub.textContent = option.sublabel;
      content.appendChild(sub);
    }

    label.append(radio, content);
    choices.appendChild(label);
  }

  criterion.appendChild(choices);
  mount.replaceChildren(criterion);
}

function handleAnyChange() {
  updateSpecialRules();
  updateResult();
}

function updateSpecialRules() {
  const roof = selected("type_toiture");
  const notApplicable = NOT_APPLICABLE_ROOFS.has(roof);

  for (const key of NOT_APPLICABLE_KEYS) {
    const fieldset = document.querySelector(`[data-criterion="${key}"]`);
    const inputs = fieldset.querySelectorAll("input");
    if (notApplicable) {
      const defaultInput = fieldset.querySelector(`input[value="${cssEscape(DEFAULTS[key])}"]`);
      if (defaultInput) defaultInput.checked = true;
    }
    fieldset.disabled = notApplicable;
    fieldset.classList.toggle("criterion-disabled", notApplicable);
  }

  notApplicableNotice.hidden = !notApplicable;
  fibroWarning.hidden = roof !== "Fibrociment";
  backupWarning.hidden = !(selected("backup") === "Oui" && selected("batterie") === "Non");
}

function updateResult() {
  clearValidation();

  const power = parseFrenchNumber(powerInput.value);
  const distance = parseFrenchNumber(distanceInput.value);

  if (powerInput.value.trim() !== "" && (!Number.isFinite(power) || power < 0)) {
    setValidation(powerInput, powerError, "Saisissez une puissance valide.");
    showIncomplete("Puissance invalide");
    return;
  }

  if (!Number.isFinite(distance) || distance < 0) {
    setValidation(distanceInput, distanceError, "La distance doit être positive ou nulle.");
    showIncomplete("Distance invalide");
    return;
  }

  const state = {
    puissance: powerInput.value.trim() === "" ? Number.NaN : power,
    nombre_toits: selected("nombre_toits"),
    etages: selected("etages"),
    accessibilite: selected("accessibilite"),
    age_toiture: selected("age_toiture"),
    type_toiture: selected("type_toiture"),
    passage_cables: selected("passage_cables"),
    alimentation: selected("alimentation"),
    batterie: selected("batterie"),
    backup: selected("backup"),
    distance_km: distance
  };

  let result;
  try {
    result = calculate(state);
  } catch (error) {
    showIncomplete("Vérifiez les informations saisies");
    return;
  }

  if (result.status === "incomplete") {
    showIncomplete(result.message);
    return;
  }

  if (result.status === "manual") {
    resultKicker.textContent = "Résultat";
    resultTitle.textContent = "Devis manuel";
    resultPrice.hidden = true;
    resultScore.textContent = "Hors plage 1–12 kWc";
    openDetails.disabled = false;
    renderManualDetails(result);
    return;
  }

  resultKicker.textContent = "Forfait appliqué";
  resultTitle.textContent = result.forfait;
  resultPrice.textContent = formatPrice(result.prix);
  resultPrice.hidden = false;
  resultScore.textContent = `Score ${result.score} / 37`;
  openDetails.disabled = false;
  renderDetails(result);
}

function showIncomplete(message) {
  resultKicker.textContent = "Résultat";
  resultTitle.textContent = message;
  resultPrice.hidden = true;
  resultScore.textContent = "Score —";
  openDetails.disabled = true;
  breakdown.replaceChildren();
  detailSummary.replaceChildren();
  detailExplanation.textContent = "";
}

function renderDetails(result) {
  detailSummary.innerHTML = `
    <div class="summary-forfait"><span>Forfait appliqué</span><strong>${escapeHtml(result.forfait)}</strong></div>
    <div class="summary-price"><span>Prix</span><strong>${escapeHtml(formatPrice(result.prix))}</strong></div>
    <div class="summary-score"><span>Score</span><strong>${result.score} / 37</strong></div>
  `;

  breakdown.replaceChildren();
  for (const item of result.breakdown) {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `
      <div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span></div>
      <span class="points">+${item.points}</span>
    `;
    breakdown.appendChild(row);
  }

  const range = document.createElement("div");
  range.className = "breakdown-row range-row";
  range.innerHTML = `
    <div><strong>Fourchette puissance</strong><span>${escapeHtml(result.powerBand)}</span></div>
    <span class="range">${escapeHtml(result.plancher)} → ${escapeHtml(result.plafond)}</span>
  `;
  breakdown.appendChild(range);

  detailExplanation.className = `detail-explanation ${result.adjustment ? "adjusted" : ""}`;
  detailExplanation.textContent = result.explanation;
}

function renderManualDetails(result) {
  detailSummary.innerHTML = `
    <div class="summary-manual"><span>Résultat</span><strong>Devis manuel</strong></div>
  `;
  breakdown.replaceChildren();
  detailExplanation.className = "detail-explanation adjusted";
  detailExplanation.textContent = result.reason;
}

function requestReset() {
  if (isDirty() && !window.confirm("Réinitialiser toutes les informations de ce chantier ?")) return;
  resetForm();
}

function resetForm() {
  powerInput.value = "";
  distanceInput.value = "0";
  for (const [key, value] of Object.entries(DEFAULTS)) {
    const input = document.querySelector(`input[name="${key}"][value="${cssEscape(value)}"]`);
    if (input) input.checked = true;
  }
  updateSpecialRules();
  updateResult();
  window.scrollTo({ top: 0, behavior: "smooth" });
  powerInput.focus({ preventScroll: true });
}

function isDirty() {
  if (powerInput.value.trim() !== "") return true;
  if (parseFrenchNumber(distanceInput.value) !== 0) return true;
  return Object.entries(DEFAULTS).some(([key, value]) => selected(key) !== value);
}

function selected(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value ?? DEFAULTS[name];
}

function parseFrenchNumber(value) {
  if (typeof value !== "string") return Number(value);
  return Number(value.replace(",", "."));
}

function setValidation(input, messageNode, message) {
  input.setAttribute("aria-invalid", "true");
  messageNode.textContent = message;
  messageNode.hidden = false;
}

function clearValidation() {
  for (const [input, messageNode] of [[powerInput, powerError], [distanceInput, distanceError]]) {
    input.removeAttribute("aria-invalid");
    messageNode.hidden = true;
    messageNode.textContent = "";
  }
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return value.replace(/(["\\])/g, "\\$1");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
