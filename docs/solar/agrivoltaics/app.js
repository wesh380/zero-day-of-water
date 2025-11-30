import { apiFetch, getBaseUrl } from "/assets/js/api.js";
import { fixTitles, needsFix, latin1ToUtf8 } from "/assets/js/encoding.js";
void getBaseUrl();

const POLL_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 30;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runJob(payload) {
  const submitResponse = await apiFetch("/api/submit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    throw new Error(`Submit failed (${submitResponse.status}): ${errorText}`);
  }

  const submitBody = await submitResponse.json();
  const jobId = submitBody?.job_id;
  if (!jobId) {
    throw new Error("Submit response missing job_id");
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const resultResponse = await apiFetch(`/api/result/${encodeURIComponent(jobId)}`);
    if (!resultResponse.ok) {
      const errorText = await resultResponse.text();
      throw new Error(`Result fetch failed (${resultResponse.status}): ${errorText}`);
    }

    const resultBody = await resultResponse.json();
    const status = typeof resultBody?.status === "string" ? resultBody.status.toLowerCase() : null;

    if (!status || status === "done") {
      return resultBody;
    }

    if (status === "failed") {
      throw new Error("Job failed");
    }

    if (attempt === MAX_ATTEMPTS - 1) {
      break;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Job polling timed out");
}

const {
  useState,
  useMemo,
  useEffect
} = React;

// Ù†Ø³Ø®Ù‡ Ù…Ø®ØµÙˆØµ Ø§Ø³ØªØ§Ù† Ø®Ø±Ø§Ø³Ø§Ù† Ø±Ø¶ÙˆÛŒ (Ø³Ø§Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ Ú©Ø´Ø§ÙˆØ±Ø²Ø§Ù†)
// Ù†Ú©ØªÙ‡: Ø§Ø¹Ø¯Ø§Ø¯ Ù¾ÛŒØ´â€ŒÙØ±Ø¶ ØªÙ‚Ø±ÛŒØ¨ÛŒ Ù‡Ø³ØªÙ†Ø¯. Ù„Ø·ÙØ§Ù‹ Ø¨Ø§ Ø´Ø±Ø§ÛŒØ· ÙˆØ§Ù‚Ø¹ÛŒ Ø²Ù…ÛŒÙ† Ø®ÙˆØ¯ØªØ§Ù† ØªÙ†Ø¸ÛŒÙ… Ú©Ù†ÛŒØ¯.

// Ø§Ø¬Ø²Ø§ÛŒ Ú©Ù…Ú©ÛŒ Ø³Ø§Ø¯Ù‡
const Section = ({
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  className: "bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm"
}, /*#__PURE__*/React.createElement("h2", {
  className: "text-sky-900 text-base md:text-lg font-bold mb-4"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
}, children));
const normalizeNumberValue = value => value === null || value === undefined ? "" : value;
const NumberInput = ({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  required,
  inputId,
  error
}) => {
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hasError = Boolean(error);
  return /*#__PURE__*/React.createElement("label", {
    className: "flex flex-col gap-1 text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-700"
  }, label), /*#__PURE__*/React.createElement("input", {
    id: inputId,
    dir: "ltr",
    type: "number",
    step: step,
    min: min,
    max: max,
    required: required,
    value: normalizeNumberValue(value),
    onChange: e => {
      const raw = e.target.value;
      onChange(raw === "" ? null : Number(raw));
    },
    "aria-invalid": hasError ? "true" : undefined,
    "aria-describedby": errorId,
    className: `w-full rounded-xl border px-3 py-2 text-right text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 shadow-inner ${hasError ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-200'}`
  }), /*#__PURE__*/React.createElement("div", {
    id: errorId,
    className: "text-rose-500 text-xs min-h-[1rem]"
  }, error || ""));
};
const Select = ({
  label,
  value,
  onChange,
  options
}) => /*#__PURE__*/React.createElement("label", {
  className: "flex flex-col gap-1 text-sm"
}, /*#__PURE__*/React.createElement("span", {
  className: "text-slate-700"
}, label), /*#__PURE__*/React.createElement("select", {
  value: value,
  onChange: e => onChange(e.target.value),
  className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
}, options.map(o => /*#__PURE__*/React.createElement("option", {
  key: o.value,
  value: o.value,
  className: "bg-white text-slate-900"
}, o.label))));
const KPI = ({
  title,
  value,
  sub
}) => /*#__PURE__*/React.createElement("div", {
  className: "rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-100 p-4 shadow-sm"
}, /*#__PURE__*/React.createElement("div", {
  className: "text-slate-600 text-sm"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "text-xl md:text-2xl font-extrabold mt-1 text-sky-900 text-center leading-tight break-words"
}, /*#__PURE__*/React.createElement("span", {
  className: "inline-block max-w-full"
}, value)), sub && /*#__PURE__*/React.createElement("div", {
  className: "text-xs text-slate-500 mt-1 text-center leading-snug"
}, sub));
const KV = ({
  k,
  v
}) => /*#__PURE__*/React.createElement("div", {
  className: "rounded-xl bg-slate-50 border border-slate-200 p-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "text-slate-500 text-xs"
}, k), /*#__PURE__*/React.createElement("div", {
  className: "text-sm md:text-base font-semibold text-slate-900 mt-0.5"
}, v));

