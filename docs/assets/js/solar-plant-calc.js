const CONFIG_URL = "/config/solar-calculator.json";

const EMBEDDED_FALLBACK_CONFIG = Object.freeze({
  legal: {
    isObliged: true,
    startYear: 1403,
    rampPerYearPct: 5,
    capSharePct: 20
  },
  pricing: {
    greenBoard: 56000,
    greenBoardGrowthPct: 20,
    gridPrice: null
  },
  finance: {
    capexPerKW: 320000000,
    specificYield: 1600,
    prLossPct: 15,
    omPctOfRevenue: 3,
    discountPct: 25,
    horizonYears: 20
  },
  defaults: {
    year: 1403,
    annualConsumption: 1200000,
    capacityKW: 500,
    projectType: "rooftop"
  }
});

const FIELD_IDS = {
  year: "input-year",
  annualConsumption: "input-annual-consumption",
  isObliged: "input-is-obliged",
  rampPerYearPct: "input-ramp-pct",
  capSharePct: "input-cap-share-pct",
  greenBoard: "input-green-board",
  greenBoardGrowthPct: "input-green-board-growth",
  gridPrice: "input-grid-price",
  capexPerKW: "input-capex-per-kw",
  capexTotal: "input-capex-total",
  omPctOfRevenue: "input-om-pct",
  discountPct: "input-discount-pct",
  horizonYears: "input-horizon-years",
  projectType: "input-project-type",
  capacityKW: "input-capacity-kw",
  specificYield: "input-specific-yield",
  prLossPct: "input-pr-loss-pct"
};

const RESULT_IDS = {
  totalCapex: "result-total-capex",
  firstYearRevenue: "result-first-year-revenue",
  firstYearOm: "result-first-year-om",
  simplePayback: "result-payback-simple",
  discountedPayback: "result-payback-discounted",
  npv: "result-npv",
  irr: "result-irr",
  totalPenalty: "result-total-penalty",
  producedEnergy: "result-produced-energy",
  requiredEnergy: "result-required-energy"
};

const COMPARISON_IDS = {
  investmentValue: "comparison-investment-value",
  penaltyValue: "comparison-penalty-value",
  investmentProgress: "bar-investment",
  investmentProgressLabel: "bar-investment-label",
  penaltyProgress: "bar-penalty",
  penaltyProgressLabel: "bar-penalty-label",
  ratioValue: "comparison-ratio"
};

const FALLBACK_DEFAULTS = {
  year: new Date().getFullYear(),
  annualConsumption: 1200000,
  capacityKW: 500,
  projectType: "rooftop",
  horizonYears: 20
};

const numberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat("fa-IR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

const state = {
  root: null,
  config: null,
  defaults: {},
  form: null,
  fields: {},
  results: {},
  comparison: {},
  calcButton: null,
  resetButton: null,
  errorNode: null
};

export async function initSolarPlantCalculator(root = document) {
  const config = await loadConfig(CONFIG_URL);
  const effectiveConfig = config ?? cloneConfig(EMBEDDED_FALLBACK_CONFIG);

  if (!effectiveConfig) {
    console.error("solar-plant-calc: config not available");
    return;
  }

  if (!config) {
    console.warn("solar-plant-calc: remote config missing, using embedded defaults");
  }

  state.root = root;
  state.config = effectiveConfig;
  state.defaults = computeDefaults(effectiveConfig);

  cacheDomReferences(root);
  prefillForm();
  attachListeners();

  try {
    const inputs = collectInputs();
    const result = calculateMetrics(config, inputs);
    renderResults(result);
  } catch (error) {
    console.error("solar-plant-calc: initial render failed", error);
    showError("محاسبات اولیه با مشکل مواجه شد.");
  }
}

export async function loadConfig(url = CONFIG_URL) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("solar-plant-calc: loadConfig error", error);
    return null;
  }
}

