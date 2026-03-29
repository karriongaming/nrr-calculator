document.getElementById('calculate-btn').addEventListener('click', calculateNRR);
document.getElementById('reset-btn').addEventListener('click', resetForm);

/**
 * CONVERSION LOGIC: Cricket (Base-6) to True Decimal (Base-10)
 * Logic: Split the input by the decimal point.
 * The left side is whole overs. The right side is balls.
 * Result = Overs + (Balls / 6)
 */
function cricketOversToDecimal(inputVal) {
    if (!inputVal) return 0;
    
    const valString = inputVal.toString();
    const parts = valString.split('.');
    
    const wholeOvers = parseInt(parts[0], 10) || 0;
    let balls = 0;

    if (parts.length > 1) {
        // Take only the first digit after the decimal as the ball count
        balls = parseInt(parts[1].substring(0, 1), 10);
        
        // Validation: Cricket cannot have .6, .7, .8, or .9 balls
        if (balls >= 6) {
            throw new Error(`Invalid Overs: "${inputVal}". In cricket, the part after the decimal (balls) must be between 1 and 5.`);
        }
    }

    return wholeOvers + (balls / 6);
}

function calculateNRR() {
    // UI Elements
    const errorEl = document.getElementById('error-msg');
    const resultContainer = document.getElementById('result-container');
    const nrrDisplay = document.getElementById('nrr-value');
    const debugEl = document.getElementById('math-debug');

    try {
        // Clear previous state
        errorEl.classList.add('hidden');
        debugEl.textContent = "";

        // 1. Get Match Settings
        const maxQuota = parseFloat(document.getElementById('max-overs').value);
        if (!maxQuota || maxQuota <= 0) throw new Error("Please set the Maximum Match Overs.");

        // 2. Process Team A (Scored)
        const runsFor = parseFloat(document.getElementById('runs-for').value) || 0;
        const rawOversFaced = document.getElementById('overs-faced').value;
        const isAllOutFor = document.getElementById('all-out-for').checked;

        // Apply "All Out" Rule vs Conversion Logic
        const effectiveOversFaced = isAllOutFor ? maxQuota : cricketOversToDecimal(rawOversFaced);

        // 3. Process Team B (Conceded)
        const runsAgainst = parseFloat(document.getElementById('runs-against').value) || 0;
        const rawOversBowled = document.getElementById('overs-bowled').value;
        const isAllOutAgainst = document.getElementById('all-out-against').checked;

        const effectiveOversBowled = isAllOutAgainst ? maxQuota : cricketOversToDecimal(rawOversBowled);

        // 4. Edge Case: Prevent Division by Zero
        if (effectiveOversFaced === 0 || effectiveOversBowled === 0) {
            throw new Error("Overs faced/bowled cannot be zero unless the match quota is also zero.");
        }

        // 5. NRR Math
        const forRate = runsFor / effectiveOversFaced;
        const againstRate = runsAgainst / effectiveOversBowled;
        const nrr = forRate - againstRate;

        // 6. Display Result
        resultContainer.classList.remove('hidden');
        nrrDisplay.textContent = (nrr > 0 ? "+" : "") + nrr.toFixed(3);
        
        // Visual Feedback
        nrrDisplay.className = nrr >= 0 ? "positive" : "negative";

        // Optional Math Debug for user confidence
        debugEl.textContent = `Math Check: Calculated using ${effectiveOversFaced.toFixed(3)} overs faced and ${effectiveOversBowled.toFixed(3)} overs bowled.`;

    } catch (err) {
        resultContainer.classList.remove('hidden');
        nrrDisplay.textContent = "0.000";
        nrrDisplay.className = "";
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    }
}

function resetForm() {
    // Clear all number inputs
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        if (input.id === 'max-overs') {
            input.value = 20; // Default back to T20
        } else {
            input.value = "";
        }
    });

    // Uncheck boxes
    const checks = document.querySelectorAll('input[type="checkbox"]');
    checks.forEach(c => c.checked = false);

    // Hide results
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('error-msg').classList.add('hidden');
}