function validateState(state, simpleMode) {
  const scheme = state?.grid_scheme;
  const rules = [
    { key: "salinity_EC", min: 0, max: 30, required: true },
    { key: "project_area_ha", min: 0, max: 1000, required: true, positive: true },
    { key: "baseline_yield_t_per_ha", min: 0, max: 30, required: true, positive: true },
    { key: "expected_yield_change_pct_under_AGV", min: -100, max: 200, required: true },
    { key: "crop_price_per_t", min: 0, max: 10000000000, required: true, positive: true },
    { key: "ag_opex_baseline_per_ha", min: 0, max: 10000000000, required: true, positive: true },
    { key: "ag_opex_change_under_AGV_pct", min: -100, max: 200, required: true },
    { key: "water_use_baseline_m3_per_ha", min: 0, max: 50000, required: true, positive: true },
    { key: "water_use_change_under_AGV_pct", min: -100, max: 200, required: true },
    { key: "crop_quality_premium_or_discount_pct", min: -100, max: 100, required: false },
    { key: "energy_for_irrigation_kWh_per_m3", min: 0, max: 20, required: true, positive: true },
    { key: "irrigation_energy_tariff", min: 0, max: 500000, required: true },
    { key: "water_unit_cost", min: 0, max: 500000, required: true },
    { key: "ppa_or_fit_tariff", min: 0, max: 500000, required: true },
    { key: "self_consumption_share_pct", min: 0, max: 100, required: true },
    { key: "net_metering_buy_price", min: 0, max: 500000, required: !simpleMode && (scheme === "NetMetering" || scheme === "SelfConsumption") },
    { key: "net_metering_sell_price", min: 0, max: 500000, required: !simpleMode && scheme === "NetMetering" },
    { key: "pv_capacity_kWp_total", min: 0, max: 1000000, required: true, positive: true },
    { key: "specific_yield_kWh_per_kWp_year", min: 0, max: 4000, required: true, positive: true },
    { key: "module_price_per_kWp", min: 0, max: 10000000000, required: true, positive: true },
    { key: "mounting_structure_cost_per_kWp", min: 0, max: 5000000000, required: true, positive: true },
    { key: "inverter_BOS_cost_per_kWp", min: 0, max: 5000000000, required: true, positive: true },
    { key: "grid_interconnection_lump_sum", min: 0, max: 100000000000, required: true, positive: true },
    { key: "EPC_soft_cost_pct_of_capex", min: 0, max: 50, required: !simpleMode },
    { key: "annual_pv_degradation_pct", min: 0, max: 10, required: !simpleMode },
    { key: "soiling_loss_pct", min: 0, max: 30, required: !simpleMode },
    { key: "availability_pct", min: 0, max: 100, required: !simpleMode },
    { key: "pv_om_cost_per_kWp_year", min: 0, required: true }
  ];

  const errors = {};

  for (const rule of rules) {
    const value = state?.[rule.key];
    const empty = value === null || value === undefined || Number.isNaN(value);
    if (rule.required && (empty || !Number.isFinite(value))) {
      errors[rule.key] = "این فیلد الزامی است";
      continue;
    }
    if (!rule.required && empty) {
      continue;
    }
    if (rule.positive && Number(value) <= 0) {
      errors[rule.key] = "مقدار باید بزرگ‌تر از صفر باشد";
      continue;
    }
    if ((rule.min !== undefined && Number(value) < rule.min) || (rule.max !== undefined && Number(value) > rule.max)) {
      const min = rule.min ?? "";
      const max = rule.max ?? "";
      errors[rule.key] = `باید بین ${min} و ${max} باشد`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

async function saveScenario(state, setShareLink) {
  try {
    const res = await apiFetch("/api/save-scenario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        state
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "ذخیره نشد؛ بعداً دوباره امتحان کن.");
      return;
    }
    const {
      id
    } = await res.json();
    const share = `${location.origin}${location.pathname}?id=${encodeURIComponent(id)}`;
    setShareLink(share);
  } catch (err) {
    console.error("agrivoltaics: save scenario failed", err);
    alert("ذخیره سناریو ممکن نیست؛ بعداً دوباره امتحان کن.");
  }
}
async function loadScenarioById(id, setState) {
  if (!id) return;
  try {
    const res = await apiFetch(`/api/get-scenario?id=${encodeURIComponent(id)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "خواندن نشد؛ بعداً دوباره امتحان کن.");
      return;
    }
    const saved = await res.json();
    if (saved) setState(prev => ({
      ...prev,
      ...saved
    }));
  } catch (err) {
    console.error("agrivoltaics: load scenario failed", err);
    alert("دریافت سناریو ممکن نشد؛ بعداً دوباره امتحان کن.");
  }
}
function AgrivoltaicsKhorasan() {
  const [simple, setSimple] = useState(true);
  const [shareLink, setShareLink] = React.useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  // Ù…Ù†Ø·Ù‚Ù‡â€ŒÙ‡Ø§ÛŒ Ù¾Ø±ØªÚ©Ø±Ø§Ø± Ø§Ø³ØªØ§Ù† (ØªÙ‚Ø±ÛŒØ¨ÛŒ)
  const regions = {
    mashhad: {
      title: "دشت مشهد / چناران",
      sun: 1675,
      heat: "med"
    },
    neyshabur: {
      title: "نیشابور / فیروزه",
      sun: 1680,
      heat: "med"
    },
    torbat: {
      title: "تربت‌حیدریه / زاوه / مه‌ولات / گناباد",
      sun: 1800,
      heat: "high"
    },
    sabzevar: {
      title: "سبزوار / بردسکن / کاشمر",
      sun: 1750,
      heat: "high"
    },
    quchan: {
      title: "قوچان / درگز / کلات",
      sun: 1625,
      heat: "low"
    },
    torbat_jam: {
      title: "تربت‌جم / تایباد / فریمان / خواف",
      sun: 1780,
      heat: "high"
    }
  };
  fixTitles(regions);

  // Ù…Ø­ØµÙˆÙ„Ø§Øª Ø±Ø§ÛŒØ¬
  const cropProfiles = {
    "زعفران": {
      baseYieldChange: 6,
      waterSaving: -28,
      price_per_t: 2000000000,
      yield_t_ha: 4
    },
    "گندم": {
      baseYieldChange: -2,
      waterSaving: -10,
      price_per_t: 500000000,
      yield_t_ha: 5.5
    },
    "جو": {
      baseYieldChange: -3,
      waterSaving: -10,
      price_per_t: 420000000,
      yield_t_ha: 4.5
    },
    "پسته": {
      baseYieldChange: -3,
      waterSaving: -20,
      price_per_t: 1800000000,
      yield_t_ha: 1.0
    },
    "انگور": {
      baseYieldChange: 1,
      waterSaving: -15,
      price_per_t: 250000000,
      yield_t_ha: 20
    },
    "سبزیجات برگی": {
      baseYieldChange: 8,
      waterSaving: -30,
      price_per_t: 250000000,
      yield_t_ha: 20
    },
    "طالبی/خربزه": {
      baseYieldChange: 2,
      waterSaving: -20,
      price_per_t: 180000000,
      yield_t_ha: 15
    }
  };
  fixTitles(cropProfiles);

  // Ø¢Ø¨ Ùˆ Ø®Ø§Ú©
  const waterSources = {
    well_electric_subsidized: {
      title: "چاه – برق یارانه‌ای",
      elec_tariff: 1000,
      water_cost: 0
    },
    well_electric_normal: {
      title: "چاه – برق معمولی",
      elec_tariff: 3000,
      water_cost: 0
    },
    well_diesel: {
      title: "چاه – دیزلی",
      elec_tariff: 6000,
      water_cost: 0
    },
    qanat: {
      title: "قنات / آب ثقلی",
      elec_tariff: 0,
      water_cost: 5000
    },
    canal: {
      title: "کانال/شبکه آبیاری",
      elec_tariff: 0,
      water_cost: 20000
    }
  };
  fixTitles(waterSources);
  const dustLevels = {
    low: {
      title: "گرد و غبار کم",
      soiling: 3
    },
    med: {
      title: "گرد و غبار متوسط",
      soiling: 5
    },
    high: {
      title: "گرد و غبار زیاد",
      soiling: 8
    }
  };
  fixTitles(dustLevels);
  const soils = {
    sandy: {
      title: "شنی",
      pump_kWh_m3: 0.45
    },
    loam: {
      title: "لوم (میان‌دانه)",
      pump_kWh_m3: 0.5
    },
    clay: {
      title: "رسی",
      pump_kWh_m3: 0.55
    }
  };
  fixTitles(soils);

  // ÙˆØ¶Ø¹ÛŒØª ÙˆØ±ÙˆØ¯ÛŒâ€ŒÙ‡Ø§
  const [s, setS] = useState({
    region: "torbat",
    crop_type: "زعفران",
    water_source: "well_electric_subsidized",
    dust_level: "med",
    soil_type: "loam",
    salinity_EC: 3,
    project_area_ha: 1,
    time_horizon_years: 25,
    discount_rate_pct: 12,
    currency: "ریال",
    energy_for_irrigation_kWh_per_m3: soils["loam"].pump_kWh_m3,
    irrigation_energy_tariff: waterSources["well_electric_subsidized"].elec_tariff,
    water_unit_cost: waterSources["well_electric_subsidized"].water_cost,
    baseline_yield_t_per_ha: cropProfiles["زعفران"].yield_t_ha,
    expected_yield_change_pct_under_AGV: cropProfiles["زعفران"].baseYieldChange,
    crop_price_per_t: cropProfiles["زعفران"].price_per_t,
    crop_quality_premium_or_discount_pct: 0,
    ag_opex_baseline_per_ha: 600000000,
    ag_opex_change_under_AGV_pct: -5,
    water_use_baseline_m3_per_ha: 6000,
    water_use_change_under_AGV_pct: cropProfiles["زعفران"].waterSaving,
    pv_capacity_kWp_total: 150,
    module_price_per_kWp: 220000000,
    mounting_structure_cost_per_kWp: 70000000,
    inverter_BOS_cost_per_kWp: 60000000,
    grid_interconnection_lump_sum: 5000000000,
    EPC_soft_cost_pct_of_capex: 8,
    annual_pv_degradation_pct: 0.6,
    specific_yield_kWh_per_kWp_year: regions["torbat"].sun,
    soiling_loss_pct: dustLevels["med"].soiling,
    availability_pct: 98,
    pv_om_cost_per_kWp_year: 2500000,
    grid_scheme: "PPA/FIT",
    ppa_or_fit_tariff: 2500,
    net_metering_buy_price: 3000,
    net_metering_sell_price: 2200,
    self_consumption_share_pct: 40,
    curtailment_pct: 0,
    tariff_escalation_pct_per_year: 5,
    subsidy_capex_pct: 0,
    carbon_credit_price_per_tCO2: 0,
    avoided_co2_t_per_MWh: 0.55,
    insurance_cost_pct_of_asset_value_per_year: 1.2,
    land_lease_cost_per_ha_year: 0,
    tax_rate_pct: 0
  });
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id");
    loadScenarioById(id, setS);
  }, []);
  React.useEffect(() => {
    if (!shareLink) return;
    const el = document.getElementById("qrBox");
    if (!el) return;
    el.innerHTML = "";
    const typeNumber = 0,
      errorCorrectLevel = QRErrorCorrectLevel.M;
    const qr = qrcode(typeNumber, errorCorrectLevel);
    qr.addData(shareLink);
    qr.make();
    el.innerHTML = qr.createSvgTag(6); // Ù…Ù‚ÛŒØ§Ø³
  }, [shareLink]);
  const set = (k, v) => setS(prev => ({
    ...prev,
    [k]: v
  }));
  const pct = x => (Number(x) || 0) / 100;
  const nz = x => Number(x) || 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const fmt = n => new Intl.NumberFormat("fa-IR").format(Math.round(n || 0));
  const fmtMoney = n => `${fmt(n)} ${s.currency}`;
  useEffect(() => {
    const reg = regions[s.region];
    const crop = cropProfiles[s.crop_type] || cropProfiles["زعفران"];
    const dust = dustLevels[s.dust_level];
    const src = waterSources[s.water_source];
    const soil = soils[s.soil_type];
    const newSpecificYield = reg.sun;
    const newSoiling = dust.soiling;
    const newIrrTariff = src.elec_tariff;
    const newWaterCost = src.water_cost;
    const newPumpKWhm3 = soil.pump_kWh_m3;
    const heat = reg.heat; // low/med/high
    let yieldChange = crop.baseYieldChange;
    let waterSaving = crop.waterSaving;
    if (heat === "high") {
      yieldChange += 1;
      waterSaving -= 3;
    }
    if (heat === "low") {
      yieldChange -= 1;
      waterSaving += 2;
    }
    if (s.salinity_EC >= 4 && s.salinity_EC < 8) {
      yieldChange += 1;
      waterSaving -= 2;
    }
    if (s.salinity_EC >= 8) {
      yieldChange += 2;
      waterSaving -= 3;
    }
    setS(prev => ({
      ...prev,
      specific_yield_kWh_per_kWp_year: newSpecificYield,
      soiling_loss_pct: newSoiling,
      irrigation_energy_tariff: newIrrTariff ?? prev.irrigation_energy_tariff,
      water_unit_cost: newWaterCost ?? prev.water_unit_cost,
      energy_for_irrigation_kWh_per_m3: newPumpKWhm3 ?? prev.energy_for_irrigation_kWh_per_m3,
      expected_yield_change_pct_under_AGV: yieldChange,
      water_use_change_under_AGV_pct: waterSaving,
      baseline_yield_t_per_ha: crop.yield_t_ha,
      crop_price_per_t: crop.price_per_t
    }));
  }, [s.region, s.crop_type, s.dust_level, s.water_source, s.soil_type, s.salinity_EC]);
  const validation = useMemo(() => validateState(s, simple), [s, simple]);
  useEffect(() => {
    setErrors(validation.errors || {});
  }, [validation]);
  useEffect(() => {
    if (validation.valid) {
      setGlobalError("");
    }
  }, [validation.valid]);
  const shouldCompute = validation.valid;
  const errorKeys = Object.keys(validation.errors || {});
  const readyForOutput = shouldCompute;
  if (!shouldCompute && errorKeys.length) {
    console.error("agrivoltaics: validation failed", errorKeys);
  }

  let area = 0;
  let years = 0;
  let capex_per_kWp_sub = 0;
  let capex_kWp_with_soft = 0;
  let subsidy = 0;
  let capex_total = 0;
  let pv_om_annual = 0;
  let insurance_annual = 0;
  let land_lease_annual = 0;
  let ag_yield_baseline = 0;
  let ag_rev_baseline = 0;
  let ag_opex_baseline_total = 0;
  let water_m3_base = 0;
  let water_cost_base = 0;
  let irrigation_energy_base_kWh = 0;
  let irrigation_energy_cost_base = 0;
  let yield_change = 0;
  let ag_yield_agv = 0;
  let ag_rev_agv = 0;
  let ag_opex_agv_total = 0;
  let water_m3_agv = 0;
  let water_cost_agv = 0;
  let irrigation_energy_agv_kWh = 0;
  let irrigation_energy_cost_agv = 0;
  let net_yield_factor = 0;
  let curtail = 0;
  let kWp = 0;
  let annualPV = () => 0;
  let tariffEscal = () => 1;
  let elecRevenueYear = () => 0;
  let carbonRevenueYear = () => 0;
  let baselineAnnualNet = () => 0;
  let agvAnnualNetBeforePV = () => 0;
  let agvAnnualNet = () => 0;
  let cashflowsBaseline = [];
  let cashflowsAGV = [];
  let cashflowsAGV_WithCapex = [];
  let cashflowsBaseline_ZeroCapex = [];
  let cashflowsIncremental = [];
  let npv = () => 0;
  let irr = () => null;
  let NPV_incremental = 0;
  let IRR_incremental = null;
  let decisionText = () => "—";
  let totalPVkWhYear1 = 0;

  const handleRecompute = () => {
    const validationResult = validateState(s, simple);
    setErrors(validationResult.errors || {});
    if (!validationResult.valid) {
      setGlobalError("ابتدا خطاهای فرم را برطرف کنید.");
      return;
    }
    setGlobalError("");
    setS(prev => ({
      ...prev
    }));
  };

  const handleAsyncSimulate = async () => {
    const validationResult = validateState(s, simple);
    setErrors(validationResult.errors || {});
    if (!validationResult.valid) {
      setGlobalError("ابتدا خطاهای فرم را برطرف کنید.");
      return;
    }
    setIsLoading(true);
    setGlobalError("");
    try {
      const jobResult = await runJob(s);
      console.info("agrivoltaics: job submitted", jobResult);
    } catch (err) {
      console.error("agrivoltaics: async simulation failed", err);
      setGlobalError("شبیه‌سازی سرور ناموفق بود. لطفاً بعداً تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  if (shouldCompute) {
    area = nz(s.project_area_ha);
    years = Math.max(1, Math.floor(nz(s.time_horizon_years)));
    capex_per_kWp_sub = nz(s.module_price_per_kWp) + nz(s.mounting_structure_cost_per_kWp) + nz(s.inverter_BOS_cost_per_kWp);
    capex_kWp_with_soft = capex_per_kWp_sub * (1 + pct(s.EPC_soft_cost_pct_of_capex));
    subsidy = capex_kWp_with_soft * pct(s.subsidy_capex_pct);
    capex_total = Math.max(0, nz(s.pv_capacity_kWp_total) * (capex_kWp_with_soft - subsidy) + nz(s.grid_interconnection_lump_sum));
    pv_om_annual = nz(s.pv_capacity_kWp_total) * nz(s.pv_om_cost_per_kWp_year);
    insurance_annual = capex_total * pct(s.insurance_cost_pct_of_asset_value_per_year);
    land_lease_annual = area * nz(s.land_lease_cost_per_ha_year);
    ag_yield_baseline = nz(s.baseline_yield_t_per_ha) * area;
    ag_rev_baseline = ag_yield_baseline * nz(s.crop_price_per_t);
    ag_opex_baseline_total = area * nz(s.ag_opex_baseline_per_ha);
    water_m3_base = area * nz(s.water_use_baseline_m3_per_ha);
    water_cost_base = water_m3_base * nz(s.water_unit_cost);
    irrigation_energy_base_kWh = water_m3_base * nz(s.energy_for_irrigation_kWh_per_m3);
    irrigation_energy_cost_base = irrigation_energy_base_kWh * nz(s.irrigation_energy_tariff);
    yield_change = 1 + pct(s.expected_yield_change_pct_under_AGV) + pct(s.crop_quality_premium_or_discount_pct);
    ag_yield_agv = nz(s.baseline_yield_t_per_ha) * area * yield_change;
    ag_rev_agv = ag_yield_agv * nz(s.crop_price_per_t);
    ag_opex_agv_total = area * nz(s.ag_opex_baseline_per_ha) * (1 + pct(s.ag_opex_change_under_AGV_pct));
    water_m3_agv = water_m3_base * (1 + pct(s.water_use_change_under_AGV_pct));
    water_cost_agv = water_m3_agv * nz(s.water_unit_cost);
    irrigation_energy_agv_kWh = water_m3_agv * nz(s.energy_for_irrigation_kWh_per_m3);
    irrigation_energy_cost_agv = irrigation_energy_agv_kWh * nz(s.irrigation_energy_tariff);
    net_yield_factor = (1 - pct(s.soiling_loss_pct)) * pct(s.availability_pct);
    curtail = 1 - pct(s.curtailment_pct);
    kWp = nz(s.pv_capacity_kWp_total);
    annualPV = y => kWp * nz(s.specific_yield_kWh_per_kWp_year) * net_yield_factor * curtail * Math.pow(1 - pct(s.annual_pv_degradation_pct), y);
    tariffEscal = y => Math.pow(1 + pct(s.tariff_escalation_pct_per_year), y);
    elecRevenueYear = y => {
      const kWh = annualPV(y);
      const scheme = s.grid_scheme;
      if (scheme === "PPA/FIT") return kWh * nz(s.ppa_or_fit_tariff) * tariffEscal(y);
      if (scheme === "SelfConsumption") {
        const selfShare = Math.max(0, Math.min(1, pct(s.self_consumption_share_pct)));
        const self_kWh = kWh * selfShare;
        return self_kWh * nz(s.net_metering_buy_price) * tariffEscal(y);
      }
      const selfShare = Math.max(0, Math.min(1, pct(s.self_consumption_share_pct)));
      const self_kWh = kWh * selfShare;
      const export_kWh = kWh * (1 - selfShare);
      const avoided = self_kWh * nz(s.net_metering_buy_price) * tariffEscal(y);
      const sold = export_kWh * nz(s.net_metering_sell_price) * tariffEscal(y);
      return avoided + sold;
    };
    carbonRevenueYear = y => annualPV(y) / 1000 * nz(s.avoided_co2_t_per_MWh) * nz(s.carbon_credit_price_per_tCO2);
    baselineAnnualNet = () => ag_rev_baseline - ag_opex_baseline_total - water_cost_base - irrigation_energy_cost_base - land_lease_annual;
    agvAnnualNetBeforePV = () => ag_rev_agv - ag_opex_agv_total - water_cost_agv - irrigation_energy_cost_agv - land_lease_annual;
    agvAnnualNet = y => agvAnnualNetBeforePV() + elecRevenueYear(y) + carbonRevenueYear(y) - pv_om_annual - insurance_annual;
    cashflowsBaseline = Array.from({
      length: years
    }, () => baselineAnnualNet());
    cashflowsAGV = Array.from({
      length: years
    }, (_, y) => agvAnnualNet(y));
    cashflowsAGV_WithCapex = [-capex_total, ...cashflowsAGV];
    cashflowsBaseline_ZeroCapex = [0, ...cashflowsBaseline];
    cashflowsIncremental = cashflowsAGV_WithCapex.map((v, i) => v - (cashflowsBaseline_ZeroCapex[i] ?? 0));
    npv = (ratePct, arr) => arr.reduce((acc, cf, i) => acc + cf / Math.pow(1 + ratePct / 100, i), 0);
    irr = arr => {
      let lo = -0.9,
        hi = 1.0;
      const f = r => arr.reduce((a, c, i) => a + c / Math.pow(1 + r, i), 0);
      let flo = f(lo),
        fhi = f(hi);
      if (isNaN(flo) || isNaN(fhi) || flo * fhi > 0) return null;
      for (let k = 0; k < 80; k++) {
        const mid = (lo + hi) / 2,
          fm = f(mid);
        if (Math.abs(fm) < 1e-3) return mid;
        if (flo * fm < 0) {
          hi = mid;
          fhi = fm;
        } else {
          lo = mid;
          flo = fm;
        }
      }
      return (lo + hi) / 2;
    };
    NPV_incremental = npv(s.discount_rate_pct, cashflowsIncremental);
    IRR_incremental = irr(cashflowsIncremental);
    decisionText = () => {
      if (NPV_incremental > 0 && (IRR_incremental ?? 0) > s.discount_rate_pct / 100) return "به‌صرفه";
      if (Math.abs(NPV_incremental) < 0.05 * capex_total) return "تقریباً سر به سر";
      return "به‌صرفه نیست";
    };
    totalPVkWhYear1 = annualPV(0);
  }

  const safeNumber = (label, value) => {
    if (!readyForOutput) return null;
    if (!Number.isFinite(value)) {
      console.error(`agrivoltaics: مقدار ${label} نامعتبر است`, { value, state: s });
      return null;
    }
    return value;
  };

  const displayCapex = readyForOutput ? safeNumber("capex_total", capex_total) : null;
  const displayPVYear1 = readyForOutput ? safeNumber("totalPVkWhYear1", totalPVkWhYear1) : null;
  const displayRevenueYear0 = readyForOutput ? safeNumber("elecRevenueYear0", elecRevenueYear(0)) : null;
  const displayNPV = readyForOutput ? safeNumber("npv_incremental", npv(s.discount_rate_pct, cashflowsIncremental)) : null;
  const displayIRR = readyForOutput && Number.isFinite(IRR_incremental) ? IRR_incremental : null;

  const moneyOrDash = (label, value) => {
    const numeric = safeNumber(label, value);
    return numeric !== null ? fmtMoney(numeric) : "—";
  };

  const energyOrDash = (label, value, unit = "kWh") => {
    const numeric = safeNumber(label, value);
    return numeric !== null ? `${fmt(numeric)} ${unit}` : "—";
  };

  const percentOrDash = (label, value) => {
    const numeric = safeNumber(label, value);
    return numeric !== null ? `${(numeric * 100).toFixed(1)} %` : "نامشخص";
  };

  const displayCashflows = readyForOutput ? cashflowsIncremental : [];
  const displayAnnualPV = readyForOutput ? annualPV : () => 0;
  const displayCashflowsBaseline = readyForOutput ? cashflowsBaseline : [];
  const displayCashflowsAGV = readyForOutput ? cashflowsAGV : [];
  const displayElecRevenueYear = readyForOutput ? elecRevenueYear : () => 0;
  const displayCarbonRevenueYear = readyForOutput ? carbonRevenueYear : () => 0;
  const [yearFilter, setYearFilter] = useState("");
  const tableData = displayCashflowsAGV.map((_, i) => ({
    year: i + 1,
    energy: energyOrDash("annualPV", displayAnnualPV(i), "kWh"),
    elec: moneyOrDash("elec_and_carbon", displayElecRevenueYear(i) + displayCarbonRevenueYear(i)),
    baseline: moneyOrDash("cashflowsBaseline", displayCashflowsBaseline[i]),
    withPanels: moneyOrDash("cashflowsAGV", displayCashflowsAGV[i]),
    incremental: moneyOrDash("cashflowsIncremental", displayCashflows[i + 1] ?? null)
  }));
  const filteredTable = yearFilter ? tableData.filter(row => `${row.year}`.includes(yearFilter.trim())) : tableData;
  const tableRows = filteredTable.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.year,
    className: "border-b border-slate-200 hover:bg-sky-50"
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-3 font-semibold text-slate-900"
  }, row.year), /*#__PURE__*/React.createElement("td", {
    className: "py-3"
  }, row.energy), /*#__PURE__*/React.createElement("td", {
    className: "py-3"
  }, row.elec), /*#__PURE__*/React.createElement("td", {
    className: "py-3"
  }, row.baseline), /*#__PURE__*/React.createElement("td", {
    className: "py-3"
  }, row.withPanels), /*#__PURE__*/React.createElement("td", {
    className: "py-3"
  }, row.incremental)));
  const disableActions = !readyForOutput || isLoading;
  const Chart = ({
    data,
    title,
    height = 160
  }) => {
    const w = 720,
      h = height,
      pad = 24;
    const n = data.length;
    const min = Math.min(...data, 0),
      max = Math.max(...data, 0);
    const scaleX = i => pad + i * (w - 2 * pad) / Math.max(1, n - 1);
    const scaleY = v => {
      if (max === min) return h / 2;
      return h - pad - (v - min) * (h - 2 * pad) / (max - min);
    };
    const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
    const zeroY = scaleY(0);
    return /*#__PURE__*/React.createElement("div", {
      className: "rounded-2xl bg-white border border-slate-200 p-4 shadow-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-slate-700 text-sm mb-2"
    }, title), /*#__PURE__*/React.createElement("svg", {
      width: w,
      height: h,
      className: "max-w-full"
    }, /*#__PURE__*/React.createElement("line", {
      x1: pad,
      y1: zeroY,
      x2: w - pad,
      y2: zeroY,
      stroke: "#444",
      strokeDasharray: "4 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: path,
      fill: "none",
      stroke: "#0ea5e9",
      strokeWidth: "2"
    })));
  };
  const downloadCSV = () => {
    if (!readyForOutput) {
      setGlobalError("ابتدا ورودی‌ها را کامل کنید.");
      return;
    }
    const rows = [["سال", "برق (kWh)", "درآمد/صرفه‌جویی برق", "خالص کشاورزی (قبل)", "خالص کشاورزی (با)", "افزایشی"]];
    for (let i = 0; i < years; i++) rows.push([i + 1, Math.round(displayAnnualPV(i)), Math.round(displayElecRevenueYear(i)), Math.round(displayCashflowsBaseline[i]), Math.round(displayCashflowsAGV[i]), Math.round(displayCashflows[i + 1] ?? 0)]);
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrivoltaics_khorasan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadPDF = () => {
    if (!readyForOutput) {
      setGlobalError("ابتدا ورودی‌ها را کامل کنید.");
      return;
    }
    if (!window.jspdf) {
      alert("تولید PDF هنوز آماده نیست.");
      return;
    }
    const {
      jsPDF
    } = window.jspdf;
    const doc = new jsPDF({
      unit: "pt",
      format: "a4"
    });
    doc.setFontSize(14);
    doc.text("گزارش فوتوکِشت – خراسان رضوی", 40, 40);
    doc.setFontSize(11);
    doc.text(`هزینه اولیه: ${fmtMoney(capex_total)}`, 40, 70);
    doc.text(`برق سال اول: ${fmt(totalPVkWhYear1)} kWh`, 40, 90);
    doc.text(`درآمد/صرفه‌جویی برق سال اول: ${fmtMoney(elecRevenueYear(0))}`, 40, 110);
    doc.text(`ارزش امروز: ${fmtMoney(NPV_incremental)}`, 40, 130);
    doc.text(`نتیجه: ${decisionText()}`, 40, 150);
    let y = 190;
    doc.text("سال | برق | درآمد برق | افزایشی", 40, y);
    y += 18;
    for (let i = 0; i < Math.min(5, years); i++) {
      doc.text(`${i + 1} | ${fmt(annualPV(i))} | ${fmtMoney(elecRevenueYear(i))} | ${fmtMoney(cashflowsIncremental[i + 1] || 0)}`, 40, y);
      y += 16;
    }
    doc.save("agrivoltaics-report.pdf");
  };

  const shareModal = shareLink ? /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white text-black p-4 rounded-xl flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("div", {
    id: "qrBox",
    className: "mb-4"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded bg-emerald-600 text-white",
    onClick: () => navigator.clipboard.writeText(shareLink)
  }, "کپی لینک"), /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded bg-gray-300",
    onClick: () => setShareLink("")
  }, "بستن")))) : null;
  const summaryInfo = /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(KV, {
    k: "منطقه انتخابی",
    v: needsFix(regions[s.region]?.title) ? latin1ToUtf8(regions[s.region]?.title) : regions[s.region]?.title
  }), /*#__PURE__*/React.createElement(KV, {
    k: "محصول",
    v: s.crop_type
  }), /*#__PURE__*/React.createElement(KV, {
    k: "منبع آب",
    v: needsFix(waterSources[s.water_source]?.title) ? latin1ToUtf8(waterSources[s.water_source]?.title) : waterSources[s.water_source]?.title
  }), /*#__PURE__*/React.createElement(KV, {
    k: "نوع خاک",
    v: needsFix(soils[s.soil_type]?.title) ? latin1ToUtf8(soils[s.soil_type]?.title) : soils[s.soil_type]?.title
  }), /*#__PURE__*/React.createElement(KV, {
    k: "طرح مصرف/فروش برق",
    v: s.grid_scheme === "PPA/FIT" ? "فروش تضمینی" : s.grid_scheme === "NetMetering" ? "تراز با شبکه" : "مصرف در مزرعه"
  }), /*#__PURE__*/React.createElement(KV, {
    k: "ظرفیت کل پنل (kWp)",
    v: fmt(s.pv_capacity_kWp_total)
  }));
  const kpiGrid = /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(KPI, {
    title: "هزینه اولیه ساخت",
    value: moneyOrDash("capex_total", displayCapex),
    sub: "پنل، سازه، اینورتر، اتصال"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "برق سال اول",
    value: energyOrDash("totalPVkWhYear1", displayPVYear1, "kWh"),
    sub: "پس از کثیفی/خرابی"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "درآمد/صرفه‌جویی برق سال اول",
    value: moneyOrDash("elecRevenueYear0", displayRevenueYear0),
    sub: "طبق طرح انتخابی"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "ارزش امروز سود",
    value: moneyOrDash("npv_incremental", displayNPV),
    sub: `با نرخ ${s.discount_rate_pct}%`
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "سود سالانه تقریبی",
    value: displayIRR == null ? 'نامشخص' : `${(displayIRR * 100).toFixed(1)} %`,
    sub: "هرچه بیشتر، بهتر"
  }));
  const decisionCard = /*#__PURE__*/React.createElement("div", {
    className: `rounded-2xl p-4 border shadow-sm ${decisionText() === 'به‌صرفه' ? 'bg-emerald-50 border-emerald-200' : decisionText() === 'تقریباً سر به سر' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-slate-700"
  }, "خلاصه تصمیم:"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-bold mt-1 text-slate-900"
  }, decisionText()), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-600 mt-1"
  }, "اگر «ارزش امروز» مثبت باشد و بازگشت سرمایه در چند سال اول رخ دهد، معمولاً طرح اقتصادی است."));
  const financeSnapshot = /*#__PURE__*/React.createElement("section", {
    className: "rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-slate-900 mb-3"
  }, "نتایج خلاصه"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(KV, {
    k: "درآمد کشاورزی (قبل از پنل)",
    v: moneyOrDash("ag_rev_baseline", readyForOutput ? ag_rev_baseline : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "درآمد کشاورزی (با پنل)",
    v: moneyOrDash("ag_rev_agv", readyForOutput ? ag_rev_agv : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "هزینه آب (قبل)",
    v: moneyOrDash("water_cost_base", readyForOutput ? water_cost_base : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "هزینه آب (با پنل)",
    v: moneyOrDash("water_cost_agv", readyForOutput ? water_cost_agv : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "هزینه انرژی پمپاژ (قبل)",
    v: moneyOrDash("irrigation_energy_cost_base", readyForOutput ? irrigation_energy_cost_base : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "هزینه انرژی پمپاژ (با پنل)",
    v: moneyOrDash("irrigation_energy_cost_agv", readyForOutput ? irrigation_energy_cost_agv : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "نگهداری سالانه سامانه خورشیدی",
    v: moneyOrDash("pv_om_annual", readyForOutput ? pv_om_annual : null)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "بیمه سالانه",
    v: moneyOrDash("insurance_annual", readyForOutput ? insurance_annual : null)
  })));
  const summaryContent = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6 space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-black text-sky-900"
  }, "خلاصه نتایج محاسبه شده"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-slate-700"
  }, "تمام اعداد بر اساس ورودی‌های فعلی محاسبه شده‌اند و در کارت‌های زیر خلاصه شده‌اند.")), kpiGrid, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2"
  }, summaryInfo), decisionCard)), financeSnapshot, /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement(Chart, {
    title: "جریان نقدی افزایشی هر سال",
    data: displayCashflows.slice(1)
  }), (() => {
    const cum = [];
    let c = 0;
    for (let i = 0; i < displayCashflows.length; i++) {
      c += displayCashflows[i];
      cum.push(c);
    }
    return /*#__PURE__*/React.createElement(Chart, {
      title: "جمعِ جریان نقدی از شروع پروژه",
      data: cum
    });
  })()));
  const inputsContent = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "۰) منطقه و شرایط محلی"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "منطقه",
    value: s.region,
    onChange: v => set("region", v),
    options: Object.entries(regions).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "محصول",
    value: s.crop_type,
    onChange: v => set("crop_type", v),
    options: Object.keys(cropProfiles).map(k => ({
      value: k,
      label: needsFix(k) ? latin1ToUtf8(k) : k
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "منبع آب",
    value: s.water_source,
    onChange: v => set("water_source", v),
    options: Object.entries(waterSources).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "گرد و غبار",
    value: s.dust_level,
    onChange: v => set("dust_level", v),
    options: Object.entries(dustLevels).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "نوع خاک",
    value: s.soil_type,
    onChange: v => set("soil_type", v),
    options: Object.entries(soils).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "شوری آب/خاک (EC dS/m)",
    value: s.salinity_EC,
    onChange: v => set("salinity_EC", v),
    step: 0.5,
    min: 0,
    max: 30,
    required: true,
    inputId: "salinity_EC",
    error: errors.salinity_EC
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-600 mt-2"
  }, "* اگر منطقه دقیق شما در لیست نیست، نزدیک‌ترین منطقه را انتخاب کنید و اعداد را کمی تنظیم کنید."), /*#__PURE__*/React.createElement(Section, {
    title: "۱) اطلاعات زمین و محصول"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "مساحت زمین (هکتار)",
    value: s.project_area_ha,
    onChange: v => set("project_area_ha", v),
    step: 0.1,
    min: 0,
    max: 1000,
    required: true,
    inputId: "project_area_ha",
    error: errors.project_area_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "عملکرد فعلی (تن/هکتار)",
    value: s.baseline_yield_t_per_ha,
    onChange: v => set("baseline_yield_t_per_ha", v),
    step: 0.1,
    min: 0,
    max: 30,
    required: true,
    inputId: "baseline_yield_t_per_ha",
    error: errors.baseline_yield_t_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "تغییر عملکرد زیر پنل (%)",
    value: s.expected_yield_change_pct_under_AGV,
    onChange: v => set("expected_yield_change_pct_under_AGV", v),
    step: 0.5,
    min: -100,
    max: 200,
    required: true,
    inputId: "expected_yield_change_pct_under_AGV",
    error: errors.expected_yield_change_pct_under_AGV
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت فروش محصول (ریال/تن)",
    value: s.crop_price_per_t,
    onChange: v => set("crop_price_per_t", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "crop_price_per_t",
    error: errors.crop_price_per_t
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "هزینه سالانه کشاورزی (ریال/هکتار)",
    value: s.ag_opex_baseline_per_ha,
    onChange: v => set("ag_opex_baseline_per_ha", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "ag_opex_baseline_per_ha",
    error: errors.ag_opex_baseline_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "تغییر هزینه کشاورزی (%)",
    value: s.ag_opex_change_under_AGV_pct,
    onChange: v => set("ag_opex_change_under_AGV_pct", v),
    step: 0.5,
    min: -100,
    max: 200,
    required: true,
    inputId: "ag_opex_change_under_AGV_pct",
    error: errors.ag_opex_change_under_AGV_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "مصرف آب فعلی (m³/هکتار)",
    value: s.water_use_baseline_m3_per_ha,
    onChange: v => set("water_use_baseline_m3_per_ha", v),
    step: 10,
    min: 0,
    max: 50000,
    required: true,
    inputId: "water_use_baseline_m3_per_ha",
    error: errors.water_use_baseline_m3_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "تغییر مصرف آب (%)",
    value: s.water_use_change_under_AGV_pct,
    onChange: v => set("water_use_change_under_AGV_pct", v),
    step: 1,
    min: -100,
    max: 200,
    required: true,
    inputId: "water_use_change_under_AGV_pct",
    error: errors.water_use_change_under_AGV_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "شیرینی/تلخی قیمت (کیفی) (%)",
    value: s.crop_quality_premium_or_discount_pct,
    onChange: v => set("crop_quality_premium_or_discount_pct", v),
    step: 0.5,
    min: -100,
    max: 100,
    inputId: "crop_quality_premium_or_discount_pct",
    error: errors.crop_quality_premium_or_discount_pct
  })), /*#__PURE__*/React.createElement(Section, {
    title: "۲) آبیاری و برق مزرعه"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "برق پمپاژ آب (kWh برای هر m³)",
    value: s.energy_for_irrigation_kWh_per_m3,
    onChange: v => set("energy_for_irrigation_kWh_per_m3", v),
    step: 0.01,
    min: 0,
    max: 20,
    required: true,
    inputId: "energy_for_irrigation_kWh_per_m3",
    error: errors.energy_for_irrigation_kWh_per_m3
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت برق برای پمپاژ (ریال/kWh)",
    value: s.irrigation_energy_tariff,
    onChange: v => set("irrigation_energy_tariff", v),
    step: 50,
    min: 0,
    max: 500000,
    required: true,
    inputId: "irrigation_energy_tariff",
    error: errors.irrigation_energy_tariff
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت آب خریداری‌شده (ریال/m³)",
    value: s.water_unit_cost,
    onChange: v => set("water_unit_cost", v),
    step: 100,
    min: 0,
    max: 500000,
    required: true,
    inputId: "water_unit_cost",
    error: errors.water_unit_cost
  }), /*#__PURE__*/React.createElement(Select, {
    label: "طرح مصرف/فروش برق",
    value: s.grid_scheme,
    onChange: v => set("grid_scheme", v),
    options: [{
      value: "PPA/FIT",
      label: "فروش تضمینی"
    }, {
      value: "NetMetering",
      label: "تراز با شبکه"
    }, {
      value: "SelfConsumption",
      label: "مصرف در مزرعه"
    }]
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت تضمینی/فروش (ریال/kWh)",
    value: s.ppa_or_fit_tariff,
    onChange: v => set("ppa_or_fit_tariff", v),
    step: 50,
    min: 0,
    max: 500000,
    required: true,
    inputId: "ppa_or_fit_tariff",
    error: errors.ppa_or_fit_tariff
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "سهم مصرف در مزرعه (%)",
    value: s.self_consumption_share_pct,
    onChange: v => set("self_consumption_share_pct", v),
    step: 1,
    min: 0,
    max: 100,
    required: true,
    inputId: "self_consumption_share_pct",
    error: errors.self_consumption_share_pct
  }), s.grid_scheme === "NetMetering" || s.grid_scheme === "SelfConsumption" ? /*#__PURE__*/React.createElement(NumberInput, {
    label: "خرید برق مازاد از شبکه (ریال/kWh)",
    value: s.net_metering_buy_price,
    onChange: v => set("net_metering_buy_price", v),
    step: 50,
    min: 0,
    max: 500000,
    required: !simple,
    inputId: "net_metering_buy_price",
    error: errors.net_metering_buy_price
  }) : null, s.grid_scheme === "NetMetering" ? /*#__PURE__*/React.createElement(NumberInput, {
    label: "فروش برق مازاد به شبکه (ریال/kWh)",
    value: s.net_metering_sell_price,
    onChange: v => set("net_metering_sell_price", v),
    step: 50,
    min: 0,
    max: 500000,
    required: !simple,
    inputId: "net_metering_sell_price",
    error: errors.net_metering_sell_price
  }) : null, /*#__PURE__*/React.createElement(NumberInput, {
    label: "کاهش اجباری/دورریز (%)",
    value: s.curtailment_pct,
    onChange: v => set("curtailment_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "curtailment_pct",
    error: errors.curtailment_pct
  })), /*#__PURE__*/React.createElement(Section, {
    title: "۳) سامانه خورشیدی و مالی"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "ظرفیت کل پنل (kWp)",
    value: s.pv_capacity_kWp_total,
    onChange: v => set("pv_capacity_kWp_total", v),
    step: 1,
    min: 0,
    max: 1000000,
    required: true,
    inputId: "pv_capacity_kWp_total",
    error: errors.pv_capacity_kWp_total
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "ظرفیت ویژه سالانه (kWh/kWp)",
    value: s.specific_yield_kWh_per_kWp_year,
    onChange: v => set("specific_yield_kWh_per_kWp_year", v),
    step: 1,
    min: 0,
    max: 4000,
    required: true,
    inputId: "specific_yield_kWh_per_kWp_year",
    error: errors.specific_yield_kWh_per_kWp_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت ماژول (ریال/kWp)",
    value: s.module_price_per_kWp,
    onChange: v => set("module_price_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "module_price_per_kWp",
    error: errors.module_price_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "سازه ماونتینگ (ریال/kWp)",
    value: s.mounting_structure_cost_per_kWp,
    onChange: v => set("mounting_structure_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 5000000000,
    required: true,
    inputId: "mounting_structure_cost_per_kWp",
    error: errors.mounting_structure_cost_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "اینورتر و BOS (ریال/kWp)",
    value: s.inverter_BOS_cost_per_kWp,
    onChange: v => set("inverter_BOS_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 5000000000,
    required: true,
    inputId: "inverter_BOS_cost_per_kWp",
    error: errors.inverter_BOS_cost_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "هزینه اتصال به شبکه (ریال)",
    value: s.grid_interconnection_lump_sum,
    onChange: v => set("grid_interconnection_lump_sum", v),
    step: 1000000,
    min: 0,
    max: 100000000000,
    required: true,
    inputId: "grid_interconnection_lump_sum",
    error: errors.grid_interconnection_lump_sum
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "نرخ تنزیل (%)",
    value: s.discount_rate_pct,
    onChange: v => set("discount_rate_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "discount_rate_pct",
    error: errors.discount_rate_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "دوره تحلیل (سال)",
    value: s.time_horizon_years,
    onChange: v => set("time_horizon_years", v),
    step: 1,
    min: 1,
    max: 50,
    required: true,
    inputId: "time_horizon_years",
    error: errors.time_horizon_years
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "تورم تعرفه برق سالانه (%)",
    value: s.tariff_escalation_pct_per_year,
    onChange: v => set("tariff_escalation_pct_per_year", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "tariff_escalation_pct_per_year",
    error: errors.tariff_escalation_pct_per_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "تخفیف/یارانه سرمایه (%)",
    value: s.subsidy_capex_pct,
    onChange: v => set("subsidy_capex_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "subsidy_capex_pct",
    error: errors.subsidy_capex_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "قیمت کربن (ریال/تن CO₂)",
    value: s.carbon_credit_price_per_tCO2,
    onChange: v => set("carbon_credit_price_per_tCO2", v),
    step: 100000,
    min: 0,
    max: 500000000,
    required: true,
    inputId: "carbon_credit_price_per_tCO2",
    error: errors.carbon_credit_price_per_tCO2
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "CO₂ اجتناب‌شده (تن/MWh)",
    value: s.avoided_co2_t_per_MWh,
    onChange: v => set("avoided_co2_t_per_MWh", v),
    step: 0.01,
    min: 0,
    max: 5,
    required: true,
    inputId: "avoided_co2_t_per_MWh",
    error: errors.avoided_co2_t_per_MWh
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "بیمه سالانه (% ارزش دارایی)",
    value: s.insurance_cost_pct_of_asset_value_per_year,
    onChange: v => set("insurance_cost_pct_of_asset_value_per_year", v),
    step: 0.1,
    min: 0,
    max: 100,
    required: true,
    inputId: "insurance_cost_pct_of_asset_value_per_year",
    error: errors.insurance_cost_pct_of_asset_value_per_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "اجاره زمین (ریال/هکتار/سال)",
    value: s.land_lease_cost_per_ha_year,
    onChange: v => set("land_lease_cost_per_ha_year", v),
    step: 100000,
    min: 0,
    max: 100000000,
    required: true,
    inputId: "land_lease_cost_per_ha_year",
    error: errors.land_lease_cost_per_ha_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "مالیات (% سود)",
    value: s.tax_rate_pct,
    onChange: v => set("tax_rate_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "tax_rate_pct",
    error: errors.tax_rate_pct
  }), !simple ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NumberInput, {
    label: "هزینه نرم (درصدی)",
    value: s.EPC_soft_cost_pct_of_capex,
    onChange: v => set("EPC_soft_cost_pct_of_capex", v),
    step: 0.5,
    min: 0,
    max: 50,
    required: !simple,
    inputId: "EPC_soft_cost_pct_of_capex",
    error: errors.EPC_soft_cost_pct_of_capex
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "کاهش راندمان پنل (% سالانه)",
    value: s.annual_pv_degradation_pct,
    onChange: v => set("annual_pv_degradation_pct", v),
    step: 0.1,
    min: 0,
    max: 10,
    required: !simple,
    inputId: "annual_pv_degradation_pct",
    error: errors.annual_pv_degradation_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "کثیفی پنل (٪)",
    value: s.soiling_loss_pct,
    onChange: v => set("soiling_loss_pct", v),
    step: 0.5,
    min: 0,
    max: 30,
    required: !simple,
    inputId: "soiling_loss_pct",
    error: errors.soiling_loss_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "دسترسی‌پذیری سامانه (٪)",
    value: s.availability_pct,
    onChange: v => set("availability_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: !simple,
    inputId: "availability_pct",
    error: errors.availability_pct
  })) : null, /*#__PURE__*/React.createElement(NumberInput, {
    label: "نگهداری سالانه (ریال/kWp)",
    value: s.pv_om_cost_per_kWp_year,
    onChange: v => set("pv_om_cost_per_kWp_year", v),
    step: 10000,
    min: 0,
    required: true,
    inputId: "pv_om_cost_per_kWp_year",
    error: errors.pv_om_cost_per_kWp_year
  }))), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-600 pb-4"
  }, "نکته: برای دقت بیشتر، قیمت محصول و هزینه آب/برق را از فیش‌های اخیر خودتان وارد کنید. اگر خواستید، می‌توانیم نسخه روستایی/دهستانی با اعداد دقیق‌تری بسازیم."));
  const tableContent = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-900"
  }, "جدول سال‌به‌سال"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600"
  }, "برق تولیدی، درآمد و جریان نقدی افزایشی هر سال را در جدول زیر ببینید.")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-sm text-slate-700"
  }, "سال"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    value: yearFilter,
    onChange: e => setYearFilter(e.target.value),
    placeholder: "همه",
    className: "w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-50 text-slate-700"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "سال"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "برق (kWh)"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "درآمد/صرفه‌جویی برق"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "خالص کشاورزی (قبل)"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "خالص کشاورزی (با پنل)"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 text-right px-3"
  }, "افزایشی"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-200"
  }, tableRows))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 text-xs text-slate-600"
  }, "* سال صفر شامل هزینه ساخت است و در جدول نیامده است."));
  const tabs = [{
    id: "summary",
    label: "خلاصه نتایج"
  }, {
    id: "inputs",
    label: "پارامترهای ورودی"
  }, {
    id: "table",
    label: "جدول داده‌ها"
  }];
  return /*#__PURE__*/React.createElement("div", {
    dir: "rtl",
    className: "min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900"
  }, /*#__PURE__*/React.createElement("header", {
    className: "border-b border-slate-200 bg-white/80 backdrop-blur"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl md:text-4xl font-black text-sky-900"
  }, "ماشین‌حساب فتوکِشت – ویژه خراسان رضوی"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-slate-700 max-w-4xl"
  }, "با چند ورودی ساده ببینید کِشت زیر پنل خورشیدی در منطقه شما می‌صرفد یا نه."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 text-xs text-slate-600"
  }, /*#__PURE__*/React.createElement("span", null, "۱) منطقه، محصول، آب و خاک را انتخاب کنید."), /*#__PURE__*/React.createElement("span", null, "۲) اگر لازم بود، قیمت‌ها و مقادیر را با وضعیت خودتان عوض کنید."), /*#__PURE__*/React.createElement("span", null, "۳) نتیجه را در کارت‌ها، نمودار و جدول ببینید."))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleRecompute,
    disabled: isLoading,
    className: `px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`
  }, isLoading ? "در حال محاسبه..." : "به‌روزرسانی محاسبات"), /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100",
    onClick: () => setSimple(v => !v)
  }, "حالت ", simple ? 'پیشرفته' : 'ساده'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (disableActions) return;
      downloadCSV();
    },
    disabled: disableActions,
    className: `px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
  }, "دانلود CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (disableActions) return;
      downloadPDF();
    },
    disabled: disableActions,
    className: `px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
  }, "دانلود PDF"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (disableActions) return;
      saveScenario(s, setShareLink);
    },
    disabled: disableActions,
    className: `px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
  }, "ذخیره سناریو"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (disableActions) return;
      handleAsyncSimulate();
    },
    disabled: disableActions,
    className: `px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
  }, isLoading ? "در حال ارسال..." : "ارسال برای شبیه‌سازی"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const id = prompt("کُد/لینک را وارد کنید:");
      const onlyId = (id || "").split("id=").pop();
      loadScenarioById(onlyId, setS);
    },
    className: "px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50"
  }, "بازکردن از لینک"))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 pb-4 flex flex-wrap gap-2"
  }, tabs.map(tab => /*#__PURE__*/React.createElement("button", {
    key: tab.id,
    onClick: () => setActiveTab(tab.id),
    className: `px-4 py-2 rounded-full text-sm font-semibold border transition ${activeTab === tab.id ? 'bg-sky-600 text-white border-sky-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:border-sky-200 hover:text-sky-700'}`
  }, tab.label)))), globalError && /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 text-sm text-rose-600 mb-4",
    role: "alert"
  }, globalError), /*#__PURE__*/React.createElement("main", {
    className: "max-w-7xl mx-auto px-4 pb-12 space-y-6"
  }, activeTab === "summary" ? summaryContent : null, activeTab === "inputs" ? inputsContent : null, activeTab === "table" ? tableContent : null), shareModal);
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AgrivoltaicsKhorasan));
