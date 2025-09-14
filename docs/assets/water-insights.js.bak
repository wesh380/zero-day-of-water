      const hasChart = !!window.Chart;
      document.addEventListener('DOMContentLoaded', () => {
        // همه ایموجی‌ها را به SVG توییتر تبدیل کن (از جمله 🇮🇷)
        if (window.twemoji) {
          twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
        }
      });



(function(){
  function initSimulatorUI(){
    const cs = document.getElementById('cut-slider');
    const rs = document.getElementById('rain-slider');
    const cv = document.getElementById('cut-value');
    const rv = document.getElementById('rain-value');
    if(!cs || !rs || !cv || !rv) return; // DOM not ready or ids wrong

    const sync = () => {
      if (cv && cs) cv.textContent = String(cs.value);
      if (rv && rs) rv.textContent = String(rs.value);
    };

    ['input','change'].forEach(evt => {
      cs.addEventListener(evt, sync, { passive: true });
      rs.addEventListener(evt, sync, { passive: true });
    });

    // مقدار اولیه
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulatorUI, { once:true });
  } else {
    initSimulatorUI();
  }
})();
    



  function setLoading(el, on=true) {
    if (!el) return;
    if (on) {
      if (!el.dataset.prev) el.dataset.prev = el.innerHTML;
      el.textContent = '✨ در حال پردازش…';
      el.classList.add('opacity-90','animate-pulse');
      el.disabled = true;
    } else {
      if (el.dataset.prev) {
        el.innerHTML = el.dataset.prev;
        el.classList.remove('opacity-90','animate-pulse');
        el.disabled = false;
        delete el.dataset.prev;
      }
    }
  }

  // 1) ردپای پنهان آبِ غذا
  (function wireFootprint(){
    const btn = document.getElementById('btn-footprint');
    const inp = document.getElementById('food-input');
    const out = document.getElementById('out-footprint');
    const thinking = document.getElementById('ai-thinking');
    if (!btn || !inp || !out || !thinking) return;

    function renderSkeleton(){
      out.innerHTML = '<div class="space-y-2 animate-pulse"><div class="h-4 bg-gray-200 rounded"></div><div class="h-4 bg-gray-200 rounded w-5/6"></div><div class="h-4 bg-gray-200 rounded w-4/6"></div></div>';
    }

    function clearSkeleton(){
      out.innerHTML = '';
    }

    function showThinkingUI(){
      thinking.classList.remove('hidden');
      setLoading(btn, true);
      inp.setAttribute('aria-busy','true');
    }

    function hideThinkingUI(){
      thinking.classList.add('hidden');
      setLoading(btn, false);
      inp.removeAttribute('aria-busy');
    }

    btn.addEventListener('click', async () => {
      const foods = (inp.value || '').trim();
      if (!foods) { out.textContent = 'لطفاً مواد غذایی را وارد کنید.'; out.focus(); return; }

      clearSkeleton();
      renderSkeleton();
      showThinkingUI();

      try {
        const basePrompt = `
You are a virtual water footprint expert.
Input: list of food items in Persian.
Task: Calculate the total water footprint in liters and provide a short comparison in Persian (e.g., equivalent showers).
Your output MUST be a JSON object with this structure:
{
  "total_liters": <number>,
  "comparison_text_persian": "<string>",
  "details": [
    {"item": "<string>", "liters": <number>}
  ]
}
All numbers must be numeric (no units attached in JSON).
`;

        const text = await askAI(`${basePrompt}\nFood list: ${foods}`, { model: 'gemini-2.0-flash' });
        console.log("Raw API response:", text);
        const clean = text.replace(/```json|```/g, '').trim();

        let data;
        try {
          data = JSON.parse(clean);
        } catch (e) {
          clearSkeleton();
          out.textContent = '⚠️ پاسخ نامعتبر';
          console.warn('Invalid JSON');
          return;
        }
        if (
          typeof data.total_liters !== 'number' ||
          !Array.isArray(data.details) ||
          !data.details.every(d => typeof d.item === 'string' && typeof d.liters === 'number')
        ) {
          clearSkeleton();
          out.textContent = '⚠️ پاسخ نامعتبر';
          return;
        }

        // ساخت خروجی
        clearSkeleton();
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-1';

        const total = document.createElement('p');
        total.className = 'text-4xl font-extrabold text-blue-600';
        total.textContent = nf.format(data.total_liters) + ' لیتر';

        const comparison = document.createElement('p');
        comparison.className = 'text-slate-600 mt-2';
        comparison.textContent = data.comparison_text_persian || '';

        const list = document.createElement('ul');
        list.className = 'mt-4 space-y-1';
        data.details.forEach(it => {
          const li = document.createElement('li');
          li.className = 'flex justify-between';
          const item = document.createElement('span');
          item.textContent = it.item;
          const liters = document.createElement('span');
          liters.textContent = nf.format(it.liters) + ' لیتر';
          li.append(item, liters);
          list.appendChild(li);
        });

        wrapper.append(total, comparison, list);
        out.appendChild(wrapper);
        out.focus();

      } catch(e){
        clearSkeleton();
        out.textContent = '⚠️ خطا در محاسبه.';
        out.focus();
        console.warn(e.message);
      } finally {
        hideThinkingUI();
      }
    });
  })();

  // 2) شبیه‌ساز آینده آب
  (function wireSimulator(){
    const btn = document.getElementById('btn-simulate');
    const rain = document.getElementById('rain-slider');
    const cut  = document.getElementById('cut-slider');
    const out  = document.getElementById('out-sim');
    if (!btn || !rain || !cut || !out) return;

    btn.addEventListener('click', async () => {
      try {
        setLoading(btn, true); out.textContent = '⏳';
        const rainVal = rain.value || rain.getAttribute('value') || '0';
        const cutVal  = cut.value  || cut.getAttribute('value')  || '0';
        const prompt =
`دستور: شبیه‌ساز منابع آب مشهد.
ورودی:
- تغییر بارش ماه آینده: ${rainVal} میلی‌متر
- کاهش مصرف همگانی: ${cutVal} درصد
خروجی JSON معتبر با ساختار:
{
  "bullets_fa":["نکته"],
  "impact_index":عدد,
  "note_fa":"متن"
}`;
        const text = await askAI(prompt, { model: 'gemini-2.0-flash' });
        let data; try { data = JSON.parse(text); } catch(_) { out.textContent = '⚠️ پاسخ نامعتبر.'; return; }
        const ul = document.createElement('ul');
        ul.className = 'list-disc pr-4';
        (data.bullets_fa || []).forEach(b => {
          const li = document.createElement('li');
          li.className = 'mb-1';
          li.textContent = b;
          ul.appendChild(li);
        });
        const impact = document.createElement('p');
        impact.className = 'font-bold mt-2';
        impact.textContent = 'شاخص تأثیر: ' + nf.format(data.impact_index);
        const note = document.createElement('p');
        note.className = 'mt-1';
        note.textContent = data.note_fa || '';
        out.replaceChildren(ul, impact, note);
      } catch(e){ out.textContent = '⚠️ خطا در شبیه‌سازی.'; console.warn(e.message); }
      finally { setLoading(btn, false); }
    });
  })();

  // 3) راهکارهای هوشمند شخصی‌سازی‌شده
  (function wireTips(){
    const btn = document.getElementById('btn-tips');
    const fam = document.getElementById('family-input') || document.querySelector('[name="familySize"]');
    const shw = document.getElementById('shower-input') || document.querySelector('[name="showerMins"]');
    const out = document.getElementById('out-tips');
    if (!btn || !fam || !shw || !out) return;

    btn.addEventListener('click', async () => {
      try {
        setLoading(btn, true); out.textContent = '⏳';
        const members = fam.value || '4';
        const shower  = shw.value || '10';
        const prompt =
`دستور: مشاور صرفه‌جویی آب هستی.
ورودی: خانواده ${members} نفره، زمان حمام ${shower} دقیقه.
۵ توصیه کوتاه ارائه بده.
خروجی JSON معتبر با ساختار:
{
  "bullets_fa":[{"tip":"متن","liters_per_day":عدد}]
}`;
        const text = await askAI(prompt, { model: 'gemini-2.0-flash' });
        let data; try { data = JSON.parse(text); } catch(_) { out.textContent = '⚠️ پاسخ نامعتبر.'; return; }
        const ul = document.createElement('ul');
        ul.className = 'list-disc pr-4';
        (data.bullets_fa || []).forEach(t => {
          const li = document.createElement('li');
          const tip = document.createElement('span');
          tip.textContent = t.tip + ': ';
          const strong = document.createElement('strong');
          strong.textContent = nf.format(t.liters_per_day) + ' لیتر/روز';
          li.appendChild(tip);
          li.appendChild(strong);
          ul.appendChild(li);
        });
        out.replaceChildren(ul);
      } catch(e){ out.textContent = '⚠️ خطا در تولید راهکار.'; console.warn(e.message); }
      finally { setLoading(btn, false); }
    });
  })();

    
