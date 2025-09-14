    const { useState, useMemo, useEffect } = React;

    // نسخه مخصوص استان خراسان رضوی (ساده برای کشاورزان)
    // نکته: اعداد پیش‌فرض تقریبی هستند. لطفاً با شرایط واقعی زمین خودتان تنظیم کنید.

    // اجزای کمکی ساده
    const Section = ({ title, children }) => (
      <section className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <h2 className="text-emerald-400 text-base md:text-lg font-bold mb-3">{title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{children}</div>
      </section>
    );

    const NumberInput = ({ label, value, onChange, step = 1 }) => (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-200">{label}</span>
        <input dir="ltr" type="number" step={step} value={value}
          onChange={(e)=>onChange(Number(e.target.value))}
          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-right text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </label>
    );

    const Select = ({ label, value, onChange, options }) => (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-gray-200">{label}</span>
        <select value={value} onChange={(e)=>onChange(e.target.value)}
          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-right text-gray-100">
          {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );

    const KPI = ({ title, value, sub }) => (
      <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4 shadow-xl">
        <div className="text-gray-300 text-sm">{title}</div>
        <div className="text-xl md:text-2xl font-extrabold mt-1 text-emerald-400">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      </div>
    );

      const KV = ({ k, v }) => (
        <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 p-3">
          <div className="text-gray-400 text-xs">{k}</div>
          <div className="text-sm md:text-base font-semibold text-gray-100 mt-0.5">{v}</div>
        </div>
      );

      async function saveScenario(state, setShareLink) {
        const res = await fetch("/api/save-scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state })
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({}));
          alert(err.message || "ذخیره نشد؛ بعداً دوباره امتحان کن.");
          return;
        }
        const { id } = await res.json();
        const share = `${location.origin}${location.pathname}?id=${encodeURIComponent(id)}`;
        setShareLink(share);
      }

      async function loadScenarioById(id, setState){
        if (!id) return;
        const res = await fetch(`/api/get-scenario?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          const err = await res.json().catch(()=>({}));
          alert(err.message || "خواندن نشد؛ بعداً دوباره امتحان کن.");
          return;
        }
        const saved = await res.json();
        if (saved) setState(saved);
      }

      function AgrivoltaicsKhorasan(){
        const [simple, setSimple] = useState(true);
        const [shareLink, setShareLink] = React.useState("");

      // منطقه‌های پرتکرار استان (تقریبی)
      const regions = {
        mashhad: { title: "دشت مشهد / چناران", sun: 1675, heat: "med" },
        neyshabur: { title: "نیشابور / فیروزه", sun: 1680, heat: "med" },
        torbat: { title: "تربت‌حیدریه / زاوه / مه‌ولات / گناباد", sun: 1800, heat: "high" },
        sabzevar: { title: "سبزوار / بردسکن / کاشمر", sun: 1750, heat: "high" },
        quchan: { title: "قوچان / درگز / کلات", sun: 1625, heat: "low" },
        torbat_jam: { title: "تربت‌جم / تایباد / فریمان / خواف", sun: 1780, heat: "high" },
      };

      // محصولات رایج
      const cropProfiles = {
        "زعفران": { baseYieldChange: 6, waterSaving: -28, price_per_t: 2000000000, yield_t_ha: 4 },
        "گندم": { baseYieldChange: -2, waterSaving: -10, price_per_t: 500000000, yield_t_ha: 5.5 },
        "جو": { baseYieldChange: -3, waterSaving: -10, price_per_t: 420000000, yield_t_ha: 4.5 },
        "پسته": { baseYieldChange: -3, waterSaving: -20, price_per_t: 1800000000, yield_t_ha: 1.0 },
        "انگور": { baseYieldChange: 1, waterSaving: -15, price_per_t: 250000000, yield_t_ha: 20 },
        "سبزیجات برگی": { baseYieldChange: 8, waterSaving: -30, price_per_t: 250000000, yield_t_ha: 20 },
        "طالبی/خربزه": { baseYieldChange: 2, waterSaving: -20, price_per_t: 180000000, yield_t_ha: 15 },
      };

      // آب و خاک
      const waterSources = {
        well_electric_subsidized: { title: "چاه – برق یارانه‌ای", elec_tariff: 1000, water_cost: 0 },
        well_electric_normal: { title: "چاه – برق معمولی", elec_tariff: 3000, water_cost: 0 },
        well_diesel: { title: "چاه – دیزلی", elec_tariff: 6000, water_cost: 0 },
        qanat: { title: "قنات / آب ثقلی", elec_tariff: 0, water_cost: 5000 },
        canal: { title: "کانال/شبکه آبیاری", elec_tariff: 0, water_cost: 20000 },
      };
      const dustLevels = { low: { title: "گرد و غبار کم", soiling: 3 }, med: { title: "گرد و غبار متوسط", soiling: 5 }, high: { title: "گرد و غبار زیاد", soiling: 8 } };
      const soils = { sandy: { title: "شنی", pump_kWh_m3: 0.45 }, loam: { title: "لوم (میان‌دانه)", pump_kWh_m3: 0.5 }, clay: { title: "رسی", pump_kWh_m3: 0.55 } };

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
          tax_rate_pct: 0,
        });

        useEffect(() => {
          const id = new URLSearchParams(location.search).get("id");
          loadScenarioById(id, setS);
        }, []);

        React.useEffect(()=>{ if(!shareLink) return;
          const el = document.getElementById("qrBox"); if(!el) return;
          el.innerHTML=""; const typeNumber=0, errorCorrectLevel=QRErrorCorrectLevel.M;
          const qr = qrcode(typeNumber, errorCorrectLevel); qr.addData(shareLink); qr.make();
          el.innerHTML = qr.createSvgTag(6); // مقیاس
        }, [shareLink]);

        const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));
      const pct = (x) => (Number(x) || 0) / 100;
      const nz = (x) => Number(x) || 0;
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const fmt = (n) => new Intl.NumberFormat("fa-IR").format(Math.round(n || 0));
      const fmtMoney = (n) => `${fmt(n)} ${s.currency}`;

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
        if (heat === "high") { yieldChange += 1; waterSaving -= 3; }
        if (heat === "low")  { yieldChange -= 1; waterSaving += 2; }
        if (s.salinity_EC >= 4 && s.salinity_EC < 8) { yieldChange += 1; waterSaving -= 2; }
        if (s.salinity_EC >= 8) { yieldChange += 2; waterSaving -= 3; }

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
          crop_price_per_t: crop.price_per_t,
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

      const net_yield_factor = (1 - pct(s.soiling_loss_pct)) * (pct(s.availability_pct));
      const curtail = (1 - pct(s.curtailment_pct));
      const kWp = nz(s.pv_capacity_kWp_total);
      const annualPV = (y) => kWp * nz(s.specific_yield_kWh_per_kWp_year) * net_yield_factor * curtail * Math.pow(1 - pct(s.annual_pv_degradation_pct), y);
      const tariffEscal = (y) => Math.pow(1 + pct(s.tariff_escalation_pct_per_year), y);

      const elecRevenueYear = (y) => {
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

      const carbonRevenueYear = (y) => (annualPV(y) / 1000) * nz(s.avoided_co2_t_per_MWh) * nz(s.carbon_credit_price_per_tCO2);

      const baselineAnnualNet = () => (
        ag_rev_baseline - ag_opex_baseline_total - water_cost_base - irrigation_energy_cost_base - land_lease_annual
      );
      const agvAnnualNetBeforePV = () => (
        ag_rev_agv - ag_opex_agv_total - water_cost_agv - irrigation_energy_cost_agv - land_lease_annual
      );
      const agvAnnualNet = (y) => (
        agvAnnualNetBeforePV() + elecRevenueYear(y) + carbonRevenueYear(y) - pv_om_annual - insurance_annual
      );

      const cashflowsBaseline = Array.from({ length: years }, () => baselineAnnualNet());
      const cashflowsAGV = Array.from({ length: years }, (_, y) => agvAnnualNet(y));
      const cashflowsAGV_WithCapex = [ -capex_total, ...cashflowsAGV ];
      const cashflowsBaseline_ZeroCapex = [ 0, ...cashflowsBaseline ];
      const cashflowsIncremental = cashflowsAGV_WithCapex.map((v, i) => v - (cashflowsBaseline_ZeroCapex[i] ?? 0));

      const npv = (ratePct, arr) => arr.reduce((acc, cf, i) => acc + cf / Math.pow(1 + (ratePct/100), i), 0);
      const irr = (arr) => { let lo=-0.9, hi=1.0; const f=r=>arr.reduce((a,c,i)=>a+c/Math.pow(1+r,i),0); let flo=f(lo), fhi=f(hi); if(isNaN(flo)||isNaN(fhi)||flo*fhi>0) return null; for(let k=0;k<80;k++){ const mid=(lo+hi)/2, fm=f(mid); if(Math.abs(fm)<1e-3) return mid; if(flo*fm<0){hi=mid; fhi=fm;} else {lo=mid; flo=fm;} } return (lo+hi)/2; };

      const NPV_incremental = npv(s.discount_rate_pct, cashflowsIncremental);
      const IRR_incremental = irr(cashflowsIncremental);

      const decisionText = () => {
        if (NPV_incremental > 0 && (IRR_incremental ?? 0) > (s.discount_rate_pct/100)) return "به‌صرفه";
        if (Math.abs(NPV_incremental) < 0.05 * capex_total) return "تقریباً سر به سر";
        return "به‌صرفه نیست";
      };

      const totalPVkWhYear1 = annualPV(0);

      const Chart = ({ data, title, height=160 }) => {
        const w = 720, h = height, pad = 24;
        const n = data.length;
        const min = Math.min(...data, 0), max = Math.max(...data, 0);
        const scaleX = (i) => pad + (i * (w - 2*pad)) / Math.max(1, n - 1);
        const scaleY = (v) => { if (max === min) return h/2; return h - pad - ((v - min) * (h - 2*pad)) / (max - min); };
        const path = data.map((v,i)=> `${i===0?'M':'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
        const zeroY = scaleY(0);
        return (
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4">
            <div className="text-gray-300 text-sm mb-2">{title}</div>
            <svg width={w} height={h} className="max-w-full">
              <line x1={pad} y1={zeroY} x2={w-pad} y2={zeroY} stroke="#444" strokeDasharray="4 4" />
              <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        );
      };

      const downloadCSV = () => {
        const rows = [["سال","برق (kWh)","درآمد/صرفه‌جویی برق","خالص کشاورزی (قبل)","خالص کشاورزی (با)","افزایشی"]];
        for (let i=0;i<years;i++) rows.push([ i+1, Math.round(annualPV(i)), Math.round(elecRevenueYear(i)), Math.round(cashflowsBaseline[i]), Math.round(cashflowsAGV[i]), Math.round(cashflowsIncremental[i+1] ?? 0) ]);
        const csv = rows.map(r=>r.join(",")).join("\n");
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'agrivoltaics_khorasan.csv'; a.click(); URL.revokeObjectURL(url);
      };

      const downloadPDF = () => {
        const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit:"pt", format:"a4" });
        doc.setFontSize(14); doc.text("گزارش فوتوکِشت – خراسان رضوی", 40, 40);
        doc.setFontSize(11);
        doc.text(`هزینه اولیه: ${fmtMoney(capex_total)}`, 40, 70);
        doc.text(`برق سال اول: ${fmt(totalPVkWhYear1)} kWh`, 40, 90);
        doc.text(`درآمد/صرفه‌جویی برق سال اول: ${fmtMoney(elecRevenueYear(0))}`, 40, 110);
        doc.text(`ارزش امروز: ${fmtMoney(NPV_incremental)}`, 40, 130);
        doc.text(`نتیجه: ${decisionText()}`, 40, 150);
        let y = 190; doc.text("سال | برق | درآمد برق | افزایشی", 40, y); y+=18;
        for(let i=0;i<Math.min(5, years);i++){ doc.text(`${i+1} | ${fmt(annualPV(i))} | ${fmtMoney(elecRevenueYear(i))} | ${fmtMoney(cashflowsIncremental[i+1]||0)}`, 40, y); y+=16; }
        doc.save("agrivoltaics-report.pdf");
      };

      return (
        <div dir="rtl" className="min-h-screen w-full bg-gradient-to-b from-neutral-950 to-neutral-900 text-gray-100 px-4 py-6 md:py-10 md:px-8">
          <header className="max-w-7xl mx-auto mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">ماشین‌حساب فوتوکِشت – ویژه خراسان رضوی</h1>
              <p className="text-sm md:text-base text-gray-300 mt-2">با چند ورودی ساده ببینید کِشت زیر پنل خورشیدی در منطقه شما می‌صرفد یا نه.</p>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <div>۱) منطقه، محصول، آب و خاک را انتخاب کنید. اعداد پیش‌فرض بر اساس شرایط رایج استان پر می‌شوند.</div>
                <div>۲) اگر لازم بود، قیمت‌ها و مقادیر را با وضعیت خودتان عوض کنید.</div>
                <div>۳) نتیجه را در کارت‌ها و نمودار ببینید. اگر «ارزش امروز» مثبت باشد، معمولاً طرح خوب است.</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white" onClick={()=>setSimple(v=>!v)}>حالت {simple? 'پیشرفته' : 'ساده'}</button>
                <button onClick={downloadCSV} className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100">دانلود CSV</button>
                <button onClick={downloadPDF} className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100">دانلود PDF</button>
                <button onClick={() => saveScenario(s, setShareLink)} className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100">ذخیره سناریو</button>
                <button onClick={() => { const id = prompt("کُد/لینک را وارد کنید:"); const onlyId = (id||"").split("id=").pop(); loadScenarioById(onlyId, setS); }} className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-gray-100">بازکردن از لینک</button>
            </div>
          </header>

          <main className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            <section className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-emerald-400 text-base md:text-lg font-bold mb-3">۰) منطقه و شرایط محلی</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Select label="منطقه" value={s.region} onChange={(v)=>set("region", v)} options={Object.entries(regions).map(([k,v])=>({value:k,label:v.title}))} />
                <Select label="محصول" value={s.crop_type} onChange={(v)=>set("crop_type", v)} options={Object.keys(cropProfiles).map(k=>({value:k,label:k}))} />
                <Select label="منبع آب" value={s.water_source} onChange={(v)=>set("water_source", v)} options={Object.entries(waterSources).map(([k,v])=>({value:k,label:v.title}))} />
                <Select label="گرد و غبار" value={s.dust_level} onChange={(v)=>set("dust_level", v)} options={Object.entries(dustLevels).map(([k,v])=>({value:k,label:v.title}))} />
                <Select label="نوع خاک" value={s.soil_type} onChange={(v)=>set("soil_type", v)} options={Object.entries(soils).map(([k,v])=>({value:k,label:v.title}))} />
                <NumberInput label="شوری آب/خاک (EC dS/m)" value={s.salinity_EC} onChange={(v)=>set("salinity_EC", v)} step={0.5} />
              </div>
              <p className="text-xs text-gray-400 mt-3">* اگر منطقه دقیق شما در لیست نیست، نزدیک‌ترین منطقه را انتخاب کنید و اعداد را کمی تنظیم کنید.</p>
            </section>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <KPI title="هزینه اولیه ساخت" value={fmtMoney(capex_total)} sub="پنل، سازه، اینورتر، اتصال" />
              <KPI title="برق سال اول" value={`${fmt(totalPVkWhYear1)} kWh`} sub="پس از کثیفی/خرابی" />
              <KPI title="درآمد/صرفه‌جویی برق سال اول" value={fmtMoney(elecRevenueYear(0))} sub="طبق طرح انتخابی" />
              <KPI title="ارزش امروز سود" value={fmtMoney(npv(s.discount_rate_pct, cashflowsIncremental))} sub={`با نرخ ${s.discount_rate_pct}%`} />
              <KPI title="سود سالانه تقریبی" value={IRR_incremental==null? 'نامشخص' : `${(IRR_incremental*100).toFixed(1)} %`} sub="هرچه بیشتر، بهتر" />
            </div>

            <div className={`rounded-2xl p-4 border shadow-xl ${decisionText()==='به‌صرفه' ? 'bg-emerald-900/30 border-emerald-700' : decisionText()==='تقریباً سر به سر' ? 'bg-yellow-900/30 border-yellow-700' : 'bg-rose-900/30 border-rose-700'}`}>
              <div className="text-sm">خلاصه تصمیم:</div>
              <div className="text-lg font-bold mt-1">{decisionText()}</div>
              <div className="text-xs text-gray-300 mt-1">اگر «ارزش امروز» مثبت باشد و بازگشت سرمایه در چند سال اول رخ دهد، معمولاً طرح اقتصادی است.</div>
            </div>

            <Section title="۱) اطلاعات زمین و محصول">
              <NumberInput label="مساحت زمین (هکتار)" value={s.project_area_ha} onChange={(v)=>set("project_area_ha", v)} step={0.1} />
              <NumberInput label="عملکرد فعلی (تن/هکتار)" value={s.baseline_yield_t_per_ha} onChange={(v)=>set("baseline_yield_t_per_ha", v)} step={0.1} />
              <NumberInput label="تغییر عملکرد زیر پنل (%)" value={s.expected_yield_change_pct_under_AGV} onChange={(v)=>set("expected_yield_change_pct_under_AGV", v)} step={0.5} />
              <NumberInput label="قیمت فروش محصول (ریال/تن)" value={s.crop_price_per_t} onChange={(v)=>set("crop_price_per_t", v)} step={1000000} />
              <NumberInput label="هزینه سالانه کشاورزی (ریال/هکتار)" value={s.ag_opex_baseline_per_ha} onChange={(v)=>set("ag_opex_baseline_per_ha", v)} step={1000000} />
              <NumberInput label="تغییر هزینه کشاورزی (%)" value={s.ag_opex_change_under_AGV_pct} onChange={(v)=>set("ag_opex_change_under_AGV_pct", v)} step={0.5} />
              <NumberInput label="مصرف آب فعلی (m³/هکتار)" value={s.water_use_baseline_m3_per_ha} onChange={(v)=>set("water_use_baseline_m3_per_ha", v)} step={10} />
              <NumberInput label="تغییر مصرف آب (%)" value={s.water_use_change_under_AGV_pct} onChange={(v)=>set("water_use_change_under_AGV_pct", v)} step={1} />
              <NumberInput label="شیرینی/تلخی قیمت (کیفیت) (%)" value={s.crop_quality_premium_or_discount_pct} onChange={(v)=>set("crop_quality_premium_or_discount_pct", v)} step={0.5} />
            </Section>

            <Section title="۲) آبیاری و برق مزرعه">
              <NumberInput label="برق پمپاژ آب (kWh برای هر m³)" value={s.energy_for_irrigation_kWh_per_m3} onChange={(v)=>set("energy_for_irrigation_kWh_per_m3", v)} step={0.01} />
              <NumberInput label="قیمت برق برای پمپاژ (ریال/kWh)" value={s.irrigation_energy_tariff || 0} onChange={(v)=>set("irrigation_energy_tariff", v)} step={50} />
              <NumberInput label="قیمت آب خریداری‌شده (ریال/m³)" value={s.water_unit_cost} onChange={(v)=>set("water_unit_cost", v)} step={100} />
              <Select label="طرح مصرف/فروش برق" value={s.grid_scheme} onChange={(v)=>set("grid_scheme", v)} options={[{value:"PPA/FIT",label:"فروش تضمینی"},{value:"NetMetering",label:"تراز با شبکه"},{value:"SelfConsumption",label:"مصرف در مزرعه"}]} />
              <NumberInput label="قیمت تضمینی/فروش (ریال/kWh)" value={s.ppa_or_fit_tariff} onChange={(v)=>set("ppa_or_fit_tariff", v)} step={50} />
              <NumberInput label="سهم مصرف در مزرعه (%)" value={s.self_consumption_share_pct} onChange={(v)=>set("self_consumption_share_pct", v)} step={1} />
              <NumberInput label="قیمت خرید از شبکه (ریال/kWh)" value={s.net_metering_buy_price} onChange={(v)=>set("net_metering_buy_price", v)} step={50} />
              <NumberInput label="قیمت فروش به شبکه (ریال/kWh)" value={s.net_metering_sell_price} onChange={(v)=>set("net_metering_sell_price", v)} step={50} />
            </Section>

            <Section title="۳) برق خورشیدی (اندازه و هزینه ساخت)">
              <NumberInput label="ظرفیت کل سامانه (kWp)" value={s.pv_capacity_kWp_total} onChange={(v)=>set("pv_capacity_kWp_total", v)} />
              <NumberInput label="تولید ویژه سالانه (kWh/kWp)" value={s.specific_yield_kWh_per_kWp_year} onChange={(v)=>set("specific_yield_kWh_per_kWp_year", v)} step={10} />
              <NumberInput label="قیمت پنل (ریال/kWp)" value={s.module_price_per_kWp} onChange={(v)=>set("module_price_per_kWp", v)} step={1000000} />
              <NumberInput label="هزینه سازه (ریال/kWp)" value={s.mounting_structure_cost_per_kWp} onChange={(v)=>set("mounting_structure_cost_per_kWp", v)} step={1000000} />
              <NumberInput label="اینورتر و کابل‌کشی (ریال/kWp)" value={s.inverter_BOS_cost_per_kWp} onChange={(v)=>set("inverter_BOS_cost_per_kWp", v)} step={1000000} />
              <NumberInput label="هزینه اتصال به شبکه (یکجا)" value={s.grid_interconnection_lump_sum} onChange={(v)=>set("grid_interconnection_lump_sum", v)} step={1000000} />
              {!simple && <>
                <NumberInput label="خدمات/مجوز/طراحی (%)" value={s.EPC_soft_cost_pct_of_capex} onChange={(v)=>set("EPC_soft_cost_pct_of_capex", v)} step={0.5} />
                <NumberInput label="کاهش راندمان پنل (% سالانه)" value={s.annual_pv_degradation_pct} onChange={(v)=>set("annual_pv_degradation_pct", v)} step={0.1} />
                <NumberInput label="کثیفی پنل (٪)" value={s.soiling_loss_pct} onChange={(v)=>set("soiling_loss_pct", v)} step={0.5} />
                <NumberInput label="دسترس‌پذیری سامانه (٪)" value={s.availability_pct} onChange={(v)=>set("availability_pct", v)} step={0.5} />
                <NumberInput label="نگهداری سالانه (ریال/kWp)" value={s.pv_om_cost_per_kWp_year} onChange={(v)=>set("pv_om_cost_per_kWp_year", v)} step={10000} />
              </>}
            </Section>

            <section className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-emerald-400 text-base md:text-lg font-bold mb-3">نتایج خلاصه</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <KV k="درآمد کشاورزی (قبل از پنل)" v={fmtMoney(ag_rev_baseline)} />
                <KV k="درآمد کشاورزی (با پنل)" v={fmtMoney(ag_rev_agv)} />
                <KV k="هزینه آب (قبل)" v={fmtMoney(water_cost_base)} />
                <KV k="هزینه آب (با پنل)" v={fmtMoney(water_cost_agv)} />
                <KV k="هزینه انرژی پمپاژ (قبل)" v={fmtMoney(irrigation_energy_cost_base)} />
                <KV k="هزینه انرژی پمپاژ (با پنل)" v={fmtMoney(irrigation_energy_cost_agv)} />
                <KV k="نگهداری سالانه سامانه خورشیدی" v={fmtMoney(pv_om_annual)} />
                <KV k="بیمه سالانه" v={fmtMoney(insurance_annual)} />
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-4">
              <Chart title="جریان نقدی افزایشی هر سال" data={cashflowsIncremental.slice(1)} />
              {(()=>{const cum=[];let c=0;for(let i=0;i<cashflowsIncremental.length;i++){c+=cashflowsIncremental[i];cum.push(c);}return <Chart title="جمعِ جریان نقدی از شروع پروژه" data={cum} />;})()}
            </div>

            <section className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl overflow-x-auto">
              <h2 className="text-emerald-400 text-base md:text-lg font-bold mb-4">جدول سال‌به‌سال</h2>
              <table className="w-full text-sm">
                <thead className="text-gray-300">
                  <tr className="border-b border-neutral-800">
                    <th className="py-2 text-right">سال</th>
                    <th className="py-2 text-right">برق (kWh)</th>
                    <th className="py-2 text-right">درآمد/صرفه‌جویی برق</th>
                    <th className="py-2 text-right">خالص کشاورزی (قبل)</th>
                    <th className="py-2 text-right">خالص کشاورزی (با پنل)</th>
                    <th className="py-2 text-right">افزایشی</th>
                  </tr>
                </thead>
                <tbody>
                  {cashflowsAGV.map((_, i) => (
                    <tr key={i} className="border-b border-neutral-900 hover:bg-neutral-900/40">
                      <td className="py-2">{i+1}</td>
                      <td className="py-2">{fmt(annualPV(i))}</td>
                      <td className="py-2">{fmtMoney(elecRevenueYear(i) + carbonRevenueYear(i))}</td>
                      <td className="py-2">{fmtMoney(cashflowsBaseline[i])}</td>
                      <td className="py-2">{fmtMoney(cashflowsAGV[i])}</td>
                      <td className="py-2">{fmtMoney(cashflowsIncremental[i+1] ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-xs text-gray-400">* سال صفر شامل هزینه ساخت است و در جدول نیامده است.</div>
            </section>

            <div className="text-xs text-gray-400 pb-8">
              نکته: برای دقت بیشتر، قیمت محصول و هزینه آب/برق را از فیش‌های اخیر خودتان وارد کنید. اگر خواستید، می‌توانیم نسخه روستایی/دهستانی با اعداد دقیق‌تری بسازیم.
            </div>
          </main>
          {shareLink && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white text-black p-4 rounded-xl flex flex-col items-center">
                <div id="qrBox" className="mb-4"></div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={() => navigator.clipboard.writeText(shareLink)}>کپی لینک</button>
                  <button className="px-3 py-2 rounded bg-gray-300" onClick={() => setShareLink("")}>بستن</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AgrivoltaicsKhorasan));

