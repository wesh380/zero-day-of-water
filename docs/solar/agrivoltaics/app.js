import { apiFetch, getBaseUrl } from "/assets/js/api.js";
import { fixTitles, needsFix, latin1ToUtf8 } from "/assets/js/encoding.js";
void getBaseUrl();

const POLL_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 30;

const ensureOverridesLoaded = () => {
  if (typeof document === "undefined") return;
  if (document.querySelector("link[data-agri-overrides]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/solar/agrivoltaics/overrides.css";
  link.setAttribute("data-agri-overrides", "true");
  document.head.appendChild(link);
};

ensureOverridesLoaded();

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
  className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl w-full min-w-0"
}, /*#__PURE__*/React.createElement("h2", {
  className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full min-w-0"
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
  error,
  unit,
  helperText
}) => {
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hasError = Boolean(error);
  return /*#__PURE__*/React.createElement("label", {
    className: "flex flex-col gap-1 text-sm w-full min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-gray-200 flex items-center justify-between gap-2 w-full min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "truncate"
  }, label), unit && /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] leading-tight px-2 py-0.5 rounded-full bg-neutral-800 text-gray-200 border border-neutral-700 shrink-0"
  }, unit)), /*#__PURE__*/React.createElement("input", {
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
      if (raw === "") {
        onChange(null);
        return;
      }
      const parsed = Number(raw);
      onChange(Number.isFinite(parsed) ? parsed : NaN);
    },
    "aria-invalid": hasError ? "true" : undefined,
    "aria-describedby": errorId,
    className: `w-full min-w-0 max-w-full rounded-xl bg-neutral-900 border px-3 py-2 text-right text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700 focus:ring-emerald-500'}`,
    style: {color: '#ffffff', WebkitTextFillColor: '#ffffff'}
  }), helperText && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-gray-400 leading-snug"
  }, helperText), /*#__PURE__*/React.createElement("div", {
    id: errorId,
    className: "text-red-400 text-xs min-h-[1rem]"
  }, error || ""));
};
const Select = ({
  label,
  value,
  onChange,
  options
}) => /*#__PURE__*/React.createElement("label", {
  className: "flex flex-col gap-1 text-sm w-full min-w-0"
}, /*#__PURE__*/React.createElement("span", {
  className: "text-gray-200 w-full min-w-0 truncate"
}, label), /*#__PURE__*/React.createElement("select", {
  value: value,
  onChange: e => onChange(e.target.value),
  className: "w-full min-w-0 max-w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-right text-white focus:outline-none focus:ring-2 focus:ring-emerald-500",
  style: {color: '#ffffff', WebkitTextFillColor: '#ffffff'}
}, options.map(o => /*#__PURE__*/React.createElement("option", {
  key: o.value,
  value: o.value,
  className: "bg-neutral-900 text-white",
  style: {color: '#ffffff', backgroundColor: '#171717'}
}, o.label))));
const KPI = ({
  title,
  value,
  sub
}) => /*#__PURE__*/React.createElement("div", {
  className: "agri-kpi rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4 shadow-xl min-w-0 max-w-full overflow-hidden"
}, /*#__PURE__*/React.createElement("div", {
  className: "text-gray-300 text-sm truncate"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "text-xl md:text-2xl font-extrabold mt-1 text-emerald-400 text-center leading-tight break-words whitespace-normal"
}, /*#__PURE__*/React.createElement("bdi", {
  className: "inline-block max-w-full whitespace-normal break-words",
  dir: "ltr"
}, value)), sub && /*#__PURE__*/React.createElement("div", {
  className: "text-xs text-gray-400 mt-1 text-center leading-snug break-words whitespace-normal"
}, sub));
const KV = ({
  k,
  v
}) => /*#__PURE__*/React.createElement("div", {
  className: "rounded-xl bg-neutral-900/50 border border-neutral-800 p-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "text-gray-400 text-xs"
}, k), /*#__PURE__*/React.createElement("div", {
  className: "text-sm md:text-base font-semibold text-gray-100 mt-0.5"
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
    { key: "pv_om_cost_per_kWp_year", min: 0, required: true },
    { key: "time_horizon_years", min: 1, max: 50, required: true, positive: true },
    { key: "discount_rate_pct", min: 0, max: 100, required: true },
    { key: "tariff_escalation_pct_per_year", min: -50, max: 100, required: true },
    { key: "subsidy_capex_pct", min: 0, max: 100, required: false },
    { key: "land_lease_cost_per_ha_year", min: 0, max: 10000000000, required: false },
    { key: "insurance_cost_pct_of_asset_value_per_year", min: 0, max: 100, required: false },
    { key: "tax_rate_pct", min: 0, max: 100, required: false },
    { key: "curtailment_pct", min: 0, max: 100, required: false },
    { key: "carbon_credit_price_per_tCO2", min: 0, max: 10000000000, required: false },
    { key: "avoided_co2_t_per_MWh", min: 0, max: 5, required: false }
  ];

  const errors = {};

  for (const rule of rules) {
    const value = state?.[rule.key];
    const empty = value === null || value === undefined || Number.isNaN(value);
    const numeric = Number(value);
    if (rule.required && (empty || !Number.isFinite(value))) {
      errors[rule.key] = "این فیلد الزامی است";
      continue;
    }
    if (!rule.required && empty) {
      continue;
    }
    if (!Number.isFinite(numeric)) {
      errors[rule.key] = "عدد نامعتبر است";
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
  const assumptionItems = useMemo(() => [{
    label: "نرخ تنزیل پایه",
    value: `${s.discount_rate_pct}%`
  }, {
    label: "کاهش راندمان سالانه پنل",
    value: `${s.annual_pv_degradation_pct}%`
  }, {
    label: "دسترس‌پذیری نیروگاه",
    value: `${s.availability_pct}%`
  }, {
    label: "اتلاف گرد و غبار",
    value: `${s.soiling_loss_pct}%`
  }, {
    label: "تغییر عملکرد محصول زیر پنل",
    value: `${s.expected_yield_change_pct_under_AGV}%`
  }, {
    label: "صرفه‌جویی آب زیر پنل",
    value: `${s.water_use_change_under_AGV_pct}%`
  }, {
    label: "افزایش سالانه تعرفه برق",
    value: `${s.tariff_escalation_pct_per_year}%`
  }, {
    label: "محدودیت/کاهش اجباری تولید",
    value: `${s.curtailment_pct}%`
  }], [s]);
  const pct = x => {
    const n = Number(x);
    return Number.isFinite(n) ? n / 100 : 0;
  };
  const nz = x => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };
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
  const tableRows = displayCashflowsAGV.map((_, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: "border-b border-neutral-900 hover:bg-neutral-900/40"
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, energyOrDash("annualPV", displayAnnualPV(i), "kWh")), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, moneyOrDash("elec_and_carbon", displayElecRevenueYear(i) + displayCarbonRevenueYear(i))), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, moneyOrDash("cashflowsBaseline", displayCashflowsBaseline[i])), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, moneyOrDash("cashflowsAGV", displayCashflowsAGV[i])), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, moneyOrDash("cashflowsIncremental", displayCashflows[i + 1] ?? null))));
  const disableActions = !readyForOutput || isLoading;
  const Chart = ({
    data,
    title,
    height = 160
  }) => {
    const viewW = 720,
      h = height,
      pad = 24;
    const n = data.length;
    const min = Math.min(...data, 0),
      max = Math.max(...data, 0);
    const scaleX = i => pad + i * (viewW - 2 * pad) / Math.max(1, n - 1);
    const scaleY = v => {
      if (max === min) return h / 2;
      return h - pad - (v - min) * (h - 2 * pad) / (max - min);
    };
    const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
    const zeroY = scaleY(0);
    return /*#__PURE__*/React.createElement("div", {
      className: "rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4 min-w-0 overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-gray-300 text-sm mb-2"
    }, title), /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${viewW} ${h}`,
      width: "100%",
      height: h,
      preserveAspectRatio: "xMidYMid meet",
      className: "w-full max-w-full"
    }, /*#__PURE__*/React.createElement("line", {
      x1: pad,
      y1: zeroY,
      x2: viewW - pad,
      y2: zeroY,
      stroke: "#444",
      strokeDasharray: "4 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: path,
      fill: "none",
      stroke: "#10b981",
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
    const actionButtons = /*#__PURE__*/React.createElement("div", {
      className: "agri-actions w-full max-w-none xl:max-w-7xl xl:mx-auto mb-4 flex flex-wrap gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: handleRecompute,
      disabled: isLoading,
      className: `w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`
    }, isLoading ? "در حال محاسبه..." : "به‌روزرسانی محاسبات"), /*#__PURE__*/React.createElement("button", {
      className: "w-full sm:w-auto min-w-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white",
      onClick: () => setSimple(v => !v)
    }, "حالت ", simple ? 'پیشرفته' : 'ساده'), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (disableActions) return;
        downloadCSV();
      },
      disabled: disableActions,
      className: `w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
    }, "دانلود CSV"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (disableActions) return;
        downloadPDF();
      },
      disabled: disableActions,
      className: `w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
    }, "دانلود PDF"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (disableActions) return;
        saveScenario(s, setShareLink);
      },
      disabled: disableActions,
      className: `w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
    }, "ذخیره سناریو"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (disableActions) return;
        handleAsyncSimulate();
      },
      disabled: disableActions,
      className: `w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100 ${disableActions ? 'opacity-50 cursor-not-allowed' : ''}`
    }, isLoading ? "در حال ارسال..." : "ارسال برای شبیه‌سازی"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        const id = prompt("کُد/لینک را وارد کنید:");
        const onlyId = (id || "").split("id=").pop();
        loadScenarioById(onlyId, setS);
      },
      className: "w-full sm:w-auto min-w-0 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100"
    }, "بازکردن از لینک"));
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
    }, "\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9"), /*#__PURE__*/React.createElement("button", {
      className: "px-3 py-2 rounded bg-gray-300",
      onClick: () => setShareLink("")
    }, "\u0628\u0633\u062A\u0646")))) : null;

    return /*#__PURE__*/React.createElement("div", {
      className: "agri-calculator-shell"
    }, /*#__PURE__*/React.createElement("div", {
      dir: "rtl",
      className: "agri-wrapper min-h-screen w-full min-w-0 bg-gradient-to-b from-neutral-950 to-neutral-900 text-gray-100 px-1 py-6 md:py-10 md:px-1"
    }, /*#__PURE__*/React.createElement("header", {
      className: "agri-header max-w-7xl mx-auto mb-4 md:mb-6 w-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-full min-w-0"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-2xl md:text-3xl font-extrabold tracking-tight"
    }, "ماشین‌حساب فوتوکِشت – وژه خراسان رضوی"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm md:text-base text-gray-300 mt-2"
    }, "با چند ورودی ساده ببینید کِشت زیر پنل خورشیدی در منطقه شما می‌صرفد یا نه."), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-xs text-gray-400 space-y-1"
    }, /*#__PURE__*/React.createElement("div", null, "۱) منطقه، محصول، آب و خاک را انتخاب کنید. اعداد پیش‌فرض بر اساس شرایط رایج استان پر می‌شوند."), /*#__PURE__*/React.createElement("div", null, "۲) اگر لازم بود، قیمت‌ها و مقادیر را با وضعیت خودتان عوض کنید."), /*#__PURE__*/React.createElement("div", null, "۳) نتیجه را در کارت‌ها و نمودار ببینید. اگر «ارزش امروز» مثبت باشد، معمولاً طرح خوب است.")))), actionButtons, globalError && /*#__PURE__*/React.createElement("div", {
      className: "text-red-400 text-sm mb-4 agi-error w-full max-w-none xl:max-w-7xl xl:mx-auto",
      role: "alert"
    }, globalError), /*#__PURE__*/React.createElement("main", {
      className: "agri-main w-full max-w-none min-w-0 xl:max-w-7xl xl:mx-auto space-y-4",
      role: "main"
    }, [/*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
  }, "\u06F0) \u0645\u0646\u0637\u0642\u0647 \u0648 \u0634\u0631\u0627\u06CC\u0637 \u0645\u062D\u0644\u06CC"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full min-w-0"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u0646\u0637\u0642\u0647",
    value: s.region,
    onChange: v => set("region", v),
    options: Object.entries(regions).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u062D\u0635\u0648\u0644",
    value: s.crop_type,
    onChange: v => set("crop_type", v),
    options: Object.keys(cropProfiles).map(k => ({
      value: k,
      label: needsFix(k) ? latin1ToUtf8(k) : k
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u0646\u0628\u0639 \u0622\u0628",
    value: s.water_source,
    onChange: v => set("water_source", v),
    options: Object.entries(waterSources).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u06AF\u0631\u062F \u0648 \u063A\u0628\u0627\u0631",
    value: s.dust_level,
    onChange: v => set("dust_level", v),
    options: Object.entries(dustLevels).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0646\u0648\u0639 \u062E\u0627\u06A9",
    value: s.soil_type,
    onChange: v => set("soil_type", v),
    options: Object.entries(soils).map(([k, v]) => ({
      value: k,
      label: needsFix(v.title) ? latin1ToUtf8(v.title) : v.title
    }))
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0634\u0648\u0631\u06CC \u0622\u0628/\u062E\u0627\u06A9 (EC dS/m)",
    value: s.salinity_EC,
    onChange: v => set("salinity_EC", v),
    step: 0.5,
    min: 0,
    max: 30,
    required: true,
    inputId: "salinity_EC",
    error: errors.salinity_EC
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400 mt-3"
  }, "* \u0627\u06AF\u0631 \u0645\u0646\u0637\u0642\u0647 \u062F\u0642\u06CC\u0642 \u0634\u0645\u0627 \u062F\u0631 \u0644\u06CC\u0633\u062A \u0646\u06CC\u0633\u062A\u060C \u0646\u0632\u062F\u06CC\u06A9\u200C\u062A\u0631\u06CC\u0646 \u0645\u0646\u0637\u0642\u0647 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F \u0648 \u0627\u0639\u062F\u0627\u062F \u0631\u0627 \u06A9\u0645\u06CC \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F.")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 w-full min-w-0"
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
  })), /*#__PURE__*/React.createElement("div", {
    className: `rounded-2xl p-4 border shadow-xl ${decisionText() === 'به‌صرفه' ? 'bg-emerald-900/30 border-emerald-700' : decisionText() === 'تقریباً سر به سر' ? 'bg-yellow-900/30 border-yellow-700' : 'bg-rose-900/30 border-rose-700'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm"
  }, "\u062E\u0644\u0627\u0635\u0647 \u062A\u0635\u0645\u06CC\u0645:"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-bold mt-1"
  }, decisionText()), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-300 mt-1"
  }, "اگر «ارزش امروز» مثبت باشد و بازگشت سرمایه در چند سال اول رخ دهد، معمولاً طرح اقتصادی است.")), /*#__PURE__*/React.createElement("details", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl mb-4"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "cursor-pointer text-emerald-300 font-bold text-base md:text-lg flex items-center justify-between"
  }, "فرضیات محاسبه", /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-gray-400"
  }, "برای تغییر، مقدار فیلد مربوط را ویرایش کنید")), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 grid md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-200"
  }, assumptionItems.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.label,
    className: "rounded-xl bg-neutral-900/50 border border-neutral-800 p-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-gray-400 text-xs"
  }, item.label), /*#__PURE__*/React.createElement("div", {
    className: "font-semibold mt-1"
  }, item.value))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400 md:col-span-2 lg:col-span-4"
  }, "اگر هرکدام از این پیش‌فرض‌ها را تغییر دهید، محاسبه بر اساس مقدار جدید انجام می‌شود."))), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F1) \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0632\u0645\u06CC\u0646 \u0648 \u0645\u062D\u0635\u0648\u0644"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u0633\u0627\u062D\u062A \u0632\u0645\u06CC\u0646",
    value: s.project_area_ha,
    onChange: v => set("project_area_ha", v),
    step: 0.1,
    min: 0,
    max: 1000,
    required: true,
    inputId: "project_area_ha",
    unit: "\u0647\u06A9\u062A\u0627\u0631",
    helperText: "\u0645\u062B\u0627\u0644: 2 \u0647\u06A9\u062A\u0627\u0631",
    error: errors.project_area_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0639\u0645\u0644\u06A9\u0631\u062F \u0641\u0639\u0644\u06CC",
    value: s.baseline_yield_t_per_ha,
    onChange: v => set("baseline_yield_t_per_ha", v),
    step: 0.1,
    min: 0,
    max: 30,
    required: true,
    inputId: "baseline_yield_t_per_ha",
    unit: "\u062A\u0646/\u0647\u06A9\u062A\u0627\u0631",
    helperText: "\u0645\u062B\u0627\u0644: 4 \u062A\u0646 \u062F\u0631 \u0647\u0631 \u0647\u06A9\u062A\u0627\u0631",
    error: errors.baseline_yield_t_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0639\u0645\u0644\u06A9\u0631\u062F \u0632\u06CC\u0631 \u067E\u0646\u0644",
    value: s.expected_yield_change_pct_under_AGV,
    onChange: v => set("expected_yield_change_pct_under_AGV", v),
    step: 0.5,
    min: -100,
    max: 200,
    required: true,
    inputId: "expected_yield_change_pct_under_AGV",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 5- \u06A9\u0627\u0647\u0634 \u0633\u0627\u062F\u0647",
    error: errors.expected_yield_change_pct_under_AGV
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0645\u062D\u0635\u0648\u0644",
    value: s.crop_price_per_t,
    onChange: v => set("crop_price_per_t", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "crop_price_per_t",
    unit: "\u0631\u06CC\u0627\u0644/\u062A\u0646",
    helperText: "\u0645\u062B\u0627\u0644: 2000000000",
    error: errors.crop_price_per_t
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u0645\u0632\u0631\u0639\u0647",
    value: s.ag_opex_baseline_per_ha,
    onChange: v => set("ag_opex_baseline_per_ha", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "ag_opex_baseline_per_ha",
    unit: "\u0631\u06CC\u0627\u0644/\u0647\u06A9\u062A\u0627\u0631",
    helperText: "\u0645\u062B\u0627\u0644: 600000000",
    error: errors.ag_opex_baseline_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0647\u0632\u06CC\u0646\u0647 \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC",
    value: s.ag_opex_change_under_AGV_pct,
    onChange: v => set("ag_opex_change_under_AGV_pct", v),
    step: 0.5,
    min: -100,
    max: 200,
    required: true,
    inputId: "ag_opex_change_under_AGV_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 5-",
    error: errors.ag_opex_change_under_AGV_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u0635\u0631\u0641 \u0622\u0628 \u0641\u0639\u0644\u06CC",
    value: s.water_use_baseline_m3_per_ha,
    onChange: v => set("water_use_baseline_m3_per_ha", v),
    step: 10,
    min: 0,
    max: 50000,
    required: true,
    inputId: "water_use_baseline_m3_per_ha",
    unit: "m\xB3/\u0647\u06A9\u062A\u0627\u0631",
    helperText: "\u0645\u062B\u0627\u0644: 6000",
    error: errors.water_use_baseline_m3_per_ha
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0635\u0631\u0641 \u0622\u0628",
    value: s.water_use_change_under_AGV_pct,
    onChange: v => set("water_use_change_under_AGV_pct", v),
    step: 1,
    min: -100,
    max: 200,
    required: true,
    inputId: "water_use_change_under_AGV_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 20-",
    error: errors.water_use_change_under_AGV_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0634\u06CC\u0631\u06CC\u0646\u06CC/\u062A\u0644\u062E\u06CC \u0642\u06CC\u0645\u062A \u0645\u062D\u0635\u0648\u0644",
    value: s.crop_quality_premium_or_discount_pct,
    onChange: v => set("crop_quality_premium_or_discount_pct", v),
    step: 0.5,
    min: -100,
    max: 100,
    inputId: "crop_quality_premium_or_discount_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 3+ \u0628\u0631\u0627\u06CC \u06A9\u06CC\u0641\u06CC\u062A \u0628\u0627\u0644\u0627",
    error: errors.crop_quality_premium_or_discount_pct
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F2) \u0622\u0628\u06CC\u0627\u0631\u06CC \u0648 \u0628\u0631\u0642 \u0645\u0632\u0631\u0639\u0647"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0628\u0631\u0642 \u067E\u0645\u067E\u0627\u0698 \u0622\u0628",
    value: s.energy_for_irrigation_kWh_per_m3,
    onChange: v => set("energy_for_irrigation_kWh_per_m3", v),
    step: 0.01,
    min: 0,
    max: 20,
    required: true,
    inputId: "energy_for_irrigation_kWh_per_m3",
    unit: "kWh/m\xB3",
    helperText: "\u0645\u062B\u0627\u0644: 0.5 \u0628\u0631\u0627\u06CC \u0639\u0645\u0642 \u0645\u0639\u0645\u0648\u0644",
    error: errors.energy_for_irrigation_kWh_per_m3
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0628\u0631\u0642 \u067E\u0645\u067E\u0627\u0698",
    value: s.irrigation_energy_tariff,
    onChange: v => set("irrigation_energy_tariff", v),
    step: 50,
    min: 0,
    max: 500000,
    required: true,
    inputId: "irrigation_energy_tariff",
    unit: "\u0631\u06CC\u0627\u0644/kWh",
    helperText: "\u0645\u062B\u0627\u0644: 3000",
    error: errors.irrigation_energy_tariff
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0622\u0628 \u062E\u0631\u06CC\u062F\u0627\u0631\u06CC\u200C\u0634\u062F\u0647",
    value: s.water_unit_cost,
    onChange: v => set("water_unit_cost", v),
    step: 100,
    min: 0,
    max: 500000,
    required: true,
    inputId: "water_unit_cost",
    unit: "\u0631\u06CC\u0627\u0644/m\xB3",
    helperText: "\u0645\u062B\u0627\u0644: 20000",
    error: errors.water_unit_cost
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0637\u0631\u062D \u0645\u0635\u0631\u0641/\u0641\u0631\u0648\u0634 \u0628\u0631\u0642",
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
    label: "\u062A\u0639\u0631\u0641\u0647 \u062A\u0636\u0645\u06CC\u0646\u06CC/\u0641\u0631\u0648\u0634",
    value: s.ppa_or_fit_tariff,
    onChange: v => set("ppa_or_fit_tariff", v),
    step: 50,
    min: 0,
    max: 500000,
    required: true,
    inputId: "ppa_or_fit_tariff",
    unit: "\u0631\u06CC\u0627\u0644/kWh",
    helperText: "\u0645\u062B\u0627\u0644: 2500",
    error: errors.ppa_or_fit_tariff
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0633\u0647\u0645 \u0645\u0635\u0631\u0641 \u062F\u0631 \u0645\u0632\u0631\u0639\u0647",
    value: s.self_consumption_share_pct,
    onChange: v => set("self_consumption_share_pct", v),
    step: 1,
    min: 0,
    max: 100,
    required: true,
    inputId: "self_consumption_share_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 40 \u0628\u0631\u0627\u06CC \u0645\u0635\u0631\u0641 \u062F\u0627\u062E\u0644\u06CC",
    error: errors.self_consumption_share_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u062E\u0631\u06CC\u062F \u0627\u0632 \u0634\u0628\u06A9\u0647",
    value: s.net_metering_buy_price,
    onChange: v => set("net_metering_buy_price", v),
    step: 50,
    min: 0,
    max: 500000,
    inputId: "net_metering_buy_price",
    unit: "\u0631\u06CC\u0627\u0644/kWh",
    helperText: "\u0645\u062B\u0627\u0644: 3000",
    error: errors.net_metering_buy_price
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0641\u0631\u0648\u0634 \u0628\u0647 \u0634\u0628\u06A9\u0647",
    value: s.net_metering_sell_price,
    onChange: v => set("net_metering_sell_price", v),
    step: 50,
    min: 0,
    max: 500000,
    inputId: "net_metering_sell_price",
    unit: "\u0631\u06CC\u0627\u0644/kWh",
    helperText: "\u0645\u062B\u0627\u0644: 2200",
    error: errors.net_metering_sell_price
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F3) \u0628\u0631\u0642 \u062E\u0648\u0631\u0634\u06CC\u062F\u06CC (\u0627\u0646\u062F\u0627\u0632\u0647 \u0648 \u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u062E\u062A)"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0638\u0631\u0641\u06CC\u062A \u06A9\u0644 \u0633\u0627\u0645\u0627\u0646\u0647",
    value: s.pv_capacity_kWp_total,
    onChange: v => set("pv_capacity_kWp_total", v),
    min: 0,
    max: 1000000,
    required: true,
    inputId: "pv_capacity_kWp_total",
    unit: "kWp",
    helperText: "\u0645\u062B\u0627\u0644: 150 kWp \u0628\u0631\u0627\u06CC \u06CC\u06A9 \u0647\u06A9\u062A\u0627\u0631",
    error: errors.pv_capacity_kWp_total
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u0648\u0644\u06CC\u062F \u0648\u06CC\u0698\u0647 \u0633\u0627\u0644\u0627\u0646\u0647",
    value: s.specific_yield_kWh_per_kWp_year,
    onChange: v => set("specific_yield_kWh_per_kWp_year", v),
    step: 10,
    min: 0,
    max: 4000,
    required: true,
    inputId: "specific_yield_kWh_per_kWp_year",
    unit: "kWh/kWp",
    helperText: "\u0645\u062B\u0627\u0644: 1700 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0645\u0646\u0637\u0642\u0647",
    error: errors.specific_yield_kWh_per_kWp_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u067E\u0646\u0644",
    value: s.module_price_per_kWp,
    onChange: v => set("module_price_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 10000000000,
    required: true,
    inputId: "module_price_per_kWp",
    unit: "\u0631\u06CC\u0627\u0644/kWp",
    helperText: "\u0645\u062B\u0627\u0644: 220000000",
    error: errors.module_price_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u0632\u0647",
    value: s.mounting_structure_cost_per_kWp,
    onChange: v => set("mounting_structure_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 5000000000,
    required: true,
    inputId: "mounting_structure_cost_per_kWp",
    unit: "\u0631\u06CC\u0627\u0644/kWp",
    helperText: "\u0645\u062B\u0627\u0644: 70000000",
    error: errors.mounting_structure_cost_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u06CC\u0646\u0648\u0631\u062A\u0631 \u0648 \u06A9\u0627\u0628\u0644\u200C\u06A9\u0634\u06CC",
    value: s.inverter_BOS_cost_per_kWp,
    onChange: v => set("inverter_BOS_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    max: 5000000000,
    required: true,
    inputId: "inverter_BOS_cost_per_kWp",
    unit: "\u0631\u06CC\u0627\u0644/kWp",
    helperText: "\u0645\u062B\u0627\u0644: 60000000",
    error: errors.inverter_BOS_cost_per_kWp
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0634\u0628\u06A9\u0647",
    value: s.grid_interconnection_lump_sum,
    onChange: v => set("grid_interconnection_lump_sum", v),
    step: 1000000,
    min: 0,
    max: 100000000000,
    required: true,
    inputId: "grid_interconnection_lump_sum",
    unit: "\u0631\u06CC\u0627\u0644",
    helperText: "\u0645\u062B\u0627\u0644: 5000000000",
    error: errors.grid_interconnection_lump_sum
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0633\u0627\u0644\u0627\u0646\u0647",
    value: s.pv_om_cost_per_kWp_year,
    onChange: v => set("pv_om_cost_per_kWp_year", v),
    step: 10000,
    min: 0,
    required: true,
    inputId: "pv_om_cost_per_kWp_year",
    unit: "\u0631\u06CC\u0627\u0644/kWp",
    helperText: "\u0645\u062B\u0627\u0644: 2500000 \u0628\u0647 \u0627\u0632\u0627\u06CC \u0647\u0631 kWp",
    error: errors.pv_om_cost_per_kWp_year
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F4) \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627\u06CC \u0645\u0627\u0644\u06CC"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u0641\u0642 \u062A\u062D\u0644\u06CC\u0644",
    value: s.time_horizon_years,
    onChange: v => set("time_horizon_years", v),
    step: 1,
    min: 1,
    max: 50,
    required: true,
    inputId: "time_horizon_years",
    unit: "\u0633\u0627\u0644",
    helperText: "\u0645\u062B\u0627\u0644: 25",
    error: errors.time_horizon_years
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0646\u0631\u062E \u062A\u0646\u0632\u0644",
    value: s.discount_rate_pct,
    onChange: v => set("discount_rate_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: true,
    inputId: "discount_rate_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 12",
    error: errors.discount_rate_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u0641\u0632\u0627\u06CC\u0634 \u0633\u0627\u0644\u0627\u0646\u0647 \u062A\u0639\u0631\u0641\u0647 \u0628\u0631\u0642",
    value: s.tariff_escalation_pct_per_year,
    onChange: v => set("tariff_escalation_pct_per_year", v),
    step: 0.5,
    min: -50,
    max: 100,
    required: true,
    inputId: "tariff_escalation_pct_per_year",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 5",
    error: errors.tariff_escalation_pct_per_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u06CC\u0627\u0631\u0627\u0646\u0647 \u0633\u0631\u0645\u0627\u06CC\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC",
    value: s.subsidy_capex_pct,
    onChange: v => set("subsidy_capex_pct", v),
    step: 1,
    min: 0,
    max: 100,
    inputId: "subsidy_capex_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 0 \u062A\u0627 20",
    error: errors.subsidy_capex_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u062C\u0627\u0631\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u0632\u0645\u06CC\u0646",
    value: s.land_lease_cost_per_ha_year,
    onChange: v => set("land_lease_cost_per_ha_year", v),
    step: 100000,
    min: 0,
    max: 10000000000,
    inputId: "land_lease_cost_per_ha_year",
    unit: "\u0631\u06CC\u0627\u0644/\u0647\u06A9\u062A\u0627\u0631",
    helperText: "\u0627\u06AF\u0631 \u0645\u0627\u0644\u06A9 \u0627\u06CC\u062F \u0635\u0641\u0631 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F",
    error: errors.land_lease_cost_per_ha_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0628\u06CC\u0645\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u062F\u0627\u0631\u0627\u06CC\u06CC",
    value: s.insurance_cost_pct_of_asset_value_per_year,
    onChange: v => set("insurance_cost_pct_of_asset_value_per_year", v),
    step: 0.1,
    min: 0,
    max: 100,
    inputId: "insurance_cost_pct_of_asset_value_per_year",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 1.2",
    error: errors.insurance_cost_pct_of_asset_value_per_year
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u0631 \u0633\u0648\u062F",
    value: s.tax_rate_pct,
    onChange: v => set("tax_rate_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    inputId: "tax_rate_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 0 \u06CC\u0627 10",
    error: errors.tax_rate_pct
  })), !simple && /*#__PURE__*/React.createElement(Section, {
    title: "\u06F5) \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u067E\u06CC\u0634\u0631\u0641\u062A\u0647 \u0633\u0627\u0645\u0627\u0646\u0647"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062E\u062F\u0645\u0627\u062A/\u0645\u062C\u0648\u0632/\u0637\u0631\u0627\u062D\u06CC",
    value: s.EPC_soft_cost_pct_of_capex,
    onChange: v => set("EPC_soft_cost_pct_of_capex", v),
    step: 0.5,
    min: 0,
    max: 50,
    required: !simple,
    inputId: "EPC_soft_cost_pct_of_capex",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 8",
    error: errors.EPC_soft_cost_pct_of_capex
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u06A9\u0627\u0647\u0634 \u0631\u0627\u0646\u062F\u0645\u0627\u0646 \u067E\u0646\u0644",
    value: s.annual_pv_degradation_pct,
    onChange: v => set("annual_pv_degradation_pct", v),
    step: 0.1,
    min: 0,
    max: 10,
    required: !simple,
    inputId: "annual_pv_degradation_pct",
    unit: "%/\u0633\u0627\u0644",
    helperText: "\u0645\u062B\u0627\u0644: 0.6",
    error: errors.annual_pv_degradation_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u06A9\u062B\u06CC\u0641\u06CC \u067E\u0646\u0644",
    value: s.soiling_loss_pct,
    onChange: v => set("soiling_loss_pct", v),
    step: 0.5,
    min: 0,
    max: 30,
    required: !simple,
    inputId: "soiling_loss_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 5 \u0628\u0631 \u0627\u0633\u0627\u0633 \u06AF\u0631\u062F \u0648 \u063A\u0628\u0627\u0631",
    error: errors.soiling_loss_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062F\u0633\u062A\u0631\u0633\u200C\u067E\u0630\u06CC\u0631\u06CC \u0633\u0627\u0645\u0627\u0646\u0647",
    value: s.availability_pct,
    onChange: v => set("availability_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    required: !simple,
    inputId: "availability_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 98",
    error: errors.availability_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u06A9\u0627\u0647\u0634 \u062A\u0648\u0644\u06CC\u062F",
    value: s.curtailment_pct,
    onChange: v => set("curtailment_pct", v),
    step: 0.5,
    min: 0,
    max: 100,
    inputId: "curtailment_pct",
    unit: "%",
    helperText: "\u0645\u062B\u0627\u0644: 0 \u062A\u0627 5",
    error: errors.curtailment_pct
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u06A9\u0631\u0628\u0646 \u062A\u0646\u06CC",
    value: s.carbon_credit_price_per_tCO2,
    onChange: v => set("carbon_credit_price_per_tCO2", v),
    step: 100000,
    min: 0,
    max: 10000000000,
    inputId: "carbon_credit_price_per_tCO2",
    unit: "\u0631\u06CC\u0627\u0644/\u062A\u0646 CO2",
    helperText: "\u0645\u062B\u0627\u0644: 2000000",
    error: errors.carbon_credit_price_per_tCO2
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u062C\u062A\u0646\u0627\u0628 CO2 \u0628\u0631 \u0645\u06AF\u0627\u0648\u0627\u062A\u0633\u0627\u0639\u062A",
    value: s.avoided_co2_t_per_MWh,
    onChange: v => set("avoided_co2_t_per_MWh", v),
    step: 0.01,
    min: 0,
    max: 5,
    inputId: "avoided_co2_t_per_MWh",
    unit: "\u062A\u0646 CO2/MWh",
    helperText: "\u0645\u062B\u0627\u0644: 0.55",
    error: errors.avoided_co2_t_per_MWh
  })), /*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
  }, "نتایج خلاصه"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full min-w-0"
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
  }))), /*#__PURE__*/React.createElement("div", {
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
  })()), /*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl overflow-x-auto"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-4"
  }, "جدول سال‌به‌سال"), /*#__PURE__*/React.createElement("table", {
    className: "w-full min-w-[640px] text-sm"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "text-gray-300"
  }, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-neutral-800"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "سال"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "برق (kWh)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "درآمد/صرفه‌جویی برق"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "خالص کشاورزی (قبل)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "خالص کشاورزی (با پنل)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "افزایشی"))), /*#__PURE__*/React.createElement("tbody", null, tableRows))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-xs text-gray-400"
  }, "* سال صفر شامل هزینه ساخت است و در جدول نیامده است."), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-400 pb-8"
  }, "نکته: برای دقت بیشتر، قیمت محصول و هزینه آب/برق را از فیش‌های اخیر خودتان وارد کنید. اگر خواستید، می‌توانیم نسخه روستایی/دهستانی با اعداد دقیق‌تری بسازیم." )]), shareModal));
  }
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("ریشه React پیدا نشد.");
    }
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(AgrivoltaicsKhorasan));
  } catch (err) {
    console.error("Agrivoltaics render failed", err);
    const fallbackTarget = document.getElementById('root') || document.body;
    if (fallbackTarget) {
      fallbackTarget.innerHTML = "";
      const message = document.createElement("div");
      message.className = "agri-error-fallback";
      message.dir = "rtl";
      message.textContent = "خطا در بارگذاری ماشین‌حساب. لطفاً صفحه را بازآوری کنید.";
      fallbackTarget.appendChild(message);
    }
  }
