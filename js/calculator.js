// --- Water Calculator & Animations Module ---
function calculateWater() {
    const residents = parseInt(document.getElementById('calc-residents')?.value) || 1;
    const showerLength = parseInt(document.getElementById('calc-shower')?.value) || 8;
    const hasLeaks = document.getElementById('calc-leaks')?.value === 'yes';
    
    const baseUse = residents * 50;
    const showerUse = residents * showerLength * 2;
    const leakUse = hasLeaks ? 35 : 0;
    
    const dailyTotal = baseUse + showerUse + leakUse;
    
    let showerSavings = 0;
    if (showerLength > 5) {
        showerSavings = residents * (showerLength - 5) * 2;
    }
    const leakSavings = hasLeaks ? 35 : 0;
    const efficiencySavings = residents * 8;
    
    const totalSaved = showerSavings + leakSavings + efficiencySavings;
    
    const resultsBox = document.getElementById('calc-results-box');
    if (resultsBox) resultsBox.classList.remove('hidden');
    
    animateValue('water-use-val', Math.round(dailyTotal), 800);
    animateValue('water-saved-val', Math.round(totalSaved), 800);
}

function animateValue(id, end, duration = 1000) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    const rawCurrent = obj.innerText ? obj.innerText.replace(/[^0-9]/g, '') : '0';
    const start = parseInt(rawCurrent) || 0;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = currentVal.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
