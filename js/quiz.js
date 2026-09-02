// --- Programme Eligibility Match Quiz Module ---

const quizQuestions = [
    {
        step: 1,
        counterText: "QUESTION 1 OF 3",
        question: "What is your age group?",
        options: [
            { value: "kids", title: "Ages 10 – 13", subtitle: "Junior Rising · discovery & eco-clubs" },
            { value: "teens", title: "Ages 14 – 17", subtitle: "Teen Rising · skills & mentorship" },
            { value: "youth", title: "Ages 18 – 29", subtitle: "GreenPath · training & job placement" }
        ]
    },
    {
        step: 2,
        counterText: "QUESTION 2 OF 3",
        question: "What is your primary goal or area of interest?",
        options: [
            { value: "water", title: "Water Resource Preservation", subtitle: "Water Conservation · community leak checks & rainwater harvesting" },
            { value: "marine", title: "Maritime & Marine Heritage", subtitle: "Tomorrow's Reef · underwater ocean heritage & reef restoration" }
        ]
    },
    {
        step: 3,
        counterText: "QUESTION 3 OF 3",
        question: "What is your current education or employment status?",
        options: [
            { value: "school", title: "Enrolled in Primary / Secondary School", subtitle: "Eco-Explorers & Youth Clubs" },
            { value: "sjpi", title: "Technical / Vocational Student (SJPI)", subtitle: "Hands-on technical craft & marine engineering" },
            { value: "neet", title: "Seeking Employment / Out of School (NEET)", subtitle: "Green economy job placement & micro-grants" }
        ]
    }
];

// Selection used to be an onclick on each <label>. Clicking worked, but
// arrow keys - the native way to move between radios in a group - change
// `checked` without ever firing that click, so the .selected highlight
// stayed on the previous option while the answer had already moved. The
// visible state and the real answer disagreed.
//
// Listening for `change` on the radios themselves covers every route in:
// click, tap, arrow keys, and programmatic changes.
function syncQuizSelection(radio) {
    if (!radio) return;
    const card = radio.closest('.quiz-option-card');
    const list = radio.closest('.quiz-options-list');
    if (!list || !card) return;
    list.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

function initQuizOptions() {
    document.querySelectorAll('.quiz-options-list input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => syncQuizSelection(radio));
    });
    // Reflect whatever is checked in the markup on first paint.
    document.querySelectorAll('.quiz-options-list input[type="radio"]:checked')
        .forEach(syncQuizSelection);
}

// Kept for any inline handler still calling it.
function selectQuizOption(labelEl) {
    if (!labelEl) return;
    syncQuizSelection(labelEl.querySelector('input[type="radio"]'));
}

function quizNext(step) {
    const counterEl = document.getElementById('quiz-counter-text');
    if (counterEl) {
        counterEl.innerText = `Question ${step} of 3`;
    }

    // Update Segmented Progress Bar
    for (let i = 1; i <= 3; i++) {
        const stepBar = document.getElementById(`prog-step-${i}`);
        if (stepBar) {
            if (i <= step) {
                stepBar.classList.add('active');
            } else {
                stepBar.classList.remove('active');
            }
        }
    }

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
    const statusChecked = document.querySelector('input[name="status"]:checked');

    const ageVal = ageChecked ? ageChecked.value : 'youth';
    const interestVal = interestChecked ? interestChecked.value : 'marine';
    const statusVal = statusChecked ? statusChecked.value : 'school';

    const counterEl = document.getElementById('quiz-counter-text');
    if (counterEl) {
        counterEl.innerText = 'Match complete';
    }

    // Activate all 3 progress bar segments
    for (let i = 1; i <= 3; i++) {
        const stepBar = document.getElementById(`prog-step-${i}`);
        if (stepBar) stepBar.classList.add('active');
    }

    ['q-step-1', 'q-step-2', 'q-step-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('active');
        }
    });

    const resultPane = document.getElementById('q-result');
    const matchedTitle = document.getElementById('matched-title');
    const matchedDesc = document.getElementById('matched-description');
    const quizCta = document.getElementById('quiz-cta');

    if (resultPane) {
        resultPane.classList.remove('hidden');
        resultPane.classList.add('active');
    }

    if (ageVal === 'kids') {
        if (matchedTitle) matchedTitle.innerText = "Junior Rising: Eco-Explorers";
        if (matchedDesc) matchedDesc.innerText = "For ages 10-13, our Junior Rising pathway provides interactive eco-exploration, recycling clubs, and environmental literacy workshops.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('tomorrowsreef')");
    } else if (ageVal === 'teens') {
        if (matchedTitle) matchedTitle.innerText = "Teen Rising: Green & Blue Skills";
        if (matchedDesc) matchedDesc.innerText = "Designed for ages 14-17, Teen Rising combines school environmental projects, youth advocacy, and certified introductory blue-green economy courses.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('tomorrowsreef')");
    } else if (interestVal === 'marine' || statusVal === 'sjpi') {
        if (matchedTitle) matchedTitle.innerText = "Tomorrow's Reef: Marine Heritage & Conservation";
        if (matchedDesc) matchedDesc.innerText = "Based on your technical interest in marine heritage and coastal conservation, you qualify for our ocean heritage and underwater museum initiatives.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('tomorrowsreef')");
    } else if (interestVal === 'water') {
        if (matchedTitle) matchedTitle.innerText = "Water Conservation Initiative";
        if (matchedDesc) matchedDesc.innerText = "Your interests align with community-led water preservation. Participate in household water checkups, rain-barrel monitoring, and island-wide conservation drives.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('water')");
    } else {
        if (matchedTitle) matchedTitle.innerText = "Tomorrow's Reef: Marine Heritage & Conservation";
        if (matchedDesc) matchedDesc.innerText = "Start with our ocean heritage programme: reef restoration, underwater museum fabrication, and coastal stewardship training.";
        if (quizCta) quizCta.setAttribute('onclick', "openApplyForm('tomorrowsreef')");
    }
}

// "Start over" has to actually start over. This used to rewind to question 1
// while leaving the previous answers selected, so the button's label was a
// lie - you were resuming, not restarting. defaultChecked is whatever the
// markup declared, which keeps the HTML the single source of truth.
function resetQuiz() {
    document.querySelectorAll('.quiz-options-list input[type="radio"]').forEach(radio => {
        radio.checked = radio.defaultChecked;
        if (radio.checked) syncQuizSelection(radio);
    });
    quizNext(1);
}

window.selectQuizOption = selectQuizOption;
window.initQuizOptions = initQuizOptions;
window.quizNext = quizNext;
window.processQuizResults = processQuizResults;
window.resetQuiz = resetQuiz;
