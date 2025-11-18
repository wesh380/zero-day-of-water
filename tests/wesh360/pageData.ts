export interface PageTarget {
  path: string;
  title: string;
  note?: string;
}

export const importantPages: PageTarget[] = [
  { path: '/', title: 'Landing page' },
  { path: '/dashboards/', title: 'Dashboards hub' },
  { path: '/calculators/', title: 'Calculators landing' },
  { path: '/water/hub', title: 'Water hub' },
  { path: '/water/insights.html', title: 'Water insights & household dashboard' },
  { path: '/water/cost-calculator.html', title: 'Water cost calculator' },
  { path: '/water/cld/', title: 'Water CLD' },
  { path: '/electricity/', title: 'Electricity hub' },
  { path: '/electricity/peak.html', title: 'Electricity peak dashboard' },
  { path: '/electricity/quality.html', title: 'Electricity quality dashboard' },
  { path: '/electricity/power-tariff.html', title: 'Electricity tariff explorer' },
  { path: '/solar/', title: 'Solar landing', note: 'Mostly teaser/coming-soon content' },
  { path: '/solar/plant/', title: 'Solar plant calculator' },
  { path: '/solar/agrivoltaics/', title: 'Solar agrivoltaics' },
  { path: '/agrovoltaics/', title: 'Agrovoltaics calculator' },
  { path: '/gas/', title: 'Gas landing', note: 'Placeholder section (MVP state)' },
  { path: '/gas/energy.html', title: 'Gas energy flows' },
  { path: '/gas/fuel-carbon.html', title: 'Gas fuel carbon' },
  { path: '/environment/', title: 'Environment landing', note: 'Placeholder / coming soon page' },
  { path: '/research/', title: 'Research data request page' },
  { path: '/contact/', title: 'Contact form' },
  { path: '/responsible-disclosure/', title: 'Security policy' },
];

export interface PageAction {
  role: 'link' | 'button';
  name: string | RegExp;
  exact?: boolean;
  navigates?: boolean;
  target?: string;
  assertVisibleSelector?: string;
}

export interface PageInteraction {
  path: string;
  description: string;
  actions: PageAction[];
}

export const primaryInteractions: PageInteraction[] = [
  {
    path: '/',
    description: 'Homepage navigation buttons',
    actions: [
      { role: 'link', name: 'محاسبه‌گر', navigates: true, target: '/calculators/' },
      { role: 'link', name: 'درخواست داده پژوهشی', navigates: true, target: '/research/' },
      { role: 'link', name: 'مشاهده آمار و گزارش‌ها', navigates: true, target: '/dashboards/' },
    ],
  },
  {
    path: '/water/hub',
    description: 'Water hub CTAs',
    actions: [
      { role: 'link', name: 'شروع محاسبه', navigates: true, target: '/water/cost-calculator.html' },
      { role: 'link', name: 'راهنمای استفاده', navigates: true, target: '/research/' },
      { role: 'link', name: 'نمونه تحلیل‌ها', navigates: true, target: '/water/insights.html' },
      { role: 'link', name: 'پرسش‌های متداول', navigates: true, target: '/contact/' },
    ],
  },
  {
    path: '/water/cost-calculator.html',
    description: 'Water cost calculator action buttons',
    actions: [
      { role: 'button', name: 'به‌روزرسانی محاسبات' },
    ],
  },
  {
    path: '/solar/plant/',
    description: 'Solar plant calculator actions',
    actions: [
      { role: 'button', name: 'محاسبه' },
      { role: 'button', name: 'بازنشانی' },
    ],
  },
  {
    path: '/research/',
    description: 'Research request key links',
    actions: [
      { role: 'button', name: 'ارسال درخواست', assertVisibleSelector: '#requestForm' },
      { role: 'link', name: 'سیاست امنیت', navigates: true, target: '/responsible-disclosure/' },
    ],
  },
];
