import { apiFetch, getBaseUrl } from "/assets/js/api.js";
import { fixTitles } from "/assets/js/encoding.js";
import { calculateScenario, defaultState, formatNumber, presets, validateInputs } from "./calc.mjs";

void getBaseUrl();

const { useEffect, useMemo, useRef, useState } = React;

const Spinner = ({ size = 16 }) => /*#__PURE__*/React.createElement("span", {
  className: "inline-block animate-spin rounded-full border-2 border-white/70 border-t-transparent",
  style: { width: size, height: size }
});

const trackEvent = (name, payload = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
};

const formatMoney = (value, currency = "ریال") => `${formatNumber(value)} ${currency}`;

const numberWithUnit = (value, unit) => `${formatNumber(value)} ${unit}`;

const InputField = ({
  label,
  value,
  onChange,
  type = "number",
  step = 1,
  min,
  max,
  required,
  inputId,
  error,
  unit,
  tooltip,
  placeholder
}) => {
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hasError = Boolean(error);
  return /*#__PURE__*/React.createElement("label", {
    className: "flex flex-col gap-1 text-sm md:text-base"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-gray-900"
  }, /*#__PURE__*/React.createElement("span", null, label, unit ? ` (${unit})` : ""), tooltip && /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full",
    title: tooltip
  }, "؟")), /*#__PURE__*/React.createElement("input", {
    id: inputId,
    dir: "ltr",
    type: type,
    step: step,
    min: min,
    max: max,
    required: required,
    value: value ?? "",
    placeholder: placeholder,
    onChange: e => {
      const raw = e.target.value;
      onChange(type === "number" ? raw === "" ? null : Number(raw) : raw);
    },
    "aria-invalid": hasError ? "true" : undefined,
    "aria-describedby": errorId,
    className: `w-full rounded-xl border px-3 py-2 text-right bg-slate-50 text-slate-900 shadow-sm placeholder:text-slate-500 selection:bg-emerald-600 selection:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 ${hasError ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'}`
  }), /*#__PURE__*/React.createElement("div", {
    id: errorId,
    className: "text-red-500 text-xs min-h-[1rem]"
  }, error || ""));
};

const SelectField = ({ label, value, onChange, options, inputId }) => /*#__PURE__*/React.createElement("label", {
  className: "flex flex-col gap-1 text-sm md:text-base"
}, /*#__PURE__*/React.createElement("span", {
  className: "text-gray-900"
}, label), /*#__PURE__*/React.createElement("select", {
  id: inputId,
  value: value,
  onChange: e => onChange(e.target.value),
  className: "w-full rounded-xl border border-gray-200 px-3 py-2 bg-slate-50 text-slate-900 shadow-sm selection:bg-emerald-600 selection:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
}, options.map(o => /*#__PURE__*/React.createElement("option", {
  key: o.value,
  value: o.value
}, o.label))));

const Card = ({ children, className = "" }) => /*#__PURE__*/React.createElement("div", {
  className: `rounded-2xl border border-gray-200 bg-white/90 backdrop-blur shadow-lg ${className}`
}, children);

const SectionShell = ({ title, subtitle, children }) => /*#__PURE__*/React.createElement("section", {
  className: "rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 md:p-8 space-y-4"
}, /*#__PURE__*/React.createElement("div", {
  className: "space-y-1"
}, /*#__PURE__*/React.createElement("h2", {
  className: "text-xl md:text-2xl font-black text-emerald-800"
}, title), subtitle && /*#__PURE__*/React.createElement("p", {
  className: "text-sm md:text-base text-emerald-900/80"
}, subtitle)), children);

const ResultCard = ({ tone = "success", title, value, desc }) => {
  const toneMap = {
    success: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    danger: "border-rose-200 bg-rose-50"
  };
  return /*#__PURE__*/React.createElement(Card, {
    className: `${toneMap[tone] || toneMap.success} p-4 flex flex-col gap-1`
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-gray-700"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-extrabold text-gray-900"
  }, value), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700 leading-6"
  }, desc));
};

const MiniChart = ({ series, title }) => {
  const w = 280;
  const h = 140;
  const pad = 22;
  if (!series?.length) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const scaleX = i => pad + i * (w - 2 * pad) / Math.max(1, series.length - 1);
  const scaleY = v => {
    if (max === min) return h / 2;
    return h - pad - (v - min) * (h - 2 * pad) / (max - min);
  };
  const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
  const zeroY = scaleY(0);
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-700 mb-2"
  }, title), /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    className: "w-full"
  }, /*#__PURE__*/React.createElement("line", {
    x1: pad,
    y1: zeroY,
    x2: w - pad,
    y2: zeroY,
    stroke: "#d4d4d8",
    strokeDasharray: "4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: path,
    fill: "none",
    stroke: "#10b981",
    strokeWidth: "2"
  })));
};

