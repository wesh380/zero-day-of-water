/**
 * Solar Risk Calculator for Iran (SATBA/Mehrsun pre-check)
 * This file now implements the risk-focused questionnaire and wizard UI.
 * The previous financial/economic calculator has been retired from docs/solar/plant/index.html.
 */

const RISK_CONFIG_URL = "/config/solar-risk-calculator.json";

const EMBEDDED_RISK_CONFIG = Object.freeze({
  domains: [
    { id: "fx_capex", weight: 0.35, label: "ریسک ارزی و هزینه تجهیزات" },
    { id: "policy_tariff", weight: 0.35, label: "ریسک قانون، تعرفه و ساتبا" },
    { id: "finance_liquidity", weight: 0.3, label: "ریسک مالی و نقدینگی" }
  ],
  questions: [
    {
      id: "fx_import_share",
      domain_id: "fx_capex",
      label: "چه درصدی از تجهیزات پروژه وارداتی است؟",
      options: [
        { value: "lt25", label: "زیر ۲۵٪ وارداتی", score: 1 },
        { value: "25_50", label: "بین ۲۵٪ تا ۵۰٪ وارداتی", score: 2 },
        { value: "50_75", label: "بین ۵۰٪ تا ۷۵٪ وارداتی", score: 4 },
        { value: "gt75", label: "بیش از ۷۵٪ وارداتی", score: 5 }
      ]
    },
    {
      id: "fx_supply_source",
      domain_id: "fx_capex",
      label: "منبع اصلی تأمین تجهیزات شما چیست؟",
      options: [
        { value: "local_contract", label: "تأمین داخلی با قرارداد بلندمدت", score: 1 },
        { value: "mixed", label: "ترکیبی از داخلی و واردات", score: 3 },
        { value: "spot_import", label: "خرید اسپات ارزی و واردات", score: 5 }
      ]
    },
    {
      id: "policy_contract_type",
      domain_id: "policy_tariff",
      label: "نوع قرارداد مدنظر شما با ساتبا چیست؟",
      options: [
        { value: "guaranteed_feed_in", label: "خرید تضمینی با تعرفه ثابت/تصاعدی", score: 1 },
        { value: "indexed_feed_in", label: "قرارداد شاخص‌محور (تورم/ارز)", score: 2 },
        { value: "merchant", label: "فروش آزاد/بازار رقابتی", score: 4 }
      ]
    },
    {
      id: "policy_tariff_visibility",
      domain_id: "policy_tariff",
      label: "دید شما نسبت به پایداری تعرفه‌ها و سیاست ساتبا چیست؟",
      options: [
        { value: "stable", label: "تصویب شده و پایدار (ریسک کم)", score: 1 },
        { value: "uncertain", label: "محتمل ولی نامطمئن", score: 3 },
        { value: "volatile", label: "تغییرات زیاد و غیرقابل پیش‌بینی", score: 5 }
      ]
    },
    {
      id: "finance_bank_dependency",
      domain_id: "finance_liquidity",
      label: "وابستگی پروژه به تسهیلات بانکی چقدر است؟",
      options: [
        { value: "lt25", label: "زیر ۲۵٪ سرمایه از تسهیلات", score: 1 },
        { value: "25_50", label: "۲۵٪ تا ۵۰٪ سرمایه از تسهیلات", score: 3 },
        { value: "gt50", label: "بیش از ۵۰٪ سرمایه از تسهیلات", score: 5 }
      ]
    },
    {
      id: "finance_liquidity_buffer",
      domain_id: "finance_liquidity",
      label: "نقدینگی پوشش‌دهنده تأخیرها و نوسان‌ها چقدر است؟",
      options: [
        { value: "gt12m", label: "بیش از ۱۲ ماه هزینه پوشش داده می‌شود", score: 1 },
        { value: "6_12m", label: "بین ۶ تا ۱۲ ماه پوشش", score: 3 },
        { value: "lt6m", label: "کمتر از ۶ ماه پوشش", score: 5 }
      ]
    }
  ],
  bands: [
    { id: "low", min: 0, max: 30, label: "کم" },
    { id: "medium", min: 30, max: 60, label: "متوسط" },
    { id: "high", min: 60, max: 100, label: "زیاد" }
  ]
});

const riskState = { config: null };

const wizardState = {
  currentStep: 1,
  totalSteps: 3,
  answers: {},
  questionsByStep: {}
};

