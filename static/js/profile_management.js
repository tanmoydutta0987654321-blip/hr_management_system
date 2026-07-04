// HRMS Serene - Employee Profile Management Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Employment Status Switch Toggle
    const statusBtnActive = document.getElementById('statusBtnActive');
    const statusBtnLeave = document.getElementById('statusBtnLeave');
    const employmentStatusHidden = document.getElementById('employmentStatusHidden');

    if (statusBtnActive && statusBtnLeave) {
        statusBtnActive.addEventListener('click', (e) => {
            e.preventDefault();
            statusBtnActive.classList.add('active');
            statusBtnLeave.classList.remove('active');
            if (employmentStatusHidden) employmentStatusHidden.value = 'active';
        });

        statusBtnLeave.addEventListener('click', (e) => {
            e.preventDefault();
            statusBtnLeave.classList.add('active');
            statusBtnActive.classList.remove('active');
            if (employmentStatusHidden) employmentStatusHidden.value = 'leave';
        });
    }

    // 2. Discard Changes click handler
    const btnDiscard = document.getElementById('btnDiscard');
    const profileForm = document.getElementById('profileForm');
    
    if (btnDiscard && profileForm) {
        btnDiscard.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to discard your edits?")) {
                profileForm.reset();
                // Restore default active statuses
                if (statusBtnActive && statusBtnLeave) {
                    statusBtnActive.classList.add('active');
                    statusBtnLeave.classList.remove('active');
                }
            }
        });
    }

    // 3. Update Profile & Display Dynamic Successful Toast
    const btnUpdateProfile = document.getElementById('btnUpdateProfile');
    const successToast = document.getElementById('successToast');

    if (btnUpdateProfile && successToast) {
        btnUpdateProfile.addEventListener('click', (e) => {
            e.preventDefault(); // Don't submit/reload in mockup
            
            // Show toast
            successToast.classList.add('show');
            
            // Hide toast after 3 seconds
            setTimeout(() => {
                successToast.classList.remove('show');
            }, 3000);
        });
    }

    // 4. Dotted Add Document Click
    const btnAddDoc = document.getElementById('btnAddDoc');
    const docsList = document.getElementById('docsList');
    
    if (btnAddDoc && docsList) {
        btnAddDoc.addEventListener('click', (e) => {
            e.preventDefault();
            const fileName = prompt("Enter file name to upload:", "Performance_Review_2025.pdf");
            if (!fileName) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            
            const isZip = fileName.endsWith('.zip') || fileName.endsWith('.rar');
            const iconClass = isZip ? 'zip' : 'pdf';
            const iconSvg = isZip ? 
                `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                 </svg>` : 
                `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                 </svg>`;

            const docItem = document.createElement('div');
            docItem.className = 'doc-file-item';
            docItem.innerHTML = `
                <div class="doc-file-left">
                    <div class="doc-file-icon-box ${iconClass}">
                        ${iconSvg}
                    </div>
                    <div class="doc-file-meta">
                        <span class="doc-file-name">${fileName}</span>
                        <span class="doc-file-date">Uploaded: ${dateStr}</span>
                    </div>
                </div>
                <button class="doc-download-btn" aria-label="Download Document">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
            `;
            docsList.appendChild(docItem);
        });
    }
});