const PaybackLabel = ({ cashflows }) => {
  if (!cashflows?.length) return "نامشخص";
  let cumulative = 0;
  for (let i = 0; i < cashflows.length; i++) {
    cumulative += cashflows[i];
    if (cumulative >= 0) return `${i} تا ${i + 1} سال`;
  }
  return "بیش از افق زمانی";
};

function FAQSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "فتوکشت چیست؟",
        "acceptedAnswer": { "@type": "Answer", "text": "نصب سازه و پنل خورشیدی بالای زمین کشاورزی به‌طوری که هم محصول رشد کند و هم برق تولید شود." }
      },
      {
        "@type": "Question",
        "name": "تأثیر بر عملکرد محصول چیست؟",
        "acceptedAnswer": { "@type": "Answer", "text": "بسته به نوع محصول، سایه می‌تواند افت یا بهبود عملکرد ایجاد کند؛ در محاسبه امکان تنظیم درصد تغییر عملکرد وجود دارد." }
      },
      {
        "@type": "Question",
        "name": "مجوز و اتصال به شبکه چگونه است؟",
        "acceptedAnswer": { "@type": "Answer", "text": "می‌توانید فروش تضمینی، تراز با شبکه یا مصرف در مزرعه را انتخاب کنید؛ هزینه اتصال شبکه در بخش هزینه‌ها دیده شده است." }
      },
      {
        "@type": "Question",
        "name": "برای چه زمین‌هایی مناسب است؟",
        "acceptedAnswer": { "@type": "Answer", "text": "زمین‌های دارای تابش خوب، دسترسی به شبکه یا نیاز به برق پمپاژ و محصولات مقاوم به سایه گزینه‌های مناسب هستند." }
      }
    ]
  };
  return /*#__PURE__*/React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(json) }
  });
}

