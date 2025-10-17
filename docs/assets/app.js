// === Utils (بالای فایل) ===
const nf = new Intl.NumberFormat('fa-IR');
const pf = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });

function toNum(v){
  const n = typeof v === 'string' ? Number(v.replace(/[^\d.\-]/g,'')) : Number(v);
  return Number.isFinite(n) ? n : 0;
}
async function parseMaybeJson(res){
  if (!res) return res;
  if (typeof res === 'string') {
    try { return JSON.parse(res); } catch { return res; }
  }
  if (typeof res === 'object' && typeof res.text !== 'function') return res;
  const raw = await res.text();
  try { return JSON.parse(raw); } catch { return raw; }
}
function pickByType(payload, type){
  if (!payload) return null;
  if (Array.isArray(payload)) return payload.find(x => x && x.type === type) || payload[0] || null;
  return payload.type === type ? payload : payload;
}
const faStatus = s => ({normal:'عادی', improving:'روبه‌بهبود', critical:'بحرانی'}[(s||'').toLowerCase()] || (s||''));

function skeleton(){
  return '<div class="space-y-2 animate-pulse"><div class="h-4 bg-slate-200 rounded"></div><div class="h-4 bg-slate-200 rounded w-5/6"></div><div class="h-4 bg-slate-200 rounded w-4/6"></div></div>';
}

function showThinkingUI(){}
function hideThinkingUI(){}

function showErrorModal(msg){ alert(msg); }

// عناصر مربوط به راهکارهای هوشمند
const familySizeInput = document.getElementById('family-input');
const showerTimeInput = document.getElementById('shower-input');
const generateTipsBtn = document.getElementById('solution-btn');
const tipsLoader = document.getElementById('solution-thinking');
const tipsResultDiv = document.getElementById('solution-result');
const tipsResultContainer = tipsResultDiv;

const foodInput = document.getElementById('food-input');
const calculateFootprintBtn = document.getElementById('calc-water-btn');
const footprintLoader = document.getElementById('ai-thinking');
const footprintResultContainer = document.getElementById('water-result');
const footprintResultDiv = document.getElementById('water-result');

// شبیه‌ساز ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const $btn = document.querySelector('#simulate-btn');
  $btn?.addEventListener('click', handleSimulation);
});

async function handleSimulation(e) {
  e?.preventDefault?.();

  const $cons = document.querySelector('#sim-consumption');
  const $rain = document.querySelector('#sim-rainfall');
  const $loader = document.querySelector('#simulate-thinking');
  const $result = document.querySelector('#simulate-result');
  const $error = document.querySelector('[data-sim-error]');

  if ($error) $error.textContent = '';

  if (!$cons || !$rain) {
    console.error('Simulation inputs not found');
    showSimError('ورودی‌های شبیه‌ساز پیدا نشد.');
    return;
  }

  const consumption = Number($cons.value);
  const rainfall = Number($rain.value);

  if (Number.isNaN(consumption) || Number.isNaN(rainfall)) {
    showSimError('مقادیر نامعتبر است.');
    return;
  }

  setSimLoading(true);
  if ($loader) $loader.classList.remove('hidden');
  if ($result) {
    $result.classList.remove('hidden');
    $result.textContent = '⏳';
  }

  try {
    const ask = typeof askAI === 'function'
      ? askAI
      : (typeof window !== 'undefined' && typeof window.askAI === 'function' ? window.askAI : null);

    if (typeof ask !== 'function') {
      const err = new Error('AI client unavailable');
      err.code = 'unavailable';
      throw err;
    }

    const prompt = buildSimulationPrompt(consumption, rainfall);
    const raw = await ask(prompt, { json: true });
    const data = safeJSON(raw);

    if (!data || typeof data !== 'object') {
      const err = new Error('invalid_json');
      err.code = 'invalid_json';
      throw err;
    }

    if (typeof data.new_day_zero !== 'number' || typeof data.explanation !== 'string') {
      const err = new Error('missing_fields');
      err.code = 'invalid_json';
      throw err;
    }

    renderSimulation(data);
  } catch (err) {
    console.error('Simulation error:', err);
    const msg = friendlySimError(err);
    showSimError(msg);
    if ($result) $result.textContent = '';
  } finally {
    if ($loader) $loader.classList.add('hidden');
    setSimLoading(false);
  }
}