export function calculateMetrics(config, inputs = {}) {
  if (!config) {
    throw new Error("calculateMetrics requires a config object");
  }

  const defaults = computeDefaults(config);

  const legal = {
    ...config.legal,
    isObliged: inputs.isObliged ?? defaults.isObliged ?? true,
    rampPerYearPct: fallbackNumber(inputs.rampPerYearPct, config.legal?.rampPerYearPct),
    capSharePct: fallbackNumber(inputs.capSharePct, config.legal?.capSharePct)
  };

  const pricing = {
    ...config.pricing,
    greenBoard: fallbackNumber(inputs.greenBoard, config.pricing?.greenBoard),
    greenBoardGrowthPct: fallbackNumber(inputs.greenBoardGrowthPct, config.pricing?.greenBoardGrowthPct),
    gridPrice: toNullableNumber(inputs.gridPrice, config.pricing?.gridPrice)
  };

  const finance = {
    ...config.finance,
    capexPerKW: fallbackNumber(inputs.capexPerKW, config.finance?.capexPerKW),
    specificYield: fallbackNumber(inputs.specificYield, config.finance?.specificYield),
    prLossPct: fallbackNumber(inputs.prLossPct, config.finance?.prLossPct),
    omPctOfRevenue: fallbackNumber(inputs.omPctOfRevenue, config.finance?.omPctOfRevenue),
    discountPct: fallbackNumber(inputs.discountPct, config.finance?.discountPct),
    horizonYears: Math.max(1, Math.round(fallbackNumber(inputs.horizonYears, config.finance?.horizonYears ?? FALLBACK_DEFAULTS.horizonYears)))
  };

  const scenario = {
    year: Math.round(fallbackNumber(inputs.year, defaults.year)),
    annualConsumption: fallbackNumber(inputs.annualConsumption, defaults.annualConsumption),
    projectType: inputs.projectType || defaults.projectType,
    capacityKW: fallbackNumber(inputs.capacityKW, defaults.capacityKW)
  };

  const impliedCapex = finance.capexPerKW * scenario.capacityKW;
  scenario.capexTotal = fallbackNumber(inputs.capexTotal, defaults.capexTotal ?? impliedCapex);

  const producedEnergy = computeProducedEnergy(scenario.capacityKW, finance.specificYield, finance.prLossPct);

  const penaltySeries = computePenaltySeries({
    year: scenario.year,
    horizonYears: finance.horizonYears,
    annualConsumption: scenario.annualConsumption,
    legal,
    pricing,
    producedEnergy
  });

  const revenueSeries = computeRevenueSeries({
    producedEnergy,
    pricing,
    horizonYears: finance.horizonYears
  });

  const omSeries = revenueSeries.map((value) => value * (finance.omPctOfRevenue / 100));

  const cashflows = buildCashflows({
    capexTotal: scenario.capexTotal,
    revenueSeries,
    omSeries
  });

  const discountedCashflows = discountCashflows(cashflows, finance.discountPct);
  const npv = sumArray(discountedCashflows);
  const simplePaybackYears = computePayback(cashflows);
  const discountedPaybackYears = computePayback(discountedCashflows);
  const irr = computeIrr(cashflows);

  const totalPenalty = penaltySeries.reduce((acc, item) => acc + item.penalty, 0);

  return {
    scenario,
    legal,
    pricing,
    finance,
    producedEnergy,
    penaltySeries,
    revenueSeries,
    omSeries,
    cashflows,
    discountedCashflows,
    metrics: {
      totalCapex: scenario.capexTotal,
      firstYearRevenue: revenueSeries[0] ?? 0,
      firstYearOM: omSeries[0] ?? 0,
      simplePaybackYears,
      discountedPaybackYears,
      npv,
      irr,
      totalPenalty,
      firstYearPenalty: penaltySeries[0]?.penalty ?? 0
    }
  };
}

export function annualRequiredShare(year, legal) {
  if (!legal) {
    return 0;
  }
  const startYear = Number(legal.startYear) || 0;
  if (year < startYear) {
    return 0;
  }
  const stepCount = year - startYear + 1;
  const ramp = Number(legal.rampPerYearPct) || 0;
  const cap = Number(legal.capSharePct) || 0;
  return Math.min(cap, Math.max(0, stepCount * ramp));
}

export function computeProducedEnergy(capacityKW, specificYield, prLossPct) {
  const capacity = Number(capacityKW) || 0;
  const yieldValue = Number(specificYield) || 0;
  const loss = Number(prLossPct) || 0;
  const gross = capacity * yieldValue;
  return gross * (1 - loss / 100);
}

export function computePenaltySeries({ year, horizonYears, annualConsumption, legal, pricing, producedEnergy }) {
  const rows = [];
  const growthFactor = 1 + ((Number(pricing.greenBoardGrowthPct) || 0) / 100);
  const basePenaltyPrice = Number(pricing.greenBoard) || 0;
  const consumption = Number(annualConsumption) || 0;
  const obliged = Boolean(legal?.isObliged);

  for (let index = 0; index < horizonYears; index += 1) {
    const calendarYear = year + index;
    const requiredSharePct = obliged ? annualRequiredShare(calendarYear, legal) : 0;
    const requiredEnergy = (requiredSharePct / 100) * consumption;
    const penaltyPrice = basePenaltyPrice * Math.pow(growthFactor, index);
    const shortfall = Math.max(requiredEnergy - producedEnergy, 0);
    const penalty = obliged ? shortfall * penaltyPrice : 0;

    rows.push({
      index,
      calendarYear,
      requiredSharePct,
      requiredEnergy,
      producedEnergy,
      shortfall,
      penalty,
      penaltyPrice
    });
  }

  return rows;
}

