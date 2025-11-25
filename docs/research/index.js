'use strict';
(function () {
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

})();

