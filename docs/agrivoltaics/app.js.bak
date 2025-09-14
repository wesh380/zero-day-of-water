const {
  useState,
  useMemo,
  useEffect
} = React;

// نسخه مخصوص استان خراسان رضوی (ساده برای کشاورزان)
// نکته: اعداد پیش‌فرض تقریبی هستند. لطفاً با شرایط واقعی زمین خودتان تنظیم کنید.

// اجزای کمکی ساده
const Section = ({
  title,
  children
}) => /*#__PURE__*/React.createElement("section", {
  className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl"
}, /*#__PURE__*/React.createElement("h2", {
  className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
}, children));
const NumberInput = ({
  label,
  value,
  onChange,
  step = 1
}) => /*#__PURE__*/React.createElement("label", {
  className: "flex flex-col gap-1 text-sm"
}, /*#__PURE__*/React.createElement("span", {
  className: "text-gray-200"
}, label), /*#__PURE__*/React.createElement("input", {
  dir: "ltr",
  type: "number",
  step: step,
  value: value,
  onChange: e => onChange(Number(e.target.value)),
  className: "w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-right text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
}));
const Select = ({
  label,
  value,
  onChange,
  options
}) => /*#__PURE__*/React.createElement("label", {
  className: "flex flex-col gap-1 text-sm"
}, /*#__PURE__*/React.createElement("span", {
  className: "text-gray-200"
}, label), /*#__PURE__*/React.createElement("select", {
  value: value,
  onChange: e => onChange(e.target.value),
  className: "w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-right text-gray-100"
}, options.map(o => /*#__PURE__*/React.createElement("option", {
  key: o.value,
  value: o.value
}, o.label))));
const KPI = ({
  title,
  value,
  sub
}) => /*#__PURE__*/React.createElement("div", {
  className: "rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4 shadow-xl"
}, /*#__PURE__*/React.createElement("div", {
  className: "text-gray-300 text-sm"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "text-xl md:text-2xl font-extrabold mt-1 text-emerald-400"
}, value), sub && /*#__PURE__*/React.createElement("div", {
  className: "text-xs text-gray-400 mt-1"
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
async function saveScenario(state, setShareLink) {
  const res = await fetch("/api/save-scenario", {
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
}
async function loadScenarioById(id, setState) {
  if (!id) return;
  const res = await fetch(`/api/get-scenario?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || "خواندن نشد؛ بعداً دوباره امتحان کن.");
    return;
  }
  const saved = await res.json();
  if (saved) setState(saved);
}
function AgrivoltaicsKhorasan() {
  const [simple, setSimple] = useState(true);
  const [shareLink, setShareLink] = React.useState("");

  // منطقه‌های پرتکرار استان (تقریبی)
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

  // محصولات رایج
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

  // آب و خاک
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

  // وضعیت ورودی‌ها
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
    el.innerHTML = qr.createSvgTag(6); // مقیاس
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
  const area = nz(s.project_area_ha);
  const years = Math.max(1, Math.floor(nz(s.time_horizon_years)));
  const capex_per_kWp_sub = nz(s.module_price_per_kWp) + nz(s.mounting_structure_cost_per_kWp) + nz(s.inverter_BOS_cost_per_kWp);
  const capex_kWp_with_soft = capex_per_kWp_sub * (1 + pct(s.EPC_soft_cost_pct_of_capex));
  const subsidy = capex_kWp_with_soft * pct(s.subsidy_capex_pct);
  const capex_total = Math.max(0, nz(s.pv_capacity_kWp_total) * (capex_kWp_with_soft - subsidy) + nz(s.grid_interconnection_lump_sum));
  const pv_om_annual = nz(s.pv_capacity_kWp_total) * nz(s.pv_om_cost_per_kWp_year);
  const insurance_annual = capex_total * pct(s.insurance_cost_pct_of_asset_value_per_year);
  const land_lease_annual = area * nz(s.land_lease_cost_per_ha_year);
  const ag_yield_baseline = nz(s.baseline_yield_t_per_ha) * area;
  const ag_rev_baseline = ag_yield_baseline * nz(s.crop_price_per_t);
  const ag_opex_baseline_total = area * nz(s.ag_opex_baseline_per_ha);
  const water_m3_base = area * nz(s.water_use_baseline_m3_per_ha);
  const water_cost_base = water_m3_base * nz(s.water_unit_cost);
  const irrigation_energy_base_kWh = water_m3_base * nz(s.energy_for_irrigation_kWh_per_m3);
  const irrigation_energy_cost_base = irrigation_energy_base_kWh * nz(s.irrigation_energy_tariff || 0);
  const yield_change = 1 + pct(s.expected_yield_change_pct_under_AGV) + pct(s.crop_quality_premium_or_discount_pct);
  const ag_yield_agv = nz(s.baseline_yield_t_per_ha) * area * yield_change;
  const ag_rev_agv = ag_yield_agv * nz(s.crop_price_per_t);
  const ag_opex_agv_total = area * nz(s.ag_opex_baseline_per_ha) * (1 + pct(s.ag_opex_change_under_AGV_pct));
  const water_m3_agv = water_m3_base * (1 + pct(s.water_use_change_under_AGV_pct));
  const water_cost_agv = water_m3_agv * nz(s.water_unit_cost);
  const irrigation_energy_agv_kWh = water_m3_agv * nz(s.energy_for_irrigation_kWh_per_m3);
  const irrigation_energy_cost_agv = irrigation_energy_agv_kWh * nz(s.irrigation_energy_tariff || 0);
  const net_yield_factor = (1 - pct(s.soiling_loss_pct)) * pct(s.availability_pct);
  const curtail = 1 - pct(s.curtailment_pct);
  const kWp = nz(s.pv_capacity_kWp_total);
  const annualPV = y => kWp * nz(s.specific_yield_kWh_per_kWp_year) * net_yield_factor * curtail * Math.pow(1 - pct(s.annual_pv_degradation_pct), y);
  const tariffEscal = y => Math.pow(1 + pct(s.tariff_escalation_pct_per_year), y);
  const elecRevenueYear = y => {
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
  const carbonRevenueYear = y => annualPV(y) / 1000 * nz(s.avoided_co2_t_per_MWh) * nz(s.carbon_credit_price_per_tCO2);
  const baselineAnnualNet = () => ag_rev_baseline - ag_opex_baseline_total - water_cost_base - irrigation_energy_cost_base - land_lease_annual;
  const agvAnnualNetBeforePV = () => ag_rev_agv - ag_opex_agv_total - water_cost_agv - irrigation_energy_cost_agv - land_lease_annual;
  const agvAnnualNet = y => agvAnnualNetBeforePV() + elecRevenueYear(y) + carbonRevenueYear(y) - pv_om_annual - insurance_annual;
  const cashflowsBaseline = Array.from({
    length: years
  }, () => baselineAnnualNet());
  const cashflowsAGV = Array.from({
    length: years
  }, (_, y) => agvAnnualNet(y));
  const cashflowsAGV_WithCapex = [-capex_total, ...cashflowsAGV];
  const cashflowsBaseline_ZeroCapex = [0, ...cashflowsBaseline];
  const cashflowsIncremental = cashflowsAGV_WithCapex.map((v, i) => v - (cashflowsBaseline_ZeroCapex[i] ?? 0));
  const npv = (ratePct, arr) => arr.reduce((acc, cf, i) => acc + cf / Math.pow(1 + ratePct / 100, i), 0);
  const irr = arr => {
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
  const NPV_incremental = npv(s.discount_rate_pct, cashflowsIncremental);
  const IRR_incremental = irr(cashflowsIncremental);
  const decisionText = () => {
    if (NPV_incremental > 0 && (IRR_incremental ?? 0) > s.discount_rate_pct / 100) return "به‌صرفه";
    if (Math.abs(NPV_incremental) < 0.05 * capex_total) return "تقریباً سر به سر";
    return "به‌صرفه نیست";
  };
  const totalPVkWhYear1 = annualPV(0);
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
      className: "rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-gray-300 text-sm mb-2"
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
      stroke: "#10b981",
      strokeWidth: "2"
    })));
  };
  const downloadCSV = () => {
    const rows = [["سال", "برق (kWh)", "درآمد/صرفه‌جویی برق", "خالص کشاورزی (قبل)", "خالص کشاورزی (با)", "افزایشی"]];
    for (let i = 0; i < years; i++) rows.push([i + 1, Math.round(annualPV(i)), Math.round(elecRevenueYear(i)), Math.round(cashflowsBaseline[i]), Math.round(cashflowsAGV[i]), Math.round(cashflowsIncremental[i + 1] ?? 0)]);
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
  return /*#__PURE__*/React.createElement("div", {
    dir: "rtl",
    className: "min-h-screen w-full bg-gradient-to-b from-neutral-950 to-neutral-900 text-gray-100 px-4 py-6 md:py-10 md:px-8"
  }, /*#__PURE__*/React.createElement("header", {
    className: "max-w-7xl mx-auto mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl md:text-3xl font-extrabold tracking-tight"
  }, "\u0645\u0627\u0634\u06CC\u0646\u200C\u062D\u0633\u0627\u0628 \u0641\u0648\u062A\u0648\u06A9\u0650\u0634\u062A \u2013 \u0648\u06CC\u0698\u0647 \u062E\u0631\u0627\u0633\u0627\u0646 \u0631\u0636\u0648\u06CC"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm md:text-base text-gray-300 mt-2"
  }, "\u0628\u0627 \u0686\u0646\u062F \u0648\u0631\u0648\u062F\u06CC \u0633\u0627\u062F\u0647 \u0628\u0628\u06CC\u0646\u06CC\u062F \u06A9\u0650\u0634\u062A \u0632\u06CC\u0631 \u067E\u0646\u0644 \u062E\u0648\u0631\u0634\u06CC\u062F\u06CC \u062F\u0631 \u0645\u0646\u0637\u0642\u0647 \u0634\u0645\u0627 \u0645\u06CC\u200C\u0635\u0631\u0641\u062F \u06CC\u0627 \u0646\u0647."), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 text-xs text-gray-400 space-y-1"
  }, /*#__PURE__*/React.createElement("div", null, "\u06F1) \u0645\u0646\u0637\u0642\u0647\u060C \u0645\u062D\u0635\u0648\u0644\u060C \u0622\u0628 \u0648 \u062E\u0627\u06A9 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F. \u0627\u0639\u062F\u0627\u062F \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0634\u0631\u0627\u06CC\u0637 \u0631\u0627\u06CC\u062C \u0627\u0633\u062A\u0627\u0646 \u067E\u0631 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F."), /*#__PURE__*/React.createElement("div", null, "\u06F2) \u0627\u06AF\u0631 \u0644\u0627\u0632\u0645 \u0628\u0648\u062F\u060C \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0648 \u0645\u0642\u0627\u062F\u06CC\u0631 \u0631\u0627 \u0628\u0627 \u0648\u0636\u0639\u06CC\u062A \u062E\u0648\u062F\u062A\u0627\u0646 \u0639\u0648\u0636 \u06A9\u0646\u06CC\u062F."), /*#__PURE__*/React.createElement("div", null, "\u06F3) \u0646\u062A\u06CC\u062C\u0647 \u0631\u0627 \u062F\u0631 \u06A9\u0627\u0631\u062A\u200C\u0647\u0627 \u0648 \u0646\u0645\u0648\u062F\u0627\u0631 \u0628\u0628\u06CC\u0646\u06CC\u062F. \u0627\u06AF\u0631 \xAB\u0627\u0631\u0632\u0634 \u0627\u0645\u0631\u0648\u0632\xBB \u0645\u062B\u0628\u062A \u0628\u0627\u0634\u062F\u060C \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0637\u0631\u062D \u062E\u0648\u0628 \u0627\u0633\u062A."))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white",
    onClick: () => setSimple(v => !v)
  }, "\u062D\u0627\u0644\u062A ", simple ? 'پیشرفته' : 'ساده'), /*#__PURE__*/React.createElement("button", {
    onClick: downloadCSV,
    className: "px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100"
  }, "\u062F\u0627\u0646\u0644\u0648\u062F CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: downloadPDF,
    className: "px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100"
  }, "\u062F\u0627\u0646\u0644\u0648\u062F PDF"), /*#__PURE__*/React.createElement("button", {
    onClick: () => saveScenario(s, setShareLink),
    className: "px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100"
  }, "\u0630\u062E\u06CC\u0631\u0647 \u0633\u0646\u0627\u0631\u06CC\u0648"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const id = prompt("کُد/لینک را وارد کنید:");
      const onlyId = (id || "").split("id=").pop();
      loadScenarioById(onlyId, setS);
    },
    className: "px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100"
  }, "\u0628\u0627\u0632\u06A9\u0631\u062F\u0646 \u0627\u0632 \u0644\u06CC\u0646\u06A9"))), /*#__PURE__*/React.createElement("main", {
    className: "max-w-7xl mx-auto space-y-6 md:space-y-8"
  }, /*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
  }, "\u06F0) \u0645\u0646\u0637\u0642\u0647 \u0648 \u0634\u0631\u0627\u06CC\u0637 \u0645\u062D\u0644\u06CC"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u0646\u0637\u0642\u0647",
    value: s.region,
    onChange: v => set("region", v),
    options: Object.entries(regions).map(([k, v]) => ({
      value: k,
      label: v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u062D\u0635\u0648\u0644",
    value: s.crop_type,
    onChange: v => set("crop_type", v),
    options: Object.keys(cropProfiles).map(k => ({
      value: k,
      label: k
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0645\u0646\u0628\u0639 \u0622\u0628",
    value: s.water_source,
    onChange: v => set("water_source", v),
    options: Object.entries(waterSources).map(([k, v]) => ({
      value: k,
      label: v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u06AF\u0631\u062F \u0648 \u063A\u0628\u0627\u0631",
    value: s.dust_level,
    onChange: v => set("dust_level", v),
    options: Object.entries(dustLevels).map(([k, v]) => ({
      value: k,
      label: v.title
    }))
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0646\u0648\u0639 \u062E\u0627\u06A9",
    value: s.soil_type,
    onChange: v => set("soil_type", v),
    options: Object.entries(soils).map(([k, v]) => ({
      value: k,
      label: v.title
    }))
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0634\u0648\u0631\u06CC \u0622\u0628/\u062E\u0627\u06A9 (EC dS/m)",
    value: s.salinity_EC,
    onChange: v => set("salinity_EC", v),
    step: 0.5
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400 mt-3"
  }, "* \u0627\u06AF\u0631 \u0645\u0646\u0637\u0642\u0647 \u062F\u0642\u06CC\u0642 \u0634\u0645\u0627 \u062F\u0631 \u0644\u06CC\u0633\u062A \u0646\u06CC\u0633\u062A\u060C \u0646\u0632\u062F\u06CC\u06A9\u200C\u062A\u0631\u06CC\u0646 \u0645\u0646\u0637\u0642\u0647 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F \u0648 \u0627\u0639\u062F\u0627\u062F \u0631\u0627 \u06A9\u0645\u06CC \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F.")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(KPI, {
    title: "\u0647\u0632\u06CC\u0646\u0647 \u0627\u0648\u0644\u06CC\u0647 \u0633\u0627\u062E\u062A",
    value: fmtMoney(capex_total),
    sub: "\u067E\u0646\u0644\u060C \u0633\u0627\u0632\u0647\u060C \u0627\u06CC\u0646\u0648\u0631\u062A\u0631\u060C \u0627\u062A\u0635\u0627\u0644"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "\u0628\u0631\u0642 \u0633\u0627\u0644 \u0627\u0648\u0644",
    value: `${fmt(totalPVkWhYear1)} kWh`,
    sub: "\u067E\u0633 \u0627\u0632 \u06A9\u062B\u06CC\u0641\u06CC/\u062E\u0631\u0627\u0628\u06CC"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "\u062F\u0631\u0622\u0645\u062F/\u0635\u0631\u0641\u0647\u200C\u062C\u0648\u06CC\u06CC \u0628\u0631\u0642 \u0633\u0627\u0644 \u0627\u0648\u0644",
    value: fmtMoney(elecRevenueYear(0)),
    sub: "\u0637\u0628\u0642 \u0637\u0631\u062D \u0627\u0646\u062A\u062E\u0627\u0628\u06CC"
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "\u0627\u0631\u0632\u0634 \u0627\u0645\u0631\u0648\u0632 \u0633\u0648\u062F",
    value: fmtMoney(npv(s.discount_rate_pct, cashflowsIncremental)),
    sub: `با نرخ ${s.discount_rate_pct}%`
  }), /*#__PURE__*/React.createElement(KPI, {
    title: "\u0633\u0648\u062F \u0633\u0627\u0644\u0627\u0646\u0647 \u062A\u0642\u0631\u06CC\u0628\u06CC",
    value: IRR_incremental == null ? 'نامشخص' : `${(IRR_incremental * 100).toFixed(1)} %`,
    sub: "\u0647\u0631\u0686\u0647 \u0628\u06CC\u0634\u062A\u0631\u060C \u0628\u0647\u062A\u0631"
  })), /*#__PURE__*/React.createElement("div", {
    className: `rounded-2xl p-4 border shadow-xl ${decisionText() === 'به‌صرفه' ? 'bg-emerald-900/30 border-emerald-700' : decisionText() === 'تقریباً سر به سر' ? 'bg-yellow-900/30 border-yellow-700' : 'bg-rose-900/30 border-rose-700'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm"
  }, "\u062E\u0644\u0627\u0635\u0647 \u062A\u0635\u0645\u06CC\u0645:"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-bold mt-1"
  }, decisionText()), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-300 mt-1"
  }, "\u0627\u06AF\u0631 \xAB\u0627\u0631\u0632\u0634 \u0627\u0645\u0631\u0648\u0632\xBB \u0645\u062B\u0628\u062A \u0628\u0627\u0634\u062F \u0648 \u0628\u0627\u0632\u06AF\u0634\u062A \u0633\u0631\u0645\u0627\u06CC\u0647 \u062F\u0631 \u0686\u0646\u062F \u0633\u0627\u0644 \u0627\u0648\u0644 \u0631\u062E \u062F\u0647\u062F\u060C \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0637\u0631\u062D \u0627\u0642\u062A\u0635\u0627\u062F\u06CC \u0627\u0633\u062A.")), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F1) \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0632\u0645\u06CC\u0646 \u0648 \u0645\u062D\u0635\u0648\u0644"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u0633\u0627\u062D\u062A \u0632\u0645\u06CC\u0646 (\u0647\u06A9\u062A\u0627\u0631)",
    value: s.project_area_ha,
    onChange: v => set("project_area_ha", v),
    step: 0.1
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0639\u0645\u0644\u06A9\u0631\u062F \u0641\u0639\u0644\u06CC (\u062A\u0646/\u0647\u06A9\u062A\u0627\u0631)",
    value: s.baseline_yield_t_per_ha,
    onChange: v => set("baseline_yield_t_per_ha", v),
    step: 0.1
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0639\u0645\u0644\u06A9\u0631\u062F \u0632\u06CC\u0631 \u067E\u0646\u0644 (%)",
    value: s.expected_yield_change_pct_under_AGV,
    onChange: v => set("expected_yield_change_pct_under_AGV", v),
    step: 0.5
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0641\u0631\u0648\u0634 \u0645\u062D\u0635\u0648\u0644 (\u0631\u06CC\u0627\u0644/\u062A\u0646)",
    value: s.crop_price_per_t,
    onChange: v => set("crop_price_per_t", v),
    step: 1000000
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (\u0631\u06CC\u0627\u0644/\u0647\u06A9\u062A\u0627\u0631)",
    value: s.ag_opex_baseline_per_ha,
    onChange: v => set("ag_opex_baseline_per_ha", v),
    step: 1000000
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0647\u0632\u06CC\u0646\u0647 \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (%)",
    value: s.ag_opex_change_under_AGV_pct,
    onChange: v => set("ag_opex_change_under_AGV_pct", v),
    step: 0.5
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0645\u0635\u0631\u0641 \u0622\u0628 \u0641\u0639\u0644\u06CC (m\xB3/\u0647\u06A9\u062A\u0627\u0631)",
    value: s.water_use_baseline_m3_per_ha,
    onChange: v => set("water_use_baseline_m3_per_ha", v),
    step: 10
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u063A\u06CC\u06CC\u0631 \u0645\u0635\u0631\u0641 \u0622\u0628 (%)",
    value: s.water_use_change_under_AGV_pct,
    onChange: v => set("water_use_change_under_AGV_pct", v),
    step: 1
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0634\u06CC\u0631\u06CC\u0646\u06CC/\u062A\u0644\u062E\u06CC \u0642\u06CC\u0645\u062A (\u06A9\u06CC\u0641\u06CC\u062A) (%)",
    value: s.crop_quality_premium_or_discount_pct,
    onChange: v => set("crop_quality_premium_or_discount_pct", v),
    step: 0.5
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F2) \u0622\u0628\u06CC\u0627\u0631\u06CC \u0648 \u0628\u0631\u0642 \u0645\u0632\u0631\u0639\u0647"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0628\u0631\u0642 \u067E\u0645\u067E\u0627\u0698 \u0622\u0628 (kWh \u0628\u0631\u0627\u06CC \u0647\u0631 m\xB3)",
    value: s.energy_for_irrigation_kWh_per_m3,
    onChange: v => set("energy_for_irrigation_kWh_per_m3", v),
    step: 0.01
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0628\u0631\u0642 \u0628\u0631\u0627\u06CC \u067E\u0645\u067E\u0627\u0698 (\u0631\u06CC\u0627\u0644/kWh)",
    value: s.irrigation_energy_tariff || 0,
    onChange: v => set("irrigation_energy_tariff", v),
    step: 50
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0622\u0628 \u062E\u0631\u06CC\u062F\u0627\u0631\u06CC\u200C\u0634\u062F\u0647 (\u0631\u06CC\u0627\u0644/m\xB3)",
    value: s.water_unit_cost,
    onChange: v => set("water_unit_cost", v),
    step: 100
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
    label: "\u0642\u06CC\u0645\u062A \u062A\u0636\u0645\u06CC\u0646\u06CC/\u0641\u0631\u0648\u0634 (\u0631\u06CC\u0627\u0644/kWh)",
    value: s.ppa_or_fit_tariff,
    onChange: v => set("ppa_or_fit_tariff", v),
    step: 50
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0633\u0647\u0645 \u0645\u0635\u0631\u0641 \u062F\u0631 \u0645\u0632\u0631\u0639\u0647 (%)",
    value: s.self_consumption_share_pct,
    onChange: v => set("self_consumption_share_pct", v),
    step: 1
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u062E\u0631\u06CC\u062F \u0627\u0632 \u0634\u0628\u06A9\u0647 (\u0631\u06CC\u0627\u0644/kWh)",
    value: s.net_metering_buy_price,
    onChange: v => set("net_metering_buy_price", v),
    step: 50
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u0641\u0631\u0648\u0634 \u0628\u0647 \u0634\u0628\u06A9\u0647 (\u0631\u06CC\u0627\u0644/kWh)",
    value: s.net_metering_sell_price,
    onChange: v => set("net_metering_sell_price", v),
    step: 50
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u06F3) \u0628\u0631\u0642 \u062E\u0648\u0631\u0634\u06CC\u062F\u06CC (\u0627\u0646\u062F\u0627\u0632\u0647 \u0648 \u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u062E\u062A)"
  }, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0638\u0631\u0641\u06CC\u062A \u06A9\u0644 \u0633\u0627\u0645\u0627\u0646\u0647 (kWp)",
    value: s.pv_capacity_kWp_total,
    onChange: v => set("pv_capacity_kWp_total", v)
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062A\u0648\u0644\u06CC\u062F \u0648\u06CC\u0698\u0647 \u0633\u0627\u0644\u0627\u0646\u0647 (kWh/kWp)",
    value: s.specific_yield_kWh_per_kWp_year,
    onChange: v => set("specific_yield_kWh_per_kWp_year", v),
    step: 10
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0642\u06CC\u0645\u062A \u067E\u0646\u0644 (\u0631\u06CC\u0627\u0644/kWp)",
    value: s.module_price_per_kWp,
    onChange: v => set("module_price_per_kWp", v),
    step: 1000000
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u0632\u0647 (\u0631\u06CC\u0627\u0644/kWp)",
    value: s.mounting_structure_cost_per_kWp,
    onChange: v => set("mounting_structure_cost_per_kWp", v),
    step: 1000000
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0627\u06CC\u0646\u0648\u0631\u062A\u0631 \u0648 \u06A9\u0627\u0628\u0644\u200C\u06A9\u0634\u06CC (\u0631\u06CC\u0627\u0644/kWp)",
    value: s.inverter_BOS_cost_per_kWp,
    onChange: v => set("inverter_BOS_cost_per_kWp", v),
    step: 1000000
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0647\u0632\u06CC\u0646\u0647 \u0627\u062A\u0635\u0627\u0644 \u0628\u0647 \u0634\u0628\u06A9\u0647 (\u06CC\u06A9\u062C\u0627)",
    value: s.grid_interconnection_lump_sum,
    onChange: v => set("grid_interconnection_lump_sum", v),
    step: 1000000
  }), !simple && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062E\u062F\u0645\u0627\u062A/\u0645\u062C\u0648\u0632/\u0637\u0631\u0627\u062D\u06CC (%)",
    value: s.EPC_soft_cost_pct_of_capex,
    onChange: v => set("EPC_soft_cost_pct_of_capex", v),
    step: 0.5
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u06A9\u0627\u0647\u0634 \u0631\u0627\u0646\u062F\u0645\u0627\u0646 \u067E\u0646\u0644 (% \u0633\u0627\u0644\u0627\u0646\u0647)",
    value: s.annual_pv_degradation_pct,
    onChange: v => set("annual_pv_degradation_pct", v),
    step: 0.1
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u06A9\u062B\u06CC\u0641\u06CC \u067E\u0646\u0644 (\u066A)",
    value: s.soiling_loss_pct,
    onChange: v => set("soiling_loss_pct", v),
    step: 0.5
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u062F\u0633\u062A\u0631\u0633\u200C\u067E\u0630\u06CC\u0631\u06CC \u0633\u0627\u0645\u0627\u0646\u0647 (\u066A)",
    value: s.availability_pct,
    onChange: v => set("availability_pct", v),
    step: 0.5
  }), /*#__PURE__*/React.createElement(NumberInput, {
    label: "\u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0633\u0627\u0644\u0627\u0646\u0647 (\u0631\u06CC\u0627\u0644/kWp)",
    value: s.pv_om_cost_per_kWp_year,
    onChange: v => set("pv_om_cost_per_kWp_year", v),
    step: 10000
  }))), /*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-3"
  }, "\u0646\u062A\u0627\u06CC\u062C \u062E\u0644\u0627\u0635\u0647"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
  }, /*#__PURE__*/React.createElement(KV, {
    k: "\u062F\u0631\u0622\u0645\u062F \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (\u0642\u0628\u0644 \u0627\u0632 \u067E\u0646\u0644)",
    v: fmtMoney(ag_rev_baseline)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u062F\u0631\u0622\u0645\u062F \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (\u0628\u0627 \u067E\u0646\u0644)",
    v: fmtMoney(ag_rev_agv)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0647\u0632\u06CC\u0646\u0647 \u0622\u0628 (\u0642\u0628\u0644)",
    v: fmtMoney(water_cost_base)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0647\u0632\u06CC\u0646\u0647 \u0622\u0628 (\u0628\u0627 \u067E\u0646\u0644)",
    v: fmtMoney(water_cost_agv)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0647\u0632\u06CC\u0646\u0647 \u0627\u0646\u0631\u0698\u06CC \u067E\u0645\u067E\u0627\u0698 (\u0642\u0628\u0644)",
    v: fmtMoney(irrigation_energy_cost_base)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0647\u0632\u06CC\u0646\u0647 \u0627\u0646\u0631\u0698\u06CC \u067E\u0645\u067E\u0627\u0698 (\u0628\u0627 \u067E\u0646\u0644)",
    v: fmtMoney(irrigation_energy_cost_agv)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u0633\u0627\u0644\u0627\u0646\u0647 \u0633\u0627\u0645\u0627\u0646\u0647 \u062E\u0648\u0631\u0634\u06CC\u062F\u06CC",
    v: fmtMoney(pv_om_annual)
  }), /*#__PURE__*/React.createElement(KV, {
    k: "\u0628\u06CC\u0645\u0647 \u0633\u0627\u0644\u0627\u0646\u0647",
    v: fmtMoney(insurance_annual)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement(Chart, {
    title: "\u062C\u0631\u06CC\u0627\u0646 \u0646\u0642\u062F\u06CC \u0627\u0641\u0632\u0627\u06CC\u0634\u06CC \u0647\u0631 \u0633\u0627\u0644",
    data: cashflowsIncremental.slice(1)
  }), (() => {
    const cum = [];
    let c = 0;
    for (let i = 0; i < cashflowsIncremental.length; i++) {
      c += cashflowsIncremental[i];
      cum.push(c);
    }
    return /*#__PURE__*/React.createElement(Chart, {
      title: "\u062C\u0645\u0639\u0650 \u062C\u0631\u06CC\u0627\u0646 \u0646\u0642\u062F\u06CC \u0627\u0632 \u0634\u0631\u0648\u0639 \u067E\u0631\u0648\u0698\u0647",
      data: cum
    });
  })()), /*#__PURE__*/React.createElement("section", {
    className: "bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl overflow-x-auto"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-emerald-400 text-base md:text-lg font-bold mb-4"
  }, "\u062C\u062F\u0648\u0644 \u0633\u0627\u0644\u200C\u0628\u0647\u200C\u0633\u0627\u0644"), /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "text-gray-300"
  }, /*#__PURE__*/React.createElement("tr", {
    className: "border-b border-neutral-800"
  }, /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u0633\u0627\u0644"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u0628\u0631\u0642 (kWh)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u062F\u0631\u0622\u0645\u062F/\u0635\u0631\u0641\u0647\u200C\u062C\u0648\u06CC\u06CC \u0628\u0631\u0642"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u062E\u0627\u0644\u0635 \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (\u0642\u0628\u0644)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u062E\u0627\u0644\u0635 \u06A9\u0634\u0627\u0648\u0631\u0632\u06CC (\u0628\u0627 \u067E\u0646\u0644)"), /*#__PURE__*/React.createElement("th", {
    className: "py-2 text-right"
  }, "\u0627\u0641\u0632\u0627\u06CC\u0634\u06CC"))), /*#__PURE__*/React.createElement("tbody", null, cashflowsAGV.map((_, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: "border-b border-neutral-900 hover:bg-neutral-900/40"
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, fmt(annualPV(i))), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, fmtMoney(elecRevenueYear(i) + carbonRevenueYear(i))), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, fmtMoney(cashflowsBaseline[i])), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, fmtMoney(cashflowsAGV[i])), /*#__PURE__*/React.createElement("td", {
    className: "py-2"
  }, fmtMoney(cashflowsIncremental[i + 1] ?? 0)))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-xs text-gray-400"
  }, "* \u0633\u0627\u0644 \u0635\u0641\u0631 \u0634\u0627\u0645\u0644 \u0647\u0632\u06CC\u0646\u0647 \u0633\u0627\u062E\u062A \u0627\u0633\u062A \u0648 \u062F\u0631 \u062C\u062F\u0648\u0644 \u0646\u06CC\u0627\u0645\u062F\u0647 \u0627\u0633\u062A.")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-400 pb-8"
  }, "\u0646\u06A9\u062A\u0647: \u0628\u0631\u0627\u06CC \u062F\u0642\u062A \u0628\u06CC\u0634\u062A\u0631\u060C \u0642\u06CC\u0645\u062A \u0645\u062D\u0635\u0648\u0644 \u0648 \u0647\u0632\u06CC\u0646\u0647 \u0622\u0628/\u0628\u0631\u0642 \u0631\u0627 \u0627\u0632 \u0641\u06CC\u0634\u200C\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631 \u062E\u0648\u062F\u062A\u0627\u0646 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F. \u0627\u06AF\u0631 \u062E\u0648\u0627\u0633\u062A\u06CC\u062F\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u0645 \u0646\u0633\u062E\u0647 \u0631\u0648\u0633\u062A\u0627\u06CC\u06CC/\u062F\u0647\u0633\u062A\u0627\u0646\u06CC \u0628\u0627 \u0627\u0639\u062F\u0627\u062F \u062F\u0642\u06CC\u0642\u200C\u062A\u0631\u06CC \u0628\u0633\u0627\u0632\u06CC\u0645.")), shareLink && /*#__PURE__*/React.createElement("div", {
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
  }, "\u0628\u0633\u062A\u0646")))));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AgrivoltaicsKhorasan));
