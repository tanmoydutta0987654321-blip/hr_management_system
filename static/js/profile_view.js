// HRMS Serene - Profile View JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Edit Profile Mode Toggle
    const btnEditProfile = document.getElementById('btnEditProfile');
    const formFields = document.querySelectorAll('.profile-form-input');
    const saveChangesRow = document.getElementById('saveChangesRow');
    const successToast = document.getElementById('successToast');
    const profileForm = document.getElementById('profileForm');

    let isEditMode = false;

    if (btnEditProfile) {
        btnEditProfile.addEventListener('click', (e) => {
            e.preventDefault();
            isEditMode = !isEditMode;

            if (isEditMode) {
                // Switch to edit mode
                btnEditProfile.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Cancel Edit</span>
                `;
                btnEditProfile.classList.add('editing-active');
                
                formFields.forEach(field => {
                    field.removeAttribute('readonly');
                    field.classList.remove('field-input-style-disabled');
                });

                if (saveChangesRow) saveChangesRow.style.display = 'flex';
            } else {
                // Cancel edit mode (restore state)
                btnEditProfile.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Profile</span>
                `;
                btnEditProfile.classList.remove('editing-active');
                
                formFields.forEach(field => {
                    field.setAttribute('readonly', 'readonly');
                    field.classList.add('field-input-style-disabled');
                });

                if (saveChangesRow) saveChangesRow.style.display = 'none';
                if (profileForm) profileForm.reset();
            }
        });
    }

    // 2. Save Changes Submission
    const btnSaveChanges = document.getElementById('btnSaveChanges');
    if (btnSaveChanges) {
        btnSaveChanges.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show successful update toast
            if (successToast) {
                successToast.classList.add('show');
                setTimeout(() => {
                    successToast.classList.remove('show');
                }, 3000);
            }

            // Restore read-only mode
            isEditMode = false;
            if (btnEditProfile) {
                btnEditProfile.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Profile</span>
                `;
                btnEditProfile.classList.remove('editing-active');
            }

            formFields.forEach(field => {
                field.setAttribute('readonly', 'readonly');
                field.classList.add('field-input-style-disabled');
            });

            if (saveChangesRow) saveChangesRow.style.display = 'none';
        });
    }

    // 3. Simulated Document Actions
    const documentsList = document.getElementById('documentsList');
    if (documentsList) {
        documentsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.doc-item-action-btn');
            if (!btn) return;

            const docItem = btn.closest('.doc-item-view');
            const docName = docItem.querySelector('.doc-file-name').textContent;
            const action = btn.getAttribute('aria-label');

            if (action.includes('View')) {
                alert(`Opening Document Viewer for: ${docName}`);
            } else if (action.includes('Download')) {
                alert(`Starting file download for: ${docName}`);
            }
        });
    }

    // 4. Dotted Upload Document Click
    const btnUploadDoc = document.getElementById('btnUploadDoc');
    if (btnUploadDoc && documentsList) {
        btnUploadDoc.addEventListener('click', (e) => {
            e.preventDefault();
            const fileName = prompt("Enter document file name to upload:", "Performance_Review_Ethan.pdf");
            if (!fileName) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

            const newDoc = document.createElement('div');
            newDoc.className = 'doc-item-view';
            newDoc.innerHTML = `
                <div class="doc-file-left">
                    <div class="doc-item-icon-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div class="doc-file-meta">
                        <span class="doc-file-name">${fileName}</span>
                        <span class="doc-file-date">Uploaded on ${dateStr}</span>
                    </div>
                </div>
                <div class="doc-item-actions">
                    <button class="doc-item-action-btn" aria-label="View Document">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                    <button class="doc-item-action-btn" aria-label="Download Document">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                </div>
            `;
            documentsList.appendChild(newDoc);
        });
    }
});
