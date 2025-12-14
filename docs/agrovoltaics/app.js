document.addEventListener('DOMContentLoaded', () => {
    // Input Elements
    const inputs = {
        landArea: document.getElementById('landArea'),
        solarCoverage: document.getElementById('solarCoverage'),
        electricityPrice: document.getElementById('electricityPrice'),
        cropRevenue: document.getElementById('cropRevenue'),
        cropYieldImpact: document.getElementById('cropYieldImpact'),
    };

    // Output Elements
    const outputs = {
        totalProfit: document.getElementById('totalProfit'),
        electricityRevenue: document.getElementById('electricityRevenue'),
        finalCropRevenue: document.getElementById('finalCropRevenue'),
        systemCapacity: document.getElementById('systemCapacity'),
        cropYieldValue: document.getElementById('cropYieldValue'),
    };

    const calculateBtn = document.getElementById('calculateBtn');

    // Constants
    const MW_PER_HECTARE = 1; // Assuming 1MWp installation capacity per hectare of fully covered land
    const SPECIFIC_YIELD = 1600; // kWh per kWp per year (Average for Iran)

    // Formatter
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fa-IR').format(Math.round(num));
    };

    const formatDecimal = (num) => {
        return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(num);
    };

    // Validation
    const validateInput = (input) => {
        if (input.type === 'number') {
            if (parseFloat(input.value) < 0) {
                input.value = 0;
            }
        }
        // Specific checks
        if (input.id === 'solarCoverage' && parseFloat(input.value) > 100) {
            input.value = 100;
        }
    };

    // Calculation Logic
    const calculate = () => {
        // Get values
        const landArea = parseFloat(inputs.landArea.value) || 0;
        const solarCoverage = parseFloat(inputs.solarCoverage.value) || 0;
        const electricityPrice = parseFloat(inputs.electricityPrice.value) || 0;
        const cropRevenuePerHa = parseFloat(inputs.cropRevenue.value) || 0;
        const cropYieldImpact = parseFloat(inputs.cropYieldImpact.value) || 0;

        // 1. Calculate System Capacity (MW)
        // Capacity = Land Area (ha) * (Coverage % / 100) * MW_PER_HECTARE
        const capacityMW = landArea * (solarCoverage / 100) * MW_PER_HECTARE;

        // 2. Calculate Electricity Generation (kWh/year)
        // Gen = Capacity (MW) * 1000 (kW/MW) * Yield (kWh/kW)
        const generationKWh = capacityMW * 1000 * SPECIFIC_YIELD;

        // 3. Calculate Electricity Revenue
        const elecRevenue = generationKWh * electricityPrice;

        // 4. Calculate Agricultural Revenue
        // Base Revenue = Land Area * Revenue/ha
        // Adjusted Revenue = Base * (1 + Impact/100)
        // Note: The impact applies to the crop yield. We assume price is constant, so revenue scales with yield.
        // However, one might argue the impact only applies to the covered area or the whole area.
        // Given the slider is "Crop Yield Impact", we'll apply it to the whole area's yield for simplicity as a general factor.
        const baseAgriRevenue = landArea * cropRevenuePerHa;
        const agriRevenue = baseAgriRevenue * (1 + (cropYieldImpact / 100));

        // 5. Total Profit
        const total = elecRevenue + agriRevenue;

        // Update UI
        outputs.systemCapacity.textContent = formatDecimal(capacityMW);
        outputs.electricityRevenue.textContent = formatNumber(elecRevenue);
        outputs.finalCropRevenue.textContent = formatNumber(agriRevenue);
        outputs.totalProfit.textContent = formatNumber(total);

        // Update slider label
        outputs.cropYieldValue.textContent = `${cropYieldImpact > 0 ? '+' : ''}${formatNumber(cropYieldImpact)}%`;

        // Update slider color/direction indication if needed
        if (cropYieldImpact < 0) {
            outputs.cropYieldValue.classList.add('text-red-600');
            outputs.cropYieldValue.classList.remove('text-green-600', 'text-slate-900');
        } else if (cropYieldImpact > 0) {
            outputs.cropYieldValue.classList.add('text-green-600');
            outputs.cropYieldValue.classList.remove('text-red-600', 'text-slate-900');
        } else {
            outputs.cropYieldValue.classList.add('text-slate-900');
            outputs.cropYieldValue.classList.remove('text-red-600', 'text-green-600');
        }
    };

    // Event Listeners
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', (e) => {
            validateInput(e.target);
            calculate();
        });
    });

    calculateBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevent form submission if wrapped in form
        calculate();
    });

    // Initial calculation
    calculate();
});