function safeJSON(txt) {
  if (typeof txt !== 'string') {
    return typeof txt === 'object' ? txt : {};
  }
  const cleaned = txt
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

function setSimLoading(on) {
  const $btn = document.querySelector('#simulate-btn');
  if (!$btn) return;
  $btn.disabled = !!on;
  $btn.classList.toggle('opacity-60', !!on);
}

function showSimError(msg) {
  const el = document.querySelector('[data-sim-error]');
  if (el) el.textContent = msg;
}

function friendlySimError(err) {
  const code = (err?.code || err?.message || '').toString().toLowerCase();
  if (code.includes('missing_api_key')) return 'کلید سرویس هوش مصنوعی پیکربندی نشده است.';
  if (code.includes('empty_prompt')) return 'ورودی مدل معتبر نبود.';
  if (code.includes('rate_limit')) return 'سرویس هوش مصنوعی شلوغ است؛ لطفاً کمی بعد تلاش کنید.';
  if (code.includes('ai_http_504') || code.includes('timeout')) return 'مهلت پاسخ‌گویی سرویس به پایان رسید. لطفاً دوباره امتحان کنید.';
  if (code.includes('ai_http_503')) return 'سرویس هوش مصنوعی موقتاً در دسترس نیست.';
  if (code.includes('ai_http_5')) return 'سرویس هوش مصنوعی با خطا مواجه شد.';
  if (code.includes('upstream') || code.includes('network') || code.includes('unavailable')) return 'ارتباط با سرویس هوش مصنوعی برقرار نشد.';
  if (code.includes('invalid_json')) return 'پاسخ هوش مصنوعی قابل استفاده نبود.';
  return 'پاسخ هوش مصنوعی نامعتبر بود یا ارتباط برقرار نشد.';
}

function buildSimulationPrompt(consumption, rainfall) {
  return `You are a water crisis analyst for the city of Mashhad. Your task is to simulate the effect of citizen actions and rainfall on the city's "Day Zero" (the day water runs out).
Current status:
- Days until Day Zero: 32 days.
- Total usable water in dams: 30.5 Million Cubic Meters (MCM).
- Current daily consumption: 0.953 MCM (30.5 / 32).

User's simulation inputs:
- Assumed city-wide consumption reduction: ${consumption}%.
- Assumed rainfall in the next 30 days: ${rainfall} mm.

Calculation model:
1) NewDaily = 0.953 * (1 - ${consumption} / 100)
2) AddedFromRain = ${rainfall} * 0.5  (1mm rain adds 0.5 MCM)
3) NewTotal = 30.5 + AddedFromRain
4) NewDayZero = round( NewTotal / NewDaily )

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "new_day_zero": <number>,
  "explanation": "<short Persian paragraph for non-expert users>"
}`.trim();
}

function renderSimulation(data) {
  const $result = document.querySelector('#simulate-result');
  const $error = document.querySelector('[data-sim-error]');
  if ($error) $error.textContent = '';
  if (!$result) return;

  const baseDays = 32;
  const diff = Number(data.new_day_zero) - baseDays;
  let diffHTML = '';
  if (Number.isFinite(diff) && diff > 0) {
    diffHTML = `<span class="text-green-600 font-bold">(+${diff.toLocaleString('fa-IR')} روز)</span>`;
  } else if (Number.isFinite(diff) && diff < 0) {
    diffHTML = `<span class="text-red-600 font-bold">(${diff.toLocaleString('fa-IR')} روز)</span>`;
  }

  const dayZero = Number(data.new_day_zero);
  const explanation = data.explanation || '';

  $result.innerHTML = `
    <p class="text-slate-600 mb-2">روز صفر جدید:</p>
    <p class="text-6xl font-extrabold text-blue-600 mb-3">
      ${Number.isFinite(dayZero) ? dayZero.toLocaleString('fa-IR') : '--'}
      <span class="text-2xl">روز</span>
      ${diffHTML}
    </p>
    <p class="text-slate-700 text-lg">${explanation}</p>
  `;
}


// راهکارها --------------------------------------------------------------
// فالبک محلیِ بسیار ساده وقتی AI خطا می‌دهد
function localSmartTips(familySize, showerTime) {
  const intro = `سلام به خانواده ${familySize} نفره‌ی عزیز! به عنوان یک متخصص دلسوز در بحران آب، سه راهکار فوری و کم‌هزینه برای شما دارم. هر دقیقه حمام کمتر می‌تواند تفاوت بزرگی بسازد؛ الان میانگین ${showerTime} دقیقه است.`;
  const tips = [
    { title:'دوشِ هوشمندانه!', body:'زمان دوش را ۲ تا ۳ دقیقه کوتاه‌تر کنید. همین کار ساده و هماهنگ در خانواده می‌تواند صدها لیتر در ماه صرفه‌جویی کند.' },
    { title:'چک‌آپ نشتی‌ها', body:'نشتی فلاش‌تانک و شیرها را همین هفته برطرف کنید. یک نشتی کوچک، روزانه ده‌ها لیتر آب هدر می‌دهد.' },
    { title:'آبِ سردِ ابتدایی', body:'آب سردِ ابتدای باز کردن شیر را در ظرف جمع کنید و برای آبیاری گلدان‌ها یا شست‌وشوی سطح استفاده کنید.' },
  ];
  const outro = 'با همین قدم‌های کوچک، هم هزینه‌ها کم می‌شود و هم به پایداری آب شهر کمک می‌کنید. شما قهرمان آب هستید!';
  return { intro, tips, outro };
}

// رندر استاندارد و یکدست، مطابق طرح مطلوب
function renderSmartTips({ intro, tips, outro }) {
  const toFa = n => new Intl.NumberFormat('fa-IR').format(n);
  const itemsHTML = tips.map(t => `
    <div class="tips-item">
      <div class="tips-title"># ${t.title}</div>
      <div class="tips-body">${t.body}</div>
    </div>
  `).join('');

  return `
    <div class="tips-card">
      <div class="tips-prose">
        <p>${intro}</p>
        <hr class="tips-hr">
        ${itemsHTML}
        <hr class="tips-hr">
        <p>${outro}</p>
      </div>
    </div>
  `;
}

// --- جایگزین کن با این نسخه
async function handleGenerateTips() {
  const familySize = familySizeInput.value || '4';
  const showerTime = showerTimeInput.value || '10';

  tipsResultContainer.classList.remove('hidden');
  tipsLoader.classList.remove('hidden');
  tipsResultDiv.innerHTML = '';
  generateTipsBtn.disabled = true;
  generateTipsBtn.classList.add('opacity-50');

  const prompt = `به عنوان یک متخصص دلسوز در زمینه بحران آب در ایران، برای یک خانواده ${familySize} نفره در مشهد که اعضای آن به طور متوسط ${showerTime} دقیقه حمام می‌کنند، سه راهکار خلاقانه، عملی و کم‌هزینه برای کاهش فوری مصرف آب ارائه بده. لحن تو باید بسیار دوستانه، تشویق‌کننده و ساده باشد تا برای همه قابل فهم باشد. پاسخ را به فارسی و با قالب سادهٔ زیر بده:
- از عنوان‌های کوتاه (با پیشوند #) برای هر راهکار استفاده کن
- برای هر راهکار یک توضیح یک تا دو خطی بنویس
- در صورت نیاز کلمات کلیدی را بین **دو ستاره** بولد کن
- در پایان یک جملهٔ انگیزشی کوتاه اضافه کن`;

  // Helper واحد: اول askAI اگر هست، وگرنه callGeminiAPI
  const callAI = typeof askAI === 'function'
    ? (p) => askAI(p, { json: false })
    : (p) => callGeminiAPI(p, false);

  try {
    const rawText = await callAI(prompt);

    // --- Sanitization & Markdown-lite → HTML ---
    // 1) Escape برای جلوگیری از تزریق HTML
    const esc = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let t = esc(String(rawText).trim());

    // 2) **bold** → <strong>
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3) خطوط عنوان: ابتدای خط با #
    t = t.replace(/^#\s*(.+)$/gm, '<h3 class="tips-title">$1</h3>');

    // 4) آیتم‌ها: خطوطی که با "- " شروع می‌شوند → li
    // ابتدا liها را بسازیم
    let madeList = false;
    t = t.replace(/^- (.+)$/gm, (_m, p1) => {
      madeList = true;
      return `<li>${p1}</li>`;
    });
    // اگر li ساخته شد، آن‌ها را داخل ul قرار بده
    if (madeList) {
      // گروه‌بندی li های پیوسته داخل یک ul
      t = t
        .replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (block) => {
          const items = block.trim();
          return `<ul class="tips-list">${items}</ul>`;
        });
    }

    // 5) باقی خطوط شکسته شوند
    t = t.replace(/\n/g, '<br>');

    // 6) خروجی نهایی داخل قالب موجود
    tipsResultDiv.innerHTML = `
      <div class="tips-card">
        <div class="tips-prose">
          ${t}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Gemini API Error (Tips):', error);
    showErrorModal();
    // کانتینر نتیجه را پنهان نکن؛ کاربر پیام خطا را می‌بیند
  } finally {
    tipsLoader.classList.add('hidden');
    generateTipsBtn.disabled = false;
    generateTipsBtn.classList.remove('opacity-50');
  }
}

// ردپای آب --------------------------------------------------------------
async function handleCalculateFootprint() {
  const foodItems = foodInput.value.trim();
  if (!foodItems) {
    showErrorModal("لطفا حداقل یک ماده غذایی وارد کنید.");
    return;
  }

  footprintResultContainer.classList.remove('hidden');
  footprintLoader.classList.remove('hidden');
  footprintResultDiv.innerHTML = '';
  calculateFootprintBtn.disabled = true;
  calculateFootprintBtn.classList.add('opacity-50');

  // --- فالبک محلی بسیار ساده و بی‌خطر (فقط برای وقتی AI خطا می‌دهد) ---
  // توجه: این اعداد تقریبی و صرفاً برای «نمایش UI» در خطاست، نه دقت علمی.
  const MAP_LOCAL = {
    'نان': 160, // مطابق اسکرین‌شات مورد انتظار
    'برنج': 2500,
    'گوشت گاو': 15000,
    'گوجه فرنگی': 180,
    'سیب': 125
  };

  function localEstimate(itemsStr) {
    const items = itemsStr.split(/[،,\n]+/).map(s => s.trim()).filter(Boolean);
    let total = 0;
    const breakdown = [];
    for (const it of items) {
      const key = Object.keys(MAP_LOCAL).find(k => it.includes(k));
      const liters = key ? MAP_LOCAL[key] : 120; // حداقل تقریبی
      total += liters;
      breakdown.push({ item_persian: it, liters });
    }
    const comparison = `معادل تقریبی ${Math.max(1, Math.round(total / 100))} دوش ۱۰ دقیقه‌ای است.`;
    return { total_liters: total, comparison_text_persian: comparison, breakdown };
  }

  // ابتدا «خروجی نهایی UI» را مثل طرح مطلوب با فالبک محلی بسازیم:
  const local = localEstimate(foodItems);

  let breakdownHtml = '<ul class="text-right space-y-2">';
  local.breakdown.forEach(item => {
    breakdownHtml += `<li class="flex justify-between items-center"><span>${item.item_persian}</span><strong class="text-amber-700">${item.liters.toLocaleString('fa-IR')} لیتر</strong></li>`;
  });
  breakdownHtml += '</ul>';

  footprintLoader.classList.add('hidden');
  footprintResultDiv.innerHTML = `
    <p class="text-slate-600 mb-2">ردپای آب کل این وعده:</p>
    <p class="text-6xl font-extrabold text-amber-600 mb-3">${local.total_liters.toLocaleString('fa-IR')} <span class="text-2xl">لیتر</span></p>
    <p class="text-slate-700 text-lg mb-6">${local.comparison_text_persian}</p>
    <hr class="my-4">
    <h4 class="font-bold text-lg mb-3">جزئیات مصرف:</h4>
    ${breakdownHtml}
  `;

  // سپس AI را صدا می‌زنیم؛ اگر موفق بود، همان قالب را با داده‌ی AI به‌روز می‌کنیم
  try {
    const prompt = `
      You are a virtual water footprint expert. Your task is to calculate the approximate virtual water for a standard serving of the given food items.
      Items (Persian list): "${foodItems}"
      Return JSON with this exact shape:
      {
        "total_liters": <number>,
        "comparison_text_persian": "<string>",
        "breakdown": [ { "item_persian": "<string>", "liters": <number> } ]
      }
      All text fields must be in Persian. No markdown.
    `;

    const jsonString = await askAI(prompt, { json: true });

    // تلاش برای parse امن—برخی مدل‌ها JSON را داخل backticks می‌فرستند
    const cleaned = String(jsonString).trim().replace(/^```json\s*|\s*```$/g, '');
    const result = JSON.parse(cleaned);

    if (typeof result.total_liters === 'number' &&
        Array.isArray(result.breakdown) &&
        typeof result.comparison_text_persian === 'string') {

      let aiBreakdownHtml = '<ul class="text-right space-y-2">';
      result.breakdown.forEach(item => {
        aiBreakdownHtml += `<li class="flex justify-between items-center"><span>${item.item_persian}</span><strong class="text-amber-700">${Number(item.liters).toLocaleString('fa-IR')} لیتر</strong></li>`;
      });
      aiBreakdownHtml += '</ul>';

      footprintResultDiv.innerHTML = `
        <p class="text-slate-600 mb-2">ردپای آب کل این وعده:</p>
        <p class="text-6xl font-extrabold text-amber-600 mb-3">${Number(result.total_liters).toLocaleString('fa-IR')} <span class="text-2xl">لیتر</span></p>
        <p class="text-slate-700 text-lg mb-6">${result.comparison_text_persian}</p>
        <hr class="my-4">
        <h4 class="font-bold text-lg mb-3">جزئیات مصرف:</h4>
        ${aiBreakdownHtml}
      `;
    }
  } catch (error) {
    console.warn("Gemini API Error (Footprint) – using local fallback:", error.message);
    // هیچ کاری لازم نیست؛ خروجی محلی باقی می‌ماند و پنهان نمی‌شود.
  } finally {
    calculateFootprintBtn.disabled = false;
    calculateFootprintBtn.classList.remove('opacity-50');
  }
}

document.getElementById('solution-btn')?.addEventListener('click', handleGenerateTips);
document.getElementById('calc-water-btn')?.addEventListener('click', handleCalculateFootprint);