export function computeRevenueSeries({ producedEnergy, pricing, horizonYears }) {
  const rows = [];
  const basePrice = isFiniteNumber(pricing.gridPrice) ? Number(pricing.gridPrice) : Number(pricing.greenBoard) || 0;
  const useGridPrice = isFiniteNumber(pricing.gridPrice);
  const growthFactor = 1 + ((Number(pricing.greenBoardGrowthPct) || 0) / 100);
  const energy = Number(producedEnergy) || 0;

  for (let index = 0; index < horizonYears; index += 1) {
    const price = useGridPrice ? basePrice : basePrice * Math.pow(growthFactor, index);
    rows.push(energy * price);
  }

  return rows;
}

export function buildCashflows({ capexTotal, revenueSeries, omSeries }) {
  const flows = [];
  const investment = Number(capexTotal) || 0;
  flows.push(-investment);

  for (let index = 0; index < revenueSeries.length; index += 1) {
    const revenue = Number(revenueSeries[index]) || 0;
    const omCost = Number(omSeries[index]) || 0;
    flows.push(revenue - omCost);
  }

  return flows;
}

export function discountCashflows(flows, discountPct) {
  const rate = (Number(discountPct) || 0) / 100;
  return flows.map((value, index) => value / Math.pow(1 + rate, index));
}

export function computeNpv(flows, discountPct) {
  return sumArray(discountCashflows(flows, discountPct));
}

export function computePayback(flows) {
  let cumulative = 0;
  let previousCumulative = 0;

  for (let index = 0; index < flows.length; index += 1) {
    previousCumulative = cumulative;
    cumulative += flows[index];

    if (cumulative >= 0) {
      if (index === 0) {
        return 0;
      }
      const yearlyFlow = flows[index];
      if (!yearlyFlow) {
        return index - 1;
      }
      const fraction = (0 - previousCumulative) / yearlyFlow;
      return Math.max(0, index - 1 + fraction);
    }
  }

  return null;
}

export function computeIrr(flows, options = {}) {
  const hasPositive = flows.some((value) => value > 0);
  const hasNegative = flows.some((value) => value < 0);
  if (!hasPositive || !hasNegative) {
    return null;
  }

  const tolerance = options.tolerance ?? 1e-7;
  const maxIterations = options.maxIterations ?? 100;
  let lower = options.minRate ?? -0.99;
  let upper = options.maxRate ?? 1.0;
  let npvLower = npvWithRate(flows, lower);
  let npvUpper = npvWithRate(flows, upper);

  if (npvLower * npvUpper > 0) {
    return null;
  }

  let rate = lower;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    rate = (lower + upper) / 2;
    const npvMid = npvWithRate(flows, rate);

    if (Math.abs(npvMid) <= tolerance) {
      return rate;
    }

    if (npvMid * npvLower < 0) {
      upper = rate;
      npvUpper = npvMid;
    } else {
      lower = rate;
      npvLower = npvMid;
    }
  }

  return rate;
}

function npvWithRate(flows, rate) {
  return flows.reduce((acc, value, index) => acc + value / Math.pow(1 + rate, index), 0);
}

function computeDefaults(config) {
  const base = config?.defaults ?? {};

  const defaults = {
    year: fallbackNumber(base.year, config.legal?.startYear ?? FALLBACK_DEFAULTS.year),
    annualConsumption: fallbackNumber(base.annualConsumption, FALLBACK_DEFAULTS.annualConsumption),
    isObliged: typeof base.isObliged === "boolean" ? base.isObliged : config.legal?.isObliged ?? true,
    rampPerYearPct: fallbackNumber(base.rampPerYearPct, config.legal?.rampPerYearPct),
    capSharePct: fallbackNumber(base.capSharePct, config.legal?.capSharePct),
    greenBoard: fallbackNumber(base.greenBoard, config.pricing?.greenBoard),
    greenBoardGrowthPct: fallbackNumber(base.greenBoardGrowthPct, config.pricing?.greenBoardGrowthPct),
    gridPrice: toNullableNumber(base.gridPrice, config.pricing?.gridPrice),
    capexPerKW: fallbackNumber(base.capexPerKW, config.finance?.capexPerKW),
    capexTotal: toNullableNumber(base.capexTotal),
    omPctOfRevenue: fallbackNumber(base.omPctOfRevenue, config.finance?.omPctOfRevenue),
    discountPct: fallbackNumber(base.discountPct, config.finance?.discountPct),
    horizonYears: fallbackNumber(base.horizonYears, config.finance?.horizonYears ?? FALLBACK_DEFAULTS.horizonYears),
    projectType: base.projectType || FALLBACK_DEFAULTS.projectType,
    capacityKW: fallbackNumber(base.capacityKW, FALLBACK_DEFAULTS.capacityKW),
    specificYield: fallbackNumber(base.specificYield, config.finance?.specificYield),
    prLossPct: fallbackNumber(base.prLossPct, config.finance?.prLossPct)
  };

  return defaults;
}

