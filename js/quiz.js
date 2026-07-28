// --- Programme Eligibility Match Quiz Module ---
function quizNext(step) {
    ['q-step-1', 'q-step-2', 'q-step-3', 'q-result'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
        }
    });
    
    const activePane = document.getElementById(`q-step-${step}`);
    if (activePane) {
        activePane.classList.remove('hidden');
        activePane.classList.add('active');
    }
}

function processQuizResults() {
    const ageChecked = document.querySelector('input[name="age-group"]:checked');
    const interestChecked = document.querySelector('input[name="interest"]:checked');
    
    const ageVal = ageChecked ? ageChecked.value : 'youth';
    const interestVal = interestChecked ? interestChecked.value : 'boats';
    
    const resultPane = document.getElementById('q-result');
    const matchedTitle = document.getElementById('matched-title');
    const matchedDesc = document.getElementById('matched-description');
    const quizCta = document.getElementById('quiz-cta');
    
    ['q-step-1', 'q-step-2', 'q-step-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
        }
    });
    
    if (resultPane) {
        resultPane.classList.remove('hidden');
        resultPane.classList.add('active');
    }
    
    if (ageVal === 'kids') {
        if (matchedTitle) matchedTitle.innerText = "CYEN Skills - Eco-Explorers";
        if (matchedDesc) matchedDesc.innerText = "For ages 10-13, our CYEN partnership provides eco-exploration, recycling games, and climate literacy workshops. A fun, safe, hands-on path for young leaders.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('cyen')");
    } else if (interestVal === 'boats') {
        if (matchedTitle) matchedTitle.innerText = "Youth of the Seas (YOTS) Boat Building";
        if (matchedDesc) matchedDesc.innerText = "Based on your interest in craftsmanship and marine sectors, you qualify for our 12-week Cohort intake. Build disaster-resilient vessels and learn engine repair.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('yots')");
    } else if (interestVal === 'water') {
        if (matchedTitle) matchedTitle.innerText = "Water Conservation Initiative";
        if (matchedDesc) matchedDesc.innerText = "Your interests fit our community-led water saving action. Participate in household checkups, monitoring systems, and local awareness campaigns.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('water')");
    } else if (interestVal === 'business') {
        if (matchedTitle) matchedTitle.innerText = "Eco Village: Earn & Grow Zonal Pathway";
        if (matchedDesc) matchedDesc.innerText = "You align with sustainable agri-business, crop marketing, and hydroponics. Learn how to launch your own food security micro-enterprise.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('ecovillage')");
    } else {
        if (matchedTitle) matchedTitle.innerText = "Pinelands Pavilion: Career Discovery";
        if (matchedDesc) matchedDesc.innerText = "We recommend joining the Pinelands exploration days. Explore sports performance, global studies, remote digital skills, and wellness markets.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('pinelands')");
    }
}

function resetQuiz() {
    quizNext(1);
}

window.quizNext = quizNext;
window.processQuizResults = processQuizResults;
window.resetQuiz = resetQuiz;
