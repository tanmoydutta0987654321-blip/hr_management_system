// HRMS Serene - Sign In Interactivity & Form Validation

document.addEventListener('DOMContentLoaded', () => {
    // 1. Password visibility toggle
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');

    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            const eyeIcon = passwordToggle.querySelector('.eye-icon');
            if (eyeIcon) {
                if (isPassword) {
                    eyeIcon.style.stroke = '#2d5a4c'; // Active green color
                    eyeIcon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    `;
                } else {
                    eyeIcon.style.stroke = '#6e8277'; // Muted grey color
                    eyeIcon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    `;
                }
            }
        });
    }

    // 2. Form Validation
    const signinForm = document.getElementById('signinForm');
    const emailInput = document.getElementById('email');
    const emailGroup = document.getElementById('emailGroup');
    const passwordGroup = document.getElementById('passwordGroup');

    if (signinForm && emailInput && passwordInput) {
        signinForm.addEventListener('submit', (e) => {
            let isValid = true;

            // Email check
            const emailVal = emailInput.value.trim();
            if (!emailVal || !emailVal.includes('@')) {
                emailGroup.classList.add('has-error');
                isValid = false;
            } else {
                emailGroup.classList.remove('has-error');
            }

            // Password check
            if (!passwordInput.value.trim()) {
                passwordGroup.classList.add('has-error');
                isValid = false;
            } else {
                passwordGroup.classList.remove('has-error');
            }

            if (!isValid) {
                e.preventDefault();
            }
        });

        // Clear error styles on input
        emailInput.addEventListener('input', () => emailGroup.classList.remove('has-error'));
        passwordInput.addEventListener('input', () => passwordGroup.classList.remove('has-error'));
    }
});