// Lightweight risk calculator (MVP) that is now wired to the UI.
export const riskCalculator = {
  async initRiskCalculator(configUrl = RISK_CONFIG_URL) {
    const remoteConfig = await loadRiskConfig(configUrl);
    const effectiveConfig = remoteConfig ?? cloneConfig(EMBEDDED_RISK_CONFIG);

    if (!effectiveConfig) {
      console.error("risk-calculator: config not available");
      return null;
    }

    riskState.config = effectiveConfig;
    console.log("risk-calculator: loaded", { fromRemote: Boolean(remoteConfig) });
    return effectiveConfig;
  },

  computeRiskScore(answers = {}) {
    const config = riskState.config ?? cloneConfig(EMBEDDED_RISK_CONFIG);
    if (!config) {
      throw new Error("risk-calculator: config is missing; call initRiskCalculator first");
    }

    const domainScores = {};
    let finalScore = 0;

    for (const domain of config.domains ?? []) {
      const domainQuestions = (config.questions ?? []).filter((question) => question.domain_id === domain.id);
      const selectedScores = domainQuestions
        .map((question) => {
          const selectedValue = answers?.[question.id];
          const option = (question.options ?? []).find((item) => item.value === selectedValue);
          return Number(option?.score);
        })
        .filter((score) => Number.isFinite(score));

      const averageScore = selectedScores.length ? sumArray(selectedScores) / selectedScores.length : null;
      const normalizedScore = Number.isFinite(averageScore) ? normalizeScoreTo100(averageScore) : 0;
      const weight = Number(domain?.weight) || 0;

      domainScores[domain.id] = {
        averageRaw: averageScore,
        normalized: normalizedScore,
        weight
      };

      finalScore += normalizedScore * weight;
    }

    const band = this.mapScoreToBand(finalScore);
    const result = { finalScore, band, domainScores };
    console.log("risk-calculator: computeRiskScore", result);
    return result;
  },

  mapScoreToBand(score) {
    const config = riskState.config ?? cloneConfig(EMBEDDED_RISK_CONFIG);
    const bands = config?.bands ?? [];
    const matched = bands.find((band) => Number(score) >= Number(band.min) && Number(score) <= Number(band.max));
    return matched ? { bandId: matched.id, bandLabel: matched.label } : { bandId: "unknown", bandLabel: "نامشخص" };
  },

  getQuestionsByStep() {
    const config = riskState.config ?? cloneConfig(EMBEDDED_RISK_CONFIG);
    if (!config) {
      return {};
    }

    const byDomain = (domainId) => (config.questions ?? []).filter((question) => question.domain_id === domainId);

    return {
      1: byDomain("fx_capex"),
      2: byDomain("policy_tariff"),
      3: byDomain("finance_liquidity")
    };
  }
};

export async function initSolarRiskCalculatorPage(root = document) {
  try {
    await riskCalculator.initRiskCalculator();
    initRiskWizardUI(root);
  } catch (error) {
    console.error("solar-risk: failed to initialize", error);
  }
}

