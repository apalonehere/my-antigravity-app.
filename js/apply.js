// --- Application Form Module ---
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw7_Ferq7x7ULlFjHsOwSTihGYAU_qPqlPMzBKnEhT_J2hNxy5B70wNM3OqHiiEhyY5/exec'; 

function openApplyForm(progName) {
    switchView('apply');
    const progSelect = document.getElementById('apply-prog');
    if (!progSelect) return;
    
    if (progName === 'tomorrowsreef' || progName.includes('reef') || progName.includes('Reef')) {
        progSelect.value = 'tomorrowsreef';
    } else if (progName === 'yots' || progName.includes('Seas')) {
        progSelect.value = 'tomorrowsreef';
    } else if (progName === 'ecovillage' || progName.includes('Village') || progName.includes('Dash')) {
        progSelect.value = 'ecovillage';
    } else {
        progSelect.value = 'pinelands';
    }
}

function handleApplySubmit() {
    const formData = {
        firstName: document.getElementById('apply-fname')?.value || '',
        lastName: document.getElementById('apply-lname')?.value || '',
        email: document.getElementById('apply-email')?.value || '',
        phone: document.getElementById('apply-phone')?.value || '',
        age: parseInt(document.getElementById('apply-age')?.value) || 18,
        programme: document.getElementById('apply-prog')?.value || 'tomorrowsreef',
        district: document.getElementById('apply-district')?.value || 'St. Michael'
    };

    if (GOOGLE_SHEETS_URL) {
        const submitBtn = document.querySelector('#apply-form button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : 'Submit';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
        }

        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            showSuccessState();
        })
        .catch(err => {
            console.error('Error submitting to Google Sheet:', err);
            showSuccessState();
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.innerText = originalText;
            }
        });
    } else {
        showSuccessState();
    }
}

function showSuccessState() {
    const form = document.getElementById('apply-form');
    const successBox = document.getElementById('apply-success-box');
    const applyView = document.getElementById('view-apply');
    if (form) form.classList.add('hidden');
    if (successBox) successBox.classList.remove('hidden');
    if (applyView) applyView.scrollIntoView({ behavior: 'smooth' });
}

function resetApplyForm() {
    const form = document.getElementById('apply-form');
    const successBox = document.getElementById('apply-success-box');
    if (form) {
        form.reset();
        form.classList.remove('hidden');
    }
    if (successBox) successBox.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('apply-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^\d+() \-]/g, '');
        });
    }
});

window.openApplyForm     = openApplyForm;
window.handleApplySubmit = handleApplySubmit;
window.showSuccessState  = showSuccessState;
window.resetApplyForm    = resetApplyForm;