function cacheDomReferences(root) {
  state.form = root.querySelector("[data-solar-form]");
  state.calcButton = root.querySelector('[data-action="calculate"]');
  state.resetButton = root.querySelector('[data-action="reset"]');
  state.errorNode = root.querySelector('[data-solar-error]');

  for (const [key, id] of Object.entries(FIELD_IDS)) {
    state.fields[key] = root.getElementById(id) || null;
  }

  for (const [key, id] of Object.entries(RESULT_IDS)) {
    state.results[key] = root.getElementById(id) || null;
  }

  state.comparison = {
    investmentValue: root.getElementById(COMPARISON_IDS.investmentValue) || null,
    penaltyValue: root.getElementById(COMPARISON_IDS.penaltyValue) || null,
    investmentProgress: root.getElementById(COMPARISON_IDS.investmentProgress) || null,
    investmentProgressLabel: root.getElementById(COMPARISON_IDS.investmentProgressLabel) || null,
    penaltyProgress: root.getElementById(COMPARISON_IDS.penaltyProgress) || null,
    penaltyProgressLabel: root.getElementById(COMPARISON_IDS.penaltyProgressLabel) || null,
    ratioValue: root.getElementById(COMPARISON_IDS.ratioValue) || null
  };
}

function prefillForm() {
  const defaults = state.defaults;

  Object.entries(FIELD_IDS).forEach(([key, id]) => {
    const field = state.fields[key];
    if (!field) {
      return;
    }

    if (key === "isObliged") {
      field.checked = Boolean(defaults.isObliged);
      return;
    }

    const value = defaults[key];
    if (value === null || value === undefined || Number.isNaN(value)) {
      field.value = "";
      return;
    }

    if (typeof value === "number") {
      field.value = value;
    } else {
      field.value = value;
    }
  });
}

function attachListeners() {
  if (state.calcButton && state.form) {
    state.calcButton.addEventListener("click", () => {
      state.form?.requestSubmit();
    });
  }

  if (state.form) {
    state.form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleCalculate();
    });
  }

  if (state.resetButton) {
    state.resetButton.addEventListener("click", () => {
      handleReset();
    });
  }
}

function handleCalculate() {
  clearError();
  try {
    const inputs = collectInputs();
    const result = calculateMetrics(state.config, inputs);
    renderResults(result);
  } catch (error) {
    console.error("solar-plant-calc: calculation failed", error);
    showError("بررسی ورودی‌ها یا فرمول‌ها لازم است.");
  }
}

function handleReset() {
  state.form?.reset();
  prefillForm();
  clearError();
  try {
    const inputs = collectInputs();
    const result = calculateMetrics(state.config, inputs);
    renderResults(result);
  } catch (error) {
    console.error("solar-plant-calc: reset calculation failed", error);
  }
}

function collectInputs() {
  const values = {};

  values.year = parseNumber(state.fields.year?.value);
  values.annualConsumption = parseNumber(state.fields.annualConsumption?.value);
  values.isObliged = Boolean(state.fields.isObliged?.checked);
  values.rampPerYearPct = parseNumber(state.fields.rampPerYearPct?.value);
  values.capSharePct = parseNumber(state.fields.capSharePct?.value);
  values.greenBoard = parseNumber(state.fields.greenBoard?.value);
  values.greenBoardGrowthPct = parseNumber(state.fields.greenBoardGrowthPct?.value);
  values.gridPrice = parseNumber(state.fields.gridPrice?.value);
  values.capexPerKW = parseNumber(state.fields.capexPerKW?.value);
  values.capexTotal = parseNumber(state.fields.capexTotal?.value);
  values.omPctOfRevenue = parseNumber(state.fields.omPctOfRevenue?.value);
  values.discountPct = parseNumber(state.fields.discountPct?.value);
  values.horizonYears = parseNumber(state.fields.horizonYears?.value);
  values.projectType = state.fields.projectType?.value || "";
  values.capacityKW = parseNumber(state.fields.capacityKW?.value);
  values.specificYield = parseNumber(state.fields.specificYield?.value);
  values.prLossPct = parseNumber(state.fields.prLossPct?.value);

  return values;
}