function initRiskWizardUI(root = document) {
  const wizard = root.getElementById("risk-wizard");
  const stepsIndicator = root.getElementById("risk-steps-indicator");
  const stepContent = root.getElementById("risk-step-content");
  const prevBtn = root.getElementById("risk-prev-btn");
  const nextBtn = root.getElementById("risk-next-btn");
  const resultSection = root.getElementById("risk-result");
  const scoreText = root.getElementById("risk-score-text");
  const scoreBar = root.getElementById("risk-score-bar");
  const interpretation = root.getElementById("risk-interpretation");
  const validationMessage = root.getElementById("risk-validation-message");

  if (!wizard || !stepsIndicator || !stepContent || !prevBtn || !nextBtn || !resultSection || !scoreText || !scoreBar || !interpretation) {
    console.warn("solar-risk: required DOM nodes not found; wizard will not render");
    return;
  }

  wizardState.questionsByStep = riskCalculator.getQuestionsByStep();
  wizardState.totalSteps = Object.keys(wizardState.questionsByStep).length || 3;
  wizardState.currentStep = 1;

  const renderStep = () => {
    renderStepIndicator(stepsIndicator);
    renderQuestions(stepContent);
    updateNavButtons();
    hideValidation();
  };

  const renderStepIndicator = (container) => {
    const fragments = [];
    for (let step = 1; step <= wizardState.totalSteps; step += 1) {
      const isActive = step === wizardState.currentStep;
      const baseClasses = "px-3 py-2 rounded-lg border text-sm";
      const activeClasses = isActive ? "bg-primary text-white border-primary" : "bg-slate-100 text-slate-700 border-slate-200";
      fragments.push(`<span class="${baseClasses} ${activeClasses}">گام ${step} از ${wizardState.totalSteps}</span>`);
    }
    container.innerHTML = fragments.join("");
  };

  const renderQuestions = (container) => {
    const questions = wizardState.questionsByStep[wizardState.currentStep] || [];
    container.innerHTML = "";

    questions.forEach((question) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "space-y-2 rounded-xl border border-slate-200 bg-white p-4";

      const legend = document.createElement("legend");
      legend.className = "text-base font-semibold text-slate-900";
      legend.textContent = question.label;
      fieldset.appendChild(legend);

      const optionsWrapper = document.createElement("div");
      optionsWrapper.className = "space-y-2";

      (question.options || []).forEach((option) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 text-sm text-slate-800";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = question.id;
        input.value = option.value;
        input.className = "h-4 w-4 border-slate-300 text-primary focus:ring-primary";
        input.checked = wizardState.answers[question.id] === option.value;

        label.appendChild(input);

        const text = document.createElement("span");
        text.textContent = option.label;
        label.appendChild(text);

        optionsWrapper.appendChild(label);
      });

      fieldset.appendChild(optionsWrapper);
      container.appendChild(fieldset);
    });
  };

  const collectStepAnswers = () => {
    const questions = wizardState.questionsByStep[wizardState.currentStep] || [];
    const stepAnswers = {};
    for (const question of questions) {
      const selected = root.querySelector(`input[name="${question.id}"]:checked`);
      if (!selected) {
        return null;
      }
      stepAnswers[question.id] = selected.value;
    }
    return stepAnswers;
  };

  const hideWizardShowResult = (scoreResult) => {
    wizard.classList.add("hidden");
    resultSection.classList.remove("hidden");

    const safeScore = clamp(Math.round(scoreResult.finalScore), 0, 100);
    const bandLabel = scoreResult.band?.bandLabel ?? "نامشخص";

    scoreText.textContent = `امتیاز ریسک شما: ${safeScore} از ۱۰۰ – سطح ریسک: ${bandLabel}`;
    scoreBar.style.width = `${safeScore}%`;
    interpretation.textContent = buildInterpretation(scoreResult.band?.bandId);
  };

  const showValidation = (message) => {
    if (!validationMessage) return;
    validationMessage.textContent = message;
    validationMessage.classList.remove("hidden");
  };

  const hideValidation = () => {
    if (!validationMessage) return;
    validationMessage.textContent = "";
    validationMessage.classList.add("hidden");
  };

  const updateNavButtons = () => {
    prevBtn.disabled = wizardState.currentStep === 1;
    nextBtn.textContent = wizardState.currentStep === wizardState.totalSteps ? "محاسبه ریسک" : "مرحله بعد";
  };

  prevBtn.addEventListener("click", () => {
    if (wizardState.currentStep <= 1) return;
    wizardState.currentStep -= 1;
    renderStep();
  });

  nextBtn.addEventListener("click", () => {
    hideValidation();
    const stepAnswers = collectStepAnswers();
    if (!stepAnswers) {
      showValidation("لطفاً به همه پرسش‌های این مرحله پاسخ دهید.");
      return;
    }

    wizardState.answers = { ...wizardState.answers, ...stepAnswers };

    if (wizardState.currentStep < wizardState.totalSteps) {
      wizardState.currentStep += 1;
      renderStep();
      return;
    }

    const scoreResult = riskCalculator.computeRiskScore(wizardState.answers);
    hideWizardShowResult(scoreResult);
  });

  renderStep();
}

function buildInterpretation(bandId) {
  switch (bandId) {
    case "low":
      return "ریسک پروژه در محدوده قابل‌قبول برای سرمایه‌گذاران محافظه‌کار است؛ می‌توانید روی تکمیل مدارک ساتبا تمرکز کنید.";
    case "medium":
      return "برخی حوزه‌ها نیاز به پوشش یا مذاکره دارند؛ پیش از ثبت نهایی در مهرسان، سناریوهای کاهش ریسک را بررسی کنید.";
    case "high":
      return "سطح ریسک بالا است و بدون برنامه پوشش ارزی، تعهدات ساتبا یا نقدینگی کافی ممکن است پروژه پایدار نباشد.";
    default:
      return "نتیجه مشخص نیست؛ تنظیمات را دوباره بررسی کنید.";
  }
}

async function loadRiskConfig(url = RISK_CONFIG_URL) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load risk config: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("risk-calculator: loadRiskConfig error", error);
    return null;
  }
}

function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function sumArray(values) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

function normalizeScoreTo100(score) {
  // Scores are on a 1–5 scale; normalize to 0–100 where 1 => 0 and 5 => 100.
  const normalized = ((Number(score) - 1) / 4) * 100;
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Math.min(Math.max(normalized, 0), 100);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

document.addEventListener("DOMContentLoaded", () => {
  initSolarRiskCalculatorPage();
});
