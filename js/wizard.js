// --- Pinelands Career Path Wizard Module ---
let wizardAnswers = {};

function nextWizardStep(choice) {
    wizardAnswers.step1 = choice;
    document.getElementById('wiz-step-1')?.classList.add('hidden');
    document.getElementById('wiz-step-2')?.classList.remove('hidden');
}

function finishWizard(choice) {
    wizardAnswers.step2 = choice;
    document.getElementById('wiz-step-2')?.classList.add('hidden');
    
    const resultBox = document.getElementById('wiz-result');
    const resultTitle = document.getElementById('wiz-result-title');
    const resultDesc = document.getElementById('wiz-result-desc');
    
    if (resultBox) resultBox.classList.remove('hidden');
    
    if (wizardAnswers.step1 === 'outdoor' && wizardAnswers.step2 === 'green') {
        if (resultTitle) resultTitle.innerText = "Zone 3: Build the Future & Zone 1";
        if (resultDesc) resultDesc.innerText = "You are a natural fit for sustainability engineering, eco-village farming, or resilient boat construction. Your path aligns with climate mitigation!";
    } else if (wizardAnswers.step1 === 'outdoor' && wizardAnswers.step2 === 'business') {
        if (resultTitle) resultTitle.innerText = "Zone 6: Sports & Performance";
        if (resultDesc) resultDesc.innerText = "Your interests lead toward coastal stewardship, sports leadership, ocean diving charters, or performance arts administration.";
    } else if (wizardAnswers.step1 === 'office' && wizardAnswers.step2 === 'digital') {
        if (resultTitle) resultTitle.innerText = "Zone 4: Tech & Digital";
        if (resultDesc) resultDesc.innerText = "You align perfectly with high-growth digital arenas. Remote work, media design, software engineering, and global digital markets fit your path.";
    } else if (wizardAnswers.step2 === 'digital') {
        if (resultTitle) resultTitle.innerText = "Zone 4: Tech & Digital";
        if (resultDesc) resultDesc.innerText = "Global tech connections, digital marketing, and remote services represent your fastest pathway to modern job creation.";
    } else {
        if (resultTitle) resultTitle.innerText = "Zone 2: Entrepreneurship & Emerging Markets";
        if (resultDesc) resultDesc.innerText = "You show high potential for starting local businesses, managing creative industries, launching wellness services, or farming cooperatives.";
    }
}

function resetWizard() {
    wizardAnswers = {};
    document.getElementById('wiz-result')?.classList.add('hidden');
    document.getElementById('wiz-step-2')?.classList.add('hidden');
    document.getElementById('wiz-step-1')?.classList.remove('hidden');
}