function AgrivoltaicsApp() {
  const [state, setState] = useState(defaultState);
  const [simpleMode, setSimpleMode] = useState(true);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [sensitivity, setSensitivity] = useState({ tariff: 0, capex: 0, yieldDelta: 0 });
  const stickyRef = useRef(null);
  const resultRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    [presets.regions, presets.cropProfiles, presets.waterSources, presets.dustLevels, presets.soils].forEach(obj => fixTitles(obj));
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;
    apiFetch(`/api/get-scenario?id=${encodeURIComponent(id)}`).then(res => res.json()).then(data => {
      if (data) setState(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setShowSticky(!entry.isIntersecting));
    }, { threshold: 0.3 });
    if (resultRef.current) observer.observe(resultRef.current);
    return () => observer.disconnect();
  }, [resultRef.current]);

  const updateState = (key, value) => setState(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const reg = presets.regions[state.region];
    const crop = presets.cropProfiles[state.crop_type];
    const dust = presets.dustLevels[state.dust_level];
    const src = presets.waterSources[state.water_source];
    const soil = presets.soils[state.soil_type];

    setState(prev => ({
      ...prev,
      specific_yield_kWh_per_kWp_year: reg?.sun ?? prev.specific_yield_kWh_per_kWp_year,
      soiling_loss_pct: dust?.soiling ?? prev.soiling_loss_pct,
      irrigation_energy_tariff: src?.elec_tariff ?? prev.irrigation_energy_tariff,
      water_unit_cost: src?.water_cost ?? prev.water_unit_cost,
      energy_for_irrigation_kWh_per_m3: soil?.pump_kWh_m3 ?? prev.energy_for_irrigation_kWh_per_m3,
      expected_yield_change_pct_under_AGV: crop?.baseYieldChange ?? prev.expected_yield_change_pct_under_AGV,
      baseline_yield_t_per_ha: crop?.yield_t_ha ?? prev.baseline_yield_t_per_ha,
      water_use_change_under_AGV_pct: crop?.waterSaving ?? prev.water_use_change_under_AGV_pct,
      crop_price_per_t: crop?.price_per_t ?? prev.crop_price_per_t
    }));
  }, [state.region, state.crop_type, state.water_source, state.dust_level, state.soil_type]);

  const result = useMemo(() => calculateScenario(state, simpleMode), [state, simpleMode]);
  const ready = result.ok && result.ready;

  const validation = useMemo(() => validateInputs(state, simpleMode), [state, simpleMode]);

  useEffect(() => {
    setErrors(validation.errors || {});
  }, [validation]);

  const resetInputs = () => {
    setState(defaultState);
    setErrors({});
    setGlobalError("");
    setStep(1);
    trackEvent("agro_calc_reset", { reason: "manual" });
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    try {
      if (!validation.valid) {
        setGlobalError("ابتدا خطاهای فرم را برطرف کنید.");
        trackEvent("agro_calc_error", { reason: "invalid_input" });
        return;
      }

      if (!ready) {
        setGlobalError(result.errors?._global || "مشکلی در محاسبه پیش آمد. لطفاً ورودی‌ها را بررسی کنید.");
        trackEvent("agro_calc_error", { reason: "calc_invalid" });
        return;
      }

      setGlobalError("");
      trackEvent("agro_calc_start", { simple: simpleMode ? "simple" : "advanced" });
      setStep(3);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setGlobalError("مشکلی در محاسبه پیش آمد. لطفاً ورودی‌ها را بررسی کنید.");
      trackEvent("agro_calc_error", { reason: "exception" });
    } finally {
      setIsCalculating(false);
    }
  };

  const toggleMode = () => {
    setSimpleMode(prev => {
      const next = !prev;
      trackEvent("agro_calc_toggle_mode", { mode: next ? "simple" : "advanced" });
      return next;
    });
    setGlobalError("");
  };

  const sensitivityState = useMemo(() => ({
    ...state,
    ppa_or_fit_tariff: state.ppa_or_fit_tariff * (1 + sensitivity.tariff / 100),
    module_price_per_kWp: state.module_price_per_kWp * (1 + sensitivity.capex / 100),
    expected_yield_change_pct_under_AGV: state.expected_yield_change_pct_under_AGV + sensitivity.yieldDelta
  }), [state, sensitivity]);

  const sensitivityResult = useMemo(() => calculateScenario(sensitivityState, simpleMode), [sensitivityState, simpleMode]);
  const sensitivityReady = sensitivityResult.ok && sensitivityResult.ready;

  const downloadCSV = () => {
    if (!ready) {
      setGlobalError("ابتدا ورودی‌ها را کامل کنید.");
      return;
    }
    const rows = [["سال", "برق (kWh)", "درآمد/صرفه‌جویی برق", "خالص کشاورزی (قبل)", "خالص کشاورزی (با)", "افزایشی"]];
    for (let i = 0; i < result.years; i++) rows.push([i + 1, Math.round(result.annualPVSeries[i]), Math.round(result.elecRevenueSeries[i]), Math.round(result.cashflowsBaseline[i]), Math.round(result.cashflowsAGV[i]), Math.round(result.cashflowsIncremental[i + 1] ?? 0)]);
    const assumptions = Object.entries(state).map(([k, v]) => `${k}: ${v}`).join("\n");
    rows.push(["فرضیات", assumptions]);
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrivoltaics_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("agro_calc_download", { format: "csv" });
  };

  const downloadPDF = () => {
    if (!ready) {
      setGlobalError("ابتدا ورودی‌ها را کامل کنید.");
      return;
    }
    if (!window.jspdf) {
      alert("تولید PDF در دسترس نیست.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("گزارش فوتوکِشت", 40, 40);
    doc.setFontSize(11);
    doc.text(`مساحت: ${state.project_area_ha} هکتار`, 40, 60);
    doc.text(`هزینه اولیه: ${formatMoney(result.capex_total, state.currency)}`, 40, 80);
    doc.text(`برق سال اول: ${formatNumber(result.totalPVkWhYear1)} kWh`, 40, 100);
    doc.text(`درآمد/صرفه‌جویی سال اول: ${formatMoney(result.elecRevenueYear0, state.currency)}`, 40, 120);
    doc.text(`NPV افزایشی: ${formatMoney(result.npv_incremental, state.currency)}`, 40, 140);
    doc.text(`نتیجه: ${result.decision}`, 40, 160);
    doc.text("فرضیات کلیدی:", 40, 190);
    const assumptions = [
      `بازار برق: ${state.grid_scheme}`,
      `قیمت فروش تضمینی/مصرف: ${state.ppa_or_fit_tariff}`,
      `هزینه ساخت هر کیلووات: ${formatMoney(state.module_price_per_kWp + state.mounting_structure_cost_per_kWp + state.inverter_BOS_cost_per_kWp, state.currency)}`,
      `کاهش/افزایش عملکرد محصول: ${state.expected_yield_change_pct_under_AGV}%`
    ];
    let y = 210;
    assumptions.forEach(line => { doc.text(line, 50, y); y += 16; });
    doc.save("agrivoltaics-report.pdf");
    trackEvent("agro_calc_download", { format: "pdf" });
  };

  const saveScenario = async () => {
    try {
      const res = await apiFetch("/api/save-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state })
      });
      if (!res.ok) throw new Error("save failed");
      const { id } = await res.json();
      const share = `${location.origin}${location.pathname}?id=${encodeURIComponent(id)}`;
      setShareLink(share);
    } catch (err) {
      alert("ذخیره نشد؛ بعداً امتحان کنید.");
    }
  };

  const decisionTone = result.decision === "به‌صرفه" ? "success" : result.decision === "تقریباً سر به سر" ? "warn" : "danger";

  const renderGroup = (title, fields) => /*#__PURE__*/React.createElement(Card, {
    className: "p-4 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base md:text-lg font-bold text-gray-900"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-gray-500"
  }, "همه اعداد با واحد")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, fields));

  const wizardNav = /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 text-sm font-semibold text-emerald-800"
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStep(n),
    className: `flex items-center gap-2 px-3 py-2 rounded-xl border ${step === n ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-emerald-200 text-emerald-700'} shadow-sm transition`
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/40 border border-white/60"
  }, n), n === 1 ? "اطلاعات پایه" : n === 2 ? "برق و پنل" : "نتیجه")));

  const stepOne = /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, renderGroup("زمین و محصول", [/*#__PURE__*/React.createElement(SelectField, {
    key: "region",
    label: "منطقه",
    value: state.region,
    onChange: v => updateState("region", v),
    options: Object.entries(presets.regions).map(([value, obj]) => ({ value, label: obj.title })),
    inputId: "region"
  }), /*#__PURE__*/React.createElement(SelectField, {
    key: "crop",
    label: "محصول",
    value: state.crop_type,
    onChange: v => updateState("crop_type", v),
    options: Object.keys(presets.cropProfiles).map(value => ({ value, label: value })),
    inputId: "crop"
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "area",
    label: "مساحت مزرعه",
    value: state.project_area_ha,
    onChange: v => updateState("project_area_ha", v),
    min: 0,
    step: 0.1,
    unit: "هکتار",
    required: true,
    inputId: "project_area_ha",
    error: errors.project_area_ha,
    tooltip: "مثال: 1.5 هکتار"
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "salinity",
    label: "شوری خاک/آب",
    value: state.salinity_EC,
    onChange: v => updateState("salinity_EC", v),
    step: 0.1,
    min: 0,
    max: 30,
    unit: "dS/m",
    inputId: "salinity_EC",
    error: errors.salinity_EC,
    tooltip: "EC بین 0 تا 30"
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "baseline_yield_t_per_ha",
    label: "عملکرد فعلی محصول",
    value: state.baseline_yield_t_per_ha,
    onChange: v => updateState("baseline_yield_t_per_ha", v),
    min: 0,
    max: 30,
    step: 0.1,
    unit: "تن/هکتار",
    inputId: "baseline_yield_t_per_ha",
    error: errors.baseline_yield_t_per_ha
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "expected_yield_change_pct_under_AGV",
    label: "تغییر عملکرد زیر پنل",
    value: state.expected_yield_change_pct_under_AGV,
    onChange: v => updateState("expected_yield_change_pct_under_AGV", v),
    min: -100,
    max: 200,
    step: 1,
    unit: "%",
    inputId: "expected_yield_change_pct_under_AGV",
    error: errors.expected_yield_change_pct_under_AGV,
    tooltip: "مثال: -10 برای کاهش"
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "crop_price_per_t",
    label: "قیمت فروش محصول",
    value: state.crop_price_per_t,
    onChange: v => updateState("crop_price_per_t", v),
    step: 1000000,
    min: 0,
    unit: "ریال/تن",
    inputId: "crop_price_per_t",
    error: errors.crop_price_per_t
  })]));

  const stepTwo = /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, renderGroup("آب و آبیاری", [/*#__PURE__*/React.createElement(SelectField, {
    key: "water",
    label: "منبع آب",
    value: state.water_source,
    onChange: v => updateState("water_source", v),
    options: Object.entries(presets.waterSources).map(([value, obj]) => ({ value, label: obj.title }))
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "water_use_baseline_m3_per_ha",
    label: "مصرف آب فعلی",
    value: state.water_use_baseline_m3_per_ha,
    onChange: v => updateState("water_use_baseline_m3_per_ha", v),
    step: 10,
    min: 0,
    unit: "مترمکعب/هکتار",
    inputId: "water_use_baseline_m3_per_ha",
    error: errors.water_use_baseline_m3_per_ha
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "water_use_change_under_AGV_pct",
    label: "تغییر مصرف آب",
    value: state.water_use_change_under_AGV_pct,
    onChange: v => updateState("water_use_change_under_AGV_pct", v),
    step: 1,
    min: -100,
    max: 200,
    unit: "%",
    inputId: "water_use_change_under_AGV_pct",
    error: errors.water_use_change_under_AGV_pct
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "irrigation_energy_tariff",
    label: "قیمت برق پمپاژ",
    value: state.irrigation_energy_tariff,
    onChange: v => updateState("irrigation_energy_tariff", v),
    step: 50,
    min: 0,
    unit: "ریال/kWh",
    inputId: "irrigation_energy_tariff",
    error: errors.irrigation_energy_tariff
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "water_unit_cost",
    label: "قیمت آب خریداری‌شده",
    value: state.water_unit_cost,
    onChange: v => updateState("water_unit_cost", v),
    step: 100,
    min: 0,
    unit: "ریال/m3",
    inputId: "water_unit_cost",
    error: errors.water_unit_cost
  })]), renderGroup("برق و فروش", [/*#__PURE__*/React.createElement(InputField, {
    key: "pv_capacity_kWp_total",
    label: "ظرفیت پنل",
    value: state.pv_capacity_kWp_total,
    onChange: v => updateState("pv_capacity_kWp_total", v),
    min: 0,
    unit: "kWp",
    inputId: "pv_capacity_kWp_total",
    error: errors.pv_capacity_kWp_total
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "specific_yield_kWh_per_kWp_year",
    label: "بهره انرژی",
    value: state.specific_yield_kWh_per_kWp_year,
    onChange: v => updateState("specific_yield_kWh_per_kWp_year", v),
    min: 0,
    unit: "kWh/kWp-سال",
    inputId: "specific_yield_kWh_per_kWp_year",
    error: errors.specific_yield_kWh_per_kWp_year
  }), /*#__PURE__*/React.createElement(SelectField, {
    key: "grid_scheme",
    label: "طرح فروش/مصرف",
    value: state.grid_scheme,
    onChange: v => updateState("grid_scheme", v),
    options: [{ value: "PPA/FIT", label: "فروش تضمینی" }, { value: "NetMetering", label: "تراز با شبکه" }, { value: "SelfConsumption", label: "مصرف مزرعه" }]
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "ppa_or_fit_tariff",
    label: "قیمت فروش برق",
    value: state.ppa_or_fit_tariff,
    onChange: v => updateState("ppa_or_fit_tariff", v),
    step: 50,
    min: 0,
    unit: "ریال/kWh",
    inputId: "ppa_or_fit_tariff",
    error: errors.ppa_or_fit_tariff
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "self_consumption_share_pct",
    label: "سهم مصرف محلی",
    value: state.self_consumption_share_pct,
    onChange: v => updateState("self_consumption_share_pct", v),
    step: 1,
    min: 0,
    max: 100,
    unit: "%",
    inputId: "self_consumption_share_pct",
    error: errors.self_consumption_share_pct
  }), !simpleMode && /*#__PURE__*/React.createElement(InputField, {
    key: "net_metering_sell_price",
    label: "قیمت فروش به شبکه",
    value: state.net_metering_sell_price,
    onChange: v => updateState("net_metering_sell_price", v),
    step: 50,
    min: 0,
    unit: "ریال/kWh",
    inputId: "net_metering_sell_price",
    error: errors.net_metering_sell_price
  })]), renderGroup("پنل و هزینه ساخت", [/*#__PURE__*/React.createElement(InputField, {
    key: "module_price_per_kWp",
    label: "هزینه پنل",
    value: state.module_price_per_kWp,
    onChange: v => updateState("module_price_per_kWp", v),
    step: 1000000,
    min: 0,
    unit: "ریال/kWp",
    inputId: "module_price_per_kWp",
    error: errors.module_price_per_kWp
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "mounting_structure_cost_per_kWp",
    label: "سازه و فونداسیون",
    value: state.mounting_structure_cost_per_kWp,
    onChange: v => updateState("mounting_structure_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    unit: "ریال/kWp",
    inputId: "mounting_structure_cost_per_kWp",
    error: errors.mounting_structure_cost_per_kWp
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "inverter_BOS_cost_per_kWp",
    label: "اینورتر و BOS",
    value: state.inverter_BOS_cost_per_kWp,
    onChange: v => updateState("inverter_BOS_cost_per_kWp", v),
    step: 1000000,
    min: 0,
    unit: "ریال/kWp",
    inputId: "inverter_BOS_cost_per_kWp",
    error: errors.inverter_BOS_cost_per_kWp
  }), /*#__PURE__*/React.createElement(InputField, {
    key: "grid_interconnection_lump_sum",
    label: "هزینه اتصال شبکه",
    value: state.grid_interconnection_lump_sum,
    onChange: v => updateState("grid_interconnection_lump_sum", v),
    step: 1000000,
    min: 0,
    unit: "ریال",
    inputId: "grid_interconnection_lump_sum",
    error: errors.grid_interconnection_lump_sum
  }), !simpleMode && /*#__PURE__*/React.createElement(InputField, {
    key: "EPC_soft_cost_pct_of_capex",
    label: "هزینه‌های نرم",
    value: state.EPC_soft_cost_pct_of_capex,
    onChange: v => updateState("EPC_soft_cost_pct_of_capex", v),
    step: 0.5,
    min: 0,
    max: 50,
    unit: "%",
    inputId: "EPC_soft_cost_pct_of_capex",
    error: errors.EPC_soft_cost_pct_of_capex
  })]));

  const stepThree = /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Card, {
    ref: resultRef,
    className: "p-4 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between flex-wrap gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "خلاصه نتیجه"), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-extrabold text-gray-900"
  }, "نتیجه شما:" , " ", result.decision || "نامشخص")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold",
    onClick: () => trackEvent("agro_calc_cta_consult", { placement: "results" })
  }, "درخواست مشاوره رایگان"), /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-bold",
    onClick: downloadPDF
  }, "دانلود PDF"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement(ResultCard, {
    tone: decisionTone,
    title: "سود/ارزش افزایشی (NPV)",
    value: ready ? formatMoney(result.npv_incremental, state.currency) : "—",
    desc: "ارزش فعلی خالص نسبت به حالت بدون پنل"
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: "warn",
    title: "دوره بازگشت تقریبی",
    value: ready ? PaybackLabel({ cashflows: result.cashflowsIncremental }) : "—",
    desc: "زمانی که جریان نقدی افزایشی مثبت می‌شود"
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: "success",
    title: "سود سال اول",
    value: ready ? formatMoney(result.cashflowsIncremental[1] ?? 0, state.currency) : "—",
    desc: "شامل کشاورزی + برق – هزینه‌های بهره‌برداری"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-gray-900 mb-2"
  }, "چرا این نتیجه؟"), /*#__PURE__*/React.createElement("ul", {
    className: "list-disc pr-5 space-y-1 text-sm text-gray-700"
  }, /*#__PURE__*/React.createElement("li", null, "قیمت برق و طرح فروش: ", state.grid_scheme), /*#__PURE__*/React.createElement("li", null, "هزینه ساخت هر kWp: ", formatMoney(state.module_price_per_kWp + state.mounting_structure_cost_per_kWp + state.inverter_BOS_cost_per_kWp, state.currency)), /*#__PURE__*/React.createElement("li", null, "تغییر عملکرد محصول: ", state.expected_yield_change_pct_under_AGV, "%"), /*#__PURE__*/React.createElement("li", null, "مصرف آب/برق: ", state.water_use_baseline_m3_per_ha, " m3/ha"))), /*#__PURE__*/React.createElement(MiniChart, {
    series: ready ? result.cashflowsIncremental : [],
    title: "نمودار جریان نقدی افزایشی"
  }))), /*#__PURE__*/React.createElement(Card, {
    className: "p-4 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-base font-bold text-gray-900"
  }, "حساسیت سریع"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-gray-500"
  }, "اثر تغییرات بر سود")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement(InputField, {
    label: "تغییر قیمت برق",
    value: sensitivity.tariff,
    onChange: v => setSensitivity(prev => ({ ...prev, tariff: v ?? 0 })),
    unit: "%",
    step: 1,
    min: -50,
    max: 50,
    tooltip: "اثر افزایش/کاهش تعرفه"
  }), /*#__PURE__*/React.createElement(InputField, {
    label: "تغییر هزینه ساخت",
    value: sensitivity.capex,
    onChange: v => setSensitivity(prev => ({ ...prev, capex: v ?? 0 })),
    unit: "%",
    step: 1,
    min: -50,
    max: 50,
    tooltip: "تغییر قیمت سازه و پنل"
  }), /*#__PURE__*/React.createElement(InputField, {
    label: "تغییر عملکرد محصول",
    value: sensitivity.yieldDelta,
    onChange: v => setSensitivity(prev => ({ ...prev, yieldDelta: v ?? 0 })),
    unit: "%",
    step: 1,
    min: -30,
    max: 30,
    tooltip: "بهبود یا افت عملکرد"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement(ResultCard, {
    title: "NPV بعد از تغییر",
    value: sensitivityReady ? formatMoney(sensitivityResult.npv_incremental, state.currency) : "—",
    desc: "درصد تغییر: " + (ready && sensitivityReady ? Math.round(((sensitivityResult.npv_incremental - result.npv_incremental) / (Math.abs(result.npv_incremental) || 1)) * 100) + "%" : "—")
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: "warn",
    title: "سود سال اول",
    value: sensitivityReady ? formatMoney(sensitivityResult.cashflowsIncremental[1] ?? 0, state.currency) : "—",
    desc: "با فرض تغییرات بالا"
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: "success",
    title: "برق سال اول",
    value: sensitivityReady ? numberWithUnit(sensitivityResult.totalPVkWhYear1, "kWh") : "—",
    desc: "پس از اعمال حساسیت"
  })))), /*#__PURE__*/React.createElement(Card, {
    className: "p-4 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-base font-bold text-gray-900"
  }, "فرضیات محاسبه"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "این فرضیات قابل تنظیم در حالت پیشرفته هستند.")), /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm",
    onClick: toggleMode
  }, simpleMode ? "حالت پیشرفته" : "بازگشت به ساده")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700"
  }, /*#__PURE__*/React.createElement("div", null, "افت سالانه پنل: ", state.annual_pv_degradation_pct, "%"), /*#__PURE__*/React.createElement("div", null, "دسترس‌پذیری سامانه: ", state.availability_pct, "%"), /*#__PURE__*/React.createElement("div", null, "هزینه O&M هر kWp: ", formatMoney(state.pv_om_cost_per_kWp_year, state.currency)), /*#__PURE__*/React.createElement("div", null, "روش محاسبه درآمد: ", state.grid_scheme), /*#__PURE__*/React.createElement("div", null, "تورم/رشد تعرفه: ", state.tariff_escalation_pct_per_year, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold",
    onClick: downloadCSV
  }, "دانلود CSV"), /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-bold",
    onClick: saveScenario
  }, shareLink ? "لینک ذخیره شد" : "ذخیره سناریو"), shareLink && /*#__PURE__*/React.createElement("input", {
    readOnly: true,
    value: shareLink,
    className: "w-full mt-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
  })));

  const nextStep = () => setStep(prev => Math.min(3, prev + 1));
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const contactForm = /*#__PURE__*/React.createElement(Card, {
    className: "p-4 space-y-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-900"
  }, "قدم بعدی چیست؟"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "برای بررسی میدانی و برآورد دقیق هزینه اجرا، اطلاعاتتان را بگذارید تا متخصص با شما تماس بگیرد."), /*#__PURE__*/React.createElement("form", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(InputField, {
    label: "نام و نام‌خانوادگی",
    value: state.contact_name || "",
    onChange: v => updateState("contact_name", v),
    type: "text",
    required: true
  }), /*#__PURE__*/React.createElement(InputField, {
    label: "شماره موبایل",
    value: state.contact_phone || "",
    onChange: v => updateState("contact_phone", v),
    type: "text",
    required: true
  }), /*#__PURE__*/React.createElement(InputField, {
    label: "شهر/منطقه",
    value: state.contact_city || "",
    onChange: v => updateState("contact_city", v),
    type: "text"
  }), /*#__PURE__*/React.createElement(SelectField, {
    label: "نوع کاربر",
    value: state.contact_role || "کشاورز",
    onChange: v => updateState("contact_role", v),
    options: [{ value: "کشاورز", label: "کشاورز" }, { value: "سرمایه‌گذار", label: "سرمایه‌گذار" }, { value: "توسعه‌دهنده", label: "توسعه‌دهنده" }]
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: isSubmitting,
    onClick: () => {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        trackEvent("agro_calc_cta_consult", { placement: "form" });
        alert("درخواست شما ثبت شد؛ با شما تماس می‌گیریم.");
      }, 400);
    },
    className: "w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold"
  }, isSubmitting ? "در حال ارسال..." : "درخواست مشاوره رایگان"));

  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-gray-900"
  }, /*#__PURE__*/React.createElement(FAQSchema, null), /*#__PURE__*/React.createElement("header", {
    className: "max-w-6xl mx-auto px-4 py-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-3"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold text-emerald-700"
  }, "ماشین‌حساب فتوکشت (کشاورزی زیر پنل خورشیدی)"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl md:text-4xl font-black text-gray-900 leading-tight"
  }, "فتوکشت؛ هم محصول، هم برق"), /*#__PURE__*/React.createElement("p", {
    className: "text-base md:text-lg text-gray-700 max-w-3xl"
  }, "با چند ورودی ساده ببینید نصب پنل خورشیدی روی مزرعه‌تان چقدر سود و صرفه‌جویی ایجاد می‌کند. نتایج با توضیح ساده و گزینه اقدام فوری ارائه می‌شود.")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg",
    onClick: () => {
      document.getElementById("calc-wizard")?.scrollIntoView({ behavior: "smooth" });
      trackEvent("agro_calc_cta_consult", { placement: "hero" });
    }
  }, "درخواست مشاوره رایگان فتوکشت"), /*#__PURE__*/React.createElement("button", {
    className: "px-5 py-3 rounded-2xl border border-emerald-300 text-emerald-700 font-bold text-sm",
    onClick: () => {
      setStep(1);
      document.getElementById("calc-wizard")?.scrollIntoView({ behavior: "smooth" });
      trackEvent("agro_calc_start", { placement: "hero" });
    }
  }, "محاسبه سریع"))), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-3 mt-6"
  }, ["فتوکشت یعنی چی؟", "مزیت کشاورز", "مزیت سرمایه‌گذار"].map((title, idx) => /*#__PURE__*/React.createElement(Card, {
    key: title,
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-gray-900"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700 leading-6"
  }, idx === 0 ? "کشت محصول با سایه کنترل‌شده زیر پنل‌های خورشیدی که هم آب را مدیریت می‌کند و هم درآمد جدید می‌آورد." : idx === 1 ? "کاهش هزینه برق پمپاژ و امکان برداشت دوگانه محصول + فروش برق" : "بازگشت سرمایه از جریان نقدی برق و محصول، با ریسک کمتر نسبت به نیروگاه صرف.")))))), /*#__PURE__*/React.createElement("main", {
    className: "max-w-6xl mx-auto px-4 pb-12 space-y-6"
  }, /*#__PURE__*/React.createElement(SectionShell, {
    title: "این ماشین‌حساب چه می‌گوید؟",
    subtitle: "سه خروجی کلیدی: سود افزایشی، دوره بازگشت و حساسیت قیمت/عملکرد"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement(ResultCard, {
    title: "سود سالانه تقریبی",
    value: ready ? formatMoney(result.cashflowsIncremental[1] ?? 0, state.currency) : "—",
    desc: "سود افزایشی نسبت به قبل"
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: "warn",
    title: "دوره بازگشت",
    value: ready ? PaybackLabel({ cashflows: result.cashflowsIncremental }) : "—",
    desc: "بر اساس جریان نقدی افزایشی"
  }), /*#__PURE__*/React.createElement(ResultCard, {
    tone: decisionTone,
    title: "خلاصه تصمیم",
    value: result.decision || "نیاز به ورودی",
    desc: "اگر مشروط است، با کارشناس هماهنگ کنید"
  }))), /*#__PURE__*/React.createElement(SectionShell, {
    id: "calc-wizard",
    title: "ماشین‌حساب مرحله‌ای",
    subtitle: "ورودی‌ها در چهار گروه مرتب شده‌اند؛ حالت ساده/پیشرفته برای کنترل جزئیات"
  }, wizardNav, /*#__PURE__*/React.createElement("div", {
    className: "rounded-3xl border border-gray-200 bg-white shadow-lg p-4 space-y-4"
  }, step === 1 && stepOne, step === 2 && stepTwo, step === 3 && stepThree, globalError && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold"
  }, globalError), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: resetInputs,
    className: "px-3 py-1 rounded-lg border border-red-200 text-red-700 bg-white hover:bg-red-50"
  }, "بازنشانی ورودی‌ها")), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, step > 1 && /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl border border-gray-200 text-gray-700",
    onClick: prevStep
  }, "مرحله قبل"), step < 3 && /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl bg-emerald-600 text-white",
    onClick: nextStep
  }, "مرحله بعد")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: `px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center gap-2 ${isCalculating || !validation.valid ? 'opacity-70 cursor-not-allowed' : ''}`,
    onClick: handleCalculate,
    disabled: isCalculating || !validation.valid,
    "aria-busy": isCalculating ? "true" : undefined
  }, isCalculating ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Spinner, { size: 14 }), "در حال محاسبه...") : "به‌روزرسانی محاسبات"), /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700",
    onClick: toggleMode
  }, simpleMode ? "حالت پیشرفته" : "بازگشت به ساده")))), /*#__PURE__*/React.createElement(SectionShell, {
    title: "پاسخ کوتاه برای شما",
    subtitle: "نتایج در ۱۰ ثانیه قابل فهم"
  }, stepThree), /*#__PURE__*/React.createElement(SectionShell, {
    title: "سوالات متداول",
    subtitle: "پاسخ سریع به دغدغه‌های رایج"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-gray-900"
  }, "فتوکشت چیست؟"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "هم‌زمانی کشت و تولید برق؛ سازه‌های مرتفع با فاصله ردیف کافی تا ماشین‌آلات کشاورزی حرکت کنند.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-gray-900"
  }, "اثر روی محصول؟"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "بسته به محصول و اقلیم، ممکن است اندکی کاهش یا حتی بهبود داشته باشد؛ پارامتر «تغییر عملکرد» را تنظیم کنید.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-gray-900"
  }, "مجوز و اتصال شبکه"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "سه سناریو: فروش تضمینی، تراز با شبکه، یا مصرف محلی. هزینه اتصال شبکه در محاسبه دیده می‌شود.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-gray-900"
  }, "برای چه زمین‌هایی؟"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "زمین با تابش مناسب، دسترسی به شبکه یا نیاز جدی به برق پمپاژ و محصول مقاوم به سایه، بهترین گزینه است.")))), /*#__PURE__*/React.createElement(SectionShell, {
    title: "برای اقدام آماده‌اید؟",
    subtitle: "نتیجه را برای بررسی میدانی بفرستید یا درخواست مشاوره دهید"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-3"
  }, contactForm, /*#__PURE__*/React.createElement(Card, {
    className: "p-4 space-y-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-lg font-bold text-gray-900"
  }, "باکس اعتماد"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700"
  }, "این محاسبه بر اساس فرضیات قابل تنظیم است؛ برای اعتبارسنجی میدانی با کارشناس صحبت کنید."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold",
    onClick: () => trackEvent("agro_calc_cta_consult", { placement: "trust" })
  }, "درخواست مشاوره"), /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-sm font-bold",
    onClick: downloadPDF
  }, "دانلود گزارش"))))))), showSticky && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-0 inset-x-0 bg-white shadow-2xl border-t border-emerald-200 p-3 flex justify-between items-center md:hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold text-gray-900"
  }, "آماده اقدام هستید؟"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold",
    onClick: () => trackEvent("agro_calc_cta_consult", { placement: "sticky" })
  }, "مشاوره"), /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold",
    onClick: downloadPDF
  }, "دانلود"))));
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AgrivoltaicsApp));
