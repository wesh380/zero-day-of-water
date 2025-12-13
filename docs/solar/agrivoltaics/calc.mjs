const numericSeparators = /[,_\s]/g;

const parseNumeric = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const cleaned = value.replace(numericSeparators, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const clamp = (value, min, max) => {
  if (!Number.isFinite(value)) return value;
  let v = value;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
};

const pct = (value) => (Number.isFinite(value) ? value / 100 : 0);

export const presets = {
  regions: {
    mashhad: { title: "دشت مشهد / چناران", sun: 1675, heat: "med" },
    neyshabur: { title: "نیشابور / فیروزه", sun: 1680, heat: "med" },
    torbat: { title: "تربت‌حیدریه / زاوه / مه‌ولات / گناباد", sun: 1800, heat: "high" },
    sabzevar: { title: "سبزوار / بردسکن / کاشمر", sun: 1750, heat: "high" },
    quchan: { title: "قوچان / درگز / کلات", sun: 1625, heat: "low" },
    torbat_jam: { title: "تربت‌جم / تایباد / فریمان / خواف", sun: 1780, heat: "high" }
  },
  cropProfiles: {
    "زعفران": { baseYieldChange: 6, waterSaving: -28, price_per_t: 2000000000, yield_t_ha: 4 },
    "گندم": { baseYieldChange: -2, waterSaving: -10, price_per_t: 500000000, yield_t_ha: 5.5 },
    "جو": { baseYieldChange: -3, waterSaving: -10, price_per_t: 420000000, yield_t_ha: 4.5 },
    "پسته": { baseYieldChange: -3, waterSaving: -20, price_per_t: 1800000000, yield_t_ha: 1.0 },
    "انگور": { baseYieldChange: 1, waterSaving: -15, price_per_t: 250000000, yield_t_ha: 20 },
    "سبزیجات برگی": { baseYieldChange: 8, waterSaving: -30, price_per_t: 250000000, yield_t_ha: 20 },
    "طالبی/خربزه": { baseYieldChange: 2, waterSaving: -20, price_per_t: 180000000, yield_t_ha: 15 }
  },
  waterSources: {
    well_electric_subsidized: { title: "چاه – برق یارانه‌ای", elec_tariff: 1000, water_cost: 0 },
    well_electric_normal: { title: "چاه – برق معمولی", elec_tariff: 3000, water_cost: 0 },
    well_diesel: { title: "چاه – دیزلی", elec_tariff: 6000, water_cost: 0 },
    qanat: { title: "قنات / آب ثقلی", elec_tariff: 0, water_cost: 5000 },
    canal: { title: "کانال/شبکه آبیاری", elec_tariff: 0, water_cost: 20000 }
  },
  dustLevels: {
    low: { title: "گرد و غبار کم", soiling: 3 },
    med: { title: "گرد و غبار متوسط", soiling: 5 },
    high: { title: "گرد و غبار زیاد", soiling: 8 }
  },
  soils: {
    sandy: { title: "شنی", pump_kWh_m3: 0.45 },
    loam: { title: "لوم (میان‌دانه)", pump_kWh_m3: 0.5 },
    clay: { title: "رسی", pump_kWh_m3: 0.55 }
  }
};

export const defaultState = {
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
  energy_for_irrigation_kWh_per_m3: presets.soils["loam"].pump_kWh_m3,
  irrigation_energy_tariff: presets.waterSources["well_electric_subsidized"].elec_tariff,
  water_unit_cost: presets.waterSources["well_electric_subsidized"].water_cost,
  baseline_yield_t_per_ha: presets.cropProfiles["زعفران"].yield_t_ha,
  expected_yield_change_pct_under_AGV: presets.cropProfiles["زعفران"].baseYieldChange,
  crop_price_per_t: presets.cropProfiles["زعفران"].price_per_t,
  crop_quality_premium_or_discount_pct: 0,
  ag_opex_baseline_per_ha: 600000000,
  ag_opex_change_under_AGV_pct: -5,
  water_use_baseline_m3_per_ha: 6000,
  water_use_change_under_AGV_pct: presets.cropProfiles["زعفران"].waterSaving,
  pv_capacity_kWp_total: 150,
  module_price_per_kWp: 220000000,
  mounting_structure_cost_per_kWp: 70000000,
  inverter_BOS_cost_per_kWp: 60000000,
  grid_interconnection_lump_sum: 5000000000,
  EPC_soft_cost_pct_of_capex: 8,
  annual_pv_degradation_pct: 0.6,
  specific_yield_kWh_per_kWp_year: presets.regions["torbat"].sun,
  soiling_loss_pct: presets.dustLevels["med"].soiling,
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
};

const fieldRules = [
  { key: "salinity_EC", min: 0, max: 30, required: true },
  { key: "project_area_ha", min: 0.01, max: 1000, required: true, positive: true },
  { key: "time_horizon_years", min: 1, max: 50, required: true },
  { key: "discount_rate_pct", min: 0, max: 80, required: true },
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
  {
    key: "net_metering_buy_price",
    min: 0,
    max: 500000,
    requiredWhen: (ctx, simpleMode) => !simpleMode && (ctx.grid_scheme === "NetMetering" || ctx.grid_scheme === "SelfConsumption")
  },
  {
    key: "net_metering_sell_price",
    min: 0,
    max: 500000,
    requiredWhen: (ctx, simpleMode) => !simpleMode && ctx.grid_scheme === "NetMetering"
  },
  { key: "pv_capacity_kWp_total", min: 0.001, max: 1000000, required: true, positive: true },
  { key: "specific_yield_kWh_per_kWp_year", min: 0, max: 4000, required: true, positive: true },
  { key: "module_price_per_kWp", min: 0, max: 10000000000, required: true, positive: true },
  { key: "mounting_structure_cost_per_kWp", min: 0, max: 5000000000, required: true, positive: true },
  { key: "inverter_BOS_cost_per_kWp", min: 0, max: 5000000000, required: true, positive: true },
  { key: "grid_interconnection_lump_sum", min: 0, max: 100000000000, required: true, positive: true },
  { key: "EPC_soft_cost_pct_of_capex", min: 0, max: 50, requiredWhen: (_ctx, simpleMode) => !simpleMode },
  { key: "annual_pv_degradation_pct", min: 0, max: 10, requiredWhen: (_ctx, simpleMode) => !simpleMode },
  { key: "soiling_loss_pct", min: 0, max: 30, requiredWhen: (_ctx, simpleMode) => !simpleMode },
  { key: "availability_pct", min: 0, max: 100, requiredWhen: (_ctx, simpleMode) => !simpleMode },
  { key: "pv_om_cost_per_kWp_year", min: 0, max: 1000000000, required: true },
  { key: "curtailment_pct", min: 0, max: 80, required: false },
  { key: "tariff_escalation_pct_per_year", min: -10, max: 40, required: true },
  { key: "subsidy_capex_pct", min: 0, max: 100, required: false },
  { key: "carbon_credit_price_per_tCO2", min: 0, max: 1000000, required: false },
  { key: "avoided_co2_t_per_MWh", min: 0, max: 2, required: false },
  { key: "insurance_cost_pct_of_asset_value_per_year", min: 0, max: 25, required: false },
  { key: "land_lease_cost_per_ha_year", min: 0, max: 1000000000, required: false },
  { key: "tax_rate_pct", min: 0, max: 70, required: false }
];

export function sanitizeInputs(state = {}, simpleMode = true) {
  const context = { ...defaultState, ...state };
  const sanitized = { ...defaultState, ...state };
  const errors = {};

  for (const rule of fieldRules) {
    const requiredFlag = typeof rule.requiredWhen === "function" ? rule.requiredWhen(context, simpleMode) : rule.required !== false;
    const rawValue = state?.[rule.key] ?? sanitized[rule.key];
    const parsed = parseNumeric(rawValue);

    if (requiredFlag && (parsed === null || !Number.isFinite(parsed))) {
      errors[rule.key] = "این فیلد الزامی است";
      sanitized[rule.key] = null;
      continue;
    }

    if (!requiredFlag && (rawValue === undefined || rawValue === null || rawValue === "")) {
      sanitized[rule.key] = defaultState[rule.key] ?? null;
      continue;
    }

    if (rule.positive && parsed !== null && parsed <= 0) {
      errors[rule.key] = "مقدار باید بزرگ‌تر از صفر باشد";
      sanitized[rule.key] = parsed;
      continue;
    }

    let value = parsed;
    value = clamp(value, rule.min, rule.max);

    if (parsed !== null && Number.isFinite(parsed) && value !== parsed) {
      const min = rule.min ?? "";
      const max = rule.max ?? "";
      errors[rule.key] = `باید بین ${min} و ${max} باشد`;
    }

    sanitized[rule.key] = value;
  }

  return { valid: Object.keys(errors).length === 0, errors, values: sanitized };
}

export function validateInputs(state, simpleMode = true) {
  const { valid, errors } = sanitizeInputs(state, simpleMode);
  return { valid, errors };
}

export function calculateScenario(state, simpleMode = true) {
  const { valid, errors, values } = sanitizeInputs(state, simpleMode);
  if (!valid) {
    return { ok: false, ready: false, errors };
  }

  try {
    const years = Math.max(1, Math.floor(values.time_horizon_years));
    const area = values.project_area_ha;

    const capex_per_kWp_sub = values.module_price_per_kWp + values.mounting_structure_cost_per_kWp + values.inverter_BOS_cost_per_kWp;
    const capex_kWp_with_soft = capex_per_kWp_sub * (1 + pct(values.EPC_soft_cost_pct_of_capex));
    const subsidy = capex_kWp_with_soft * pct(values.subsidy_capex_pct);
    const capex_total = Math.max(0, values.pv_capacity_kWp_total * (capex_kWp_with_soft - subsidy) + values.grid_interconnection_lump_sum);

    const pv_om_annual = values.pv_capacity_kWp_total * values.pv_om_cost_per_kWp_year;
    const insurance_annual = capex_total * pct(values.insurance_cost_pct_of_asset_value_per_year);
    const land_lease_annual = area * values.land_lease_cost_per_ha_year;

    const ag_yield_baseline = values.baseline_yield_t_per_ha * area;
    const ag_rev_baseline = ag_yield_baseline * values.crop_price_per_t;
    const ag_opex_baseline_total = area * values.ag_opex_baseline_per_ha;
    const water_m3_base = area * values.water_use_baseline_m3_per_ha;
    const water_cost_base = water_m3_base * values.water_unit_cost;
    const irrigation_energy_base_kWh = water_m3_base * values.energy_for_irrigation_kWh_per_m3;
    const irrigation_energy_cost_base = irrigation_energy_base_kWh * values.irrigation_energy_tariff;

    const yield_change = 1 + pct(values.expected_yield_change_pct_under_AGV) + pct(values.crop_quality_premium_or_discount_pct);
    const ag_yield_agv = values.baseline_yield_t_per_ha * area * yield_change;
    const ag_rev_agv = ag_yield_agv * values.crop_price_per_t;
    const ag_opex_agv_total = area * values.ag_opex_baseline_per_ha * (1 + pct(values.ag_opex_change_under_AGV_pct));

    const water_m3_agv = water_m3_base * (1 + pct(values.water_use_change_under_AGV_pct));
    const water_cost_agv = water_m3_agv * values.water_unit_cost;
    const irrigation_energy_agv_kWh = water_m3_agv * values.energy_for_irrigation_kWh_per_m3;
    const irrigation_energy_cost_agv = irrigation_energy_agv_kWh * values.irrigation_energy_tariff;

    const net_yield_factor = (1 - pct(values.soiling_loss_pct)) * pct(values.availability_pct);
    const curtail = 1 - pct(values.curtailment_pct);
    const kWp = values.pv_capacity_kWp_total;

    const annualPV = (y) => kWp * values.specific_yield_kWh_per_kWp_year * net_yield_factor * curtail * Math.pow(1 - pct(values.annual_pv_degradation_pct), y);
    const tariffEscal = (y) => Math.pow(1 + pct(values.tariff_escalation_pct_per_year), y);

    const elecRevenueYear = (y) => {
      const kWh = annualPV(y);
      const scheme = values.grid_scheme;
      if (scheme === "PPA/FIT") return kWh * values.ppa_or_fit_tariff * tariffEscal(y);
      if (scheme === "SelfConsumption") {
        const selfShare = Math.max(0, Math.min(1, pct(values.self_consumption_share_pct)));
        const self_kWh = kWh * selfShare;
        return self_kWh * values.net_metering_buy_price * tariffEscal(y);
      }
      const selfShare = Math.max(0, Math.min(1, pct(values.self_consumption_share_pct)));
      const self_kWh = kWh * selfShare;
      const export_kWh = kWh * (1 - selfShare);
      const avoided = self_kWh * values.net_metering_buy_price * tariffEscal(y);
      const sold = export_kWh * values.net_metering_sell_price * tariffEscal(y);
      return avoided + sold;
    };

    const carbonRevenueYear = (y) => annualPV(y) / 1000 * values.avoided_co2_t_per_MWh * values.carbon_credit_price_per_tCO2;
    const baselineAnnualNet = () => ag_rev_baseline - ag_opex_baseline_total - water_cost_base - irrigation_energy_cost_base - land_lease_annual;
    const agvAnnualNetBeforePV = () => ag_rev_agv - ag_opex_agv_total - water_cost_agv - irrigation_energy_cost_agv - land_lease_annual;
    const agvAnnualNet = (y) => agvAnnualNetBeforePV() + elecRevenueYear(y) + carbonRevenueYear(y) - pv_om_annual - insurance_annual;

    const cashflowsBaseline = Array.from({ length: years }, () => baselineAnnualNet());
    const cashflowsAGV = Array.from({ length: years }, (_, y) => agvAnnualNet(y));
    const cashflowsAGV_WithCapex = [-capex_total, ...cashflowsAGV];
    const cashflowsBaseline_ZeroCapex = [0, ...cashflowsBaseline];
    const cashflowsIncremental = cashflowsAGV_WithCapex.map((v, i) => v - (cashflowsBaseline_ZeroCapex[i] ?? 0));

    const npv = (ratePct, arr) => arr.reduce((acc, cf, i) => acc + cf / Math.pow(1 + ratePct / 100, i), 0);
    const irr = (arr) => {
      let lo = -0.9;
      let hi = 1.0;
      const f = (r) => arr.reduce((a, c, i) => a + c / Math.pow(1 + r, i), 0);
      let flo = f(lo);
      let fhi = f(hi);
      if (isNaN(flo) || isNaN(fhi) || flo * fhi > 0) return null;
      for (let k = 0; k < 80; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
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

    const NPV_incremental = npv(values.discount_rate_pct, cashflowsIncremental);
    const IRR_incremental = irr(cashflowsIncremental);

    const decisionText = () => {
      if (NPV_incremental > 0 && (IRR_incremental ?? 0) > values.discount_rate_pct / 100) return "به‌صرفه";
      if (Math.abs(NPV_incremental) < 0.05 * capex_total) return "تقریباً سر به سر";
      return "به‌صرفه نیست";
    };

    const annualPVSeries = Array.from({ length: years }, (_, i) => annualPV(i));
    const elecRevenueSeries = Array.from({ length: years }, (_, i) => elecRevenueYear(i));
    const carbonRevenueSeries = Array.from({ length: years }, (_, i) => carbonRevenueYear(i));

    const numericCollections = [
      capex_total,
      annualPVSeries,
      elecRevenueSeries,
      carbonRevenueSeries,
      cashflowsIncremental,
      cashflowsAGV,
      cashflowsBaseline,
      NPV_incremental,
      values.specific_yield_kWh_per_kWp_year,
      values.pv_capacity_kWp_total
    ];

    const hasInvalid = numericCollections.some((item) => Array.isArray(item)
      ? item.some((v) => !Number.isFinite(v))
      : !Number.isFinite(item));

    if (hasInvalid) {
      return {
        ok: false,
        ready: false,
        errors: { ...errors, _global: "مقادیر ورودی باعث عدد نامعتبر شد؛ لطفاً بازه ورودی‌ها را بررسی کنید." }
      };
    }

    return {
      ok: true,
      ready: true,
      errors,
      capex_total,
      totalPVkWhYear1: annualPVSeries[0] ?? 0,
      elecRevenueYear0: elecRevenueSeries[0] ?? 0,
      npv_incremental: NPV_incremental,
      irr_incremental: IRR_incremental,
      decision: decisionText(),
      cashflowsIncremental,
      cashflowsAGV,
      cashflowsBaseline,
      annualPVSeries,
      elecRevenueSeries,
      carbonRevenueSeries,
      agvAnnualNetYear1: agvAnnualNet(0),
      baselineAnnualNetYear1: baselineAnnualNet(),
      years,
      agvAnnualNetBeforePV: agvAnnualNetBeforePV(),
      meta: {
        area,
        yield_change,
        water_m3_base,
        water_m3_agv,
        ag_rev_baseline,
        ag_rev_agv
      }
    };
  } catch (err) {
    return {
      ok: false,
      ready: false,
      errors: { ...errors, _global: "مشکلی در محاسبه پیش آمد. لطفاً ورودی‌ها را بررسی کنید." }
    };
  }
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fa-IR").format(Math.round(value));
}
