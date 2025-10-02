'use strict';
(function () {
  const LAST_UPDATED = '۱۴۰۴/۰۵/۲۷';
  document.querySelectorAll('[data-last-updated]').forEach(el => {
    el.textContent = LAST_UPDATED;
  });

  function openSheet(sheet) {
    if (!sheet) return;
    sheet.classList.remove('hidden');
    const title = sheet.querySelector('[tabindex="-1"]');
    if (title) title.focus();
    document.body.classList.add('overflow-hidden');
  }

  function closeSheet(sheet) {
    if (!sheet) return;
    sheet.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  const policySheet = document.getElementById('policySheet');
  const mobileSheet = document.getElementById('mobileActionsSheet');
  const requestSheet = document.getElementById('requestSheet');
  const proposalSheet = document.getElementById('proposalSheet');

  function bindTrigger(btn, targetSheet, closeSheetEl) {
    if (!btn || !targetSheet) return;
    btn.addEventListener('click', () => {
      if (closeSheetEl) closeSheet(closeSheetEl);
      openSheet(targetSheet);
    });
  }

  bindTrigger(document.getElementById('policyBtn'), policySheet);
  bindTrigger(document.getElementById('mobileActionsBtn'), mobileSheet);
  bindTrigger(document.getElementById('mobilePolicyBtn'), policySheet, mobileSheet);
  bindTrigger(document.getElementById('openRequest'), requestSheet);
  bindTrigger(document.getElementById('openProposal'), proposalSheet);

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', e => {
      const sheet = e.target.closest('#policySheet, #mobileActionsSheet, #requestSheet, #proposalSheet');
      closeSheet(sheet);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      [policySheet, mobileSheet, requestSheet, proposalSheet].forEach(closeSheet);
    }
  });

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  const requestForm = document.getElementById('requestForm');
  if (requestForm && !requestForm.hasAttribute('data-netlify')) {
    requestForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(requestForm);
      const domains = data.getAll('حوزه‌ها').join(', ');
      let body = `نام و سازمان/دانشگاه: ${data.get('نام و سازمان') || ''}\n` +
        `ایمیل کاری: ${data.get('ایمیل') || ''}\n` +
        `خلاصه پژوهش: ${data.get('خلاصه پژوهش') || ''}\n` +
        `حوزه‌ها: ${domains}\n` +
        `بازه زمانی: ${data.get('بازه زمانی') || ''}\n` +
        `سطح جغرافیا: ${data.get('سطح جغرافیا') || ''}\n` +
        `سطح تجمیع: ${data.get('سطح تجمیع') || ''}\n` +
        `متغیرهای کلیدی: ${data.get('متغیرهای کلیدی') || ''}\n` +
        `هدف استفاده: ${data.get('هدف استفاده') || ''}\n` +
        `تاریخ مدنظر: ${data.get('تاریخ مدنظر') || ''}\n` +
        `پیوست لینک: ${data.get('پیوست لینک') || ''}`;
      const mailto = `mailto:data@wesh360.ir?subject=${encodeURIComponent('Research Data Request - WESH360')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      showToast('درخواست شما ثبت شد؛ خانهٔ هم‌افزایی انرژی و آب پیگیری را به‌صورت امن، قانونی و هدفمند انجام می‌دهد.');
      requestForm.reset();
    });
  }

  const proposalForm = document.getElementById('proposalForm');
  if (proposalForm && !proposalForm.hasAttribute('data-netlify')) {
    proposalForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(proposalForm);
      let body = `عنوان پروژه: ${data.get('عنوان پروژه') || ''}\n` +
        `مسئله پژوهش: ${data.get('مسئله پژوهش') || ''}\n` +
        `روش یا داده موردنیاز: ${data.get('روش یا داده موردنیاز') || ''}\n` +
        `خروجی مدنظر: ${data.get('خروجی مدنظر') || ''}\n` +
        `زمان‌بندی: ${data.get('زمان‌بندی') || ''}\n` +
        `لینک رزومه: ${data.get('لینک رزومه') || ''}`;
      const mailto = `mailto:data@wesh360.ir?subject=${encodeURIComponent('Research Collaboration Proposal - WESH360')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      showToast('درخواست شما ثبت شد؛ خانهٔ هم‌افزایی انرژی و آب پیگیری را به‌صورت امن، قانونی و هدفمند انجام می‌دهد.');
      proposalForm.reset();
    });
  }
})();