function renderResults(result) {
  if (!result) {
    return;
  }

  const metrics = result.metrics;

  setResultText("totalCapex", formatCurrency(metrics.totalCapex));
  setResultText("firstYearRevenue", formatCurrency(metrics.firstYearRevenue));
  setResultText("firstYearOm", formatCurrency(metrics.firstYearOM));
  setResultText("simplePayback", formatYears(metrics.simplePaybackYears));
  setResultText("discountedPayback", formatYears(metrics.discountedPaybackYears));
  setResultText("npv", formatCurrency(metrics.npv));
  setResultText("irr", formatPercent(metrics.irr));
  setResultText("totalPenalty", formatCurrency(metrics.totalPenalty));
  setResultText("producedEnergy", formatEnergy(result.producedEnergy));
  setResultText("requiredEnergy", formatEnergy(result.penaltySeries[0]?.requiredEnergy ?? 0));

  renderComparison(metrics);
}

function renderComparison(metrics) {
  const investment = Number(metrics.totalCapex) || 0;
  const penalty = Number(metrics.totalPenalty) || 0;

  setComparisonText("investmentValue", formatCurrency(investment));
  setComparisonText("penaltyValue", formatCurrency(penalty));

  const investmentPercent = investment > 0 ? 100 : 0;
  const penaltyPercent = investment > 0
    ? (penalty > 0 ? (penalty / investment) * 100 : 0)
    : penalty > 0 ? 100 : 0;

  setComparisonProgress("investmentProgress", investmentPercent, "investmentProgressLabel");
  setComparisonProgress("penaltyProgress", penaltyPercent, "penaltyProgressLabel");

  const ratioText = investment > 0 ? formatPercent(penalty / investment) : "—";
  setComparisonText("ratioValue", ratioText);
}

function setResultText(key, value) {
  const node = state.results[key];
  if (!node) {
    return;
  }
  if (node.textContent !== value) {
    node.textContent = value;
    node.setAttribute("data-flash", "");
    window.setTimeout(() => {
      node.removeAttribute("data-flash");
    }, 600);
  }
}

function setComparisonText(key, value) {
  const node = state.comparison[key];
  if (!node) {
    return;
  }
  node.textContent = value;
}

function setComparisonProgress(progressKey, percent, labelKey) {
  const progress = state.comparison[progressKey];
  const label = labelKey ? state.comparison[labelKey] : null;
  const clamped = clampPercent(percent);

  if (progress) {
    if (progress.max !== 100) {
      progress.max = 100;
    }
    progress.value = clamped;
  }

  if (label) {
    label.textContent = formatPercentLabel(clamped);
  }
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function formatPercentLabel(percentValue) {
  return `${percentFormatter.format(percentValue)}٪`;
}

function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }
  return `${numberFormatter.format(Math.round(Number(value)))} ریال`;
}

function formatEnergy(value) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }
  return `${numberFormatter.format(Math.round(Number(value)))} کیلووات‌ساعت`;
}

function formatYears(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return `${decimalFormatter.format(value)} سال`;
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return "—";
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "—";
  }
  const display = numericValue * 100;
  return `${percentFormatter.format(display)}٪`;
}

function fallbackNumber(value, fallback) {
  const numeric = parseNumber(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  if (Number.isFinite(Number(fallback))) {
    return Number(fallback);
  }
  return 0;
}

function toNullableNumber(value, fallback) {
  const numeric = parseNumber(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  if (Number.isFinite(Number(fallback))) {
    return Number(fallback);
  }
  return null;
}

function parseNumber(input) {
  if (input === null || input === undefined) {
    return null;
  }
  const normalized = normalizeDigits(String(input).trim()).replace(/,/g, "");
  if (!normalized) {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function normalizeDigits(value) {
  const persian = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9"
  };
  return value.replace(/[۰-۹٠-٩]/g, (char) => persian[char] ?? char);
}

function sumArray(values) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

function clearError() {
  if (state.errorNode) {
    state.errorNode.textContent = "";
    state.errorNode.classList.remove("visible");
  }
}

function showError(message) {
  if (state.errorNode) {
    state.errorNode.textContent = message;
    state.errorNode.classList.add("visible");
  }
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function cloneConfig(config) {
  if (!config) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(config));
  } catch (error) {
    console.warn("solar-plant-calc: failed to clone fallback config", error);
    return null;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initSolarPlantCalculator();
  });
}
