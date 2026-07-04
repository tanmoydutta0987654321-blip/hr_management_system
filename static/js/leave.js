// HRMS Serene - Leave Management JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const leaveForm = document.getElementById('leaveForm');

    if (leaveForm) {
        leaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const leave_type_id = document.getElementById('leaveType').value;
            const start_date = document.getElementById('startDate').value;
            const end_date = document.getElementById('endDate').value;
            const reason = document.getElementById('reason').value;

            if (start_date > end_date) {
                alert('End date must be on or after start date.');
                return;
            }

            try {
                const resp = await fetch('/api/leave/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leave_type_id, start_date, end_date, reason })
                });

                const data = await resp.json();

                if (data.success) {
                    alert('Leave request submitted successfully.');
                    location.reload();
                } else {
                    alert(data.error || 'Failed to submit leave request.');
                }
            } catch (err) {
                console.error('Error submitting leave request:', err);
                alert('An error occurred. Please try again.');
            }
        });
    }
});

// Resolve Leave Request (HR manager only)
async function resolveLeave(leaveId, action) {
    if (!confirm(`Are you sure you want to ${action} this leave request?`)) return;

    try {
        const resp = await fetch(`/api/leave/${leaveId}/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json();

        if (data.success) {
            // Update status badge in the table
            const badge = document.getElementById(`badge-${leaveId}`);
            if (badge) {
                badge.className = `badge-status ${action === 'approve' ? 'approved' : 'rejected'}`;
                badge.textContent = action === 'approve' ? 'Approved' : 'Rejected';
            }

            // Remove actions buttons
            const actionsContainer = document.getElementById(`actions-${leaveId}`);
            if (actionsContainer) {
                actionsContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">Resolved</span>';
            }
        } else {
            alert(data.error || 'Failed to process request.');
        }
    } catch (err) {
        console.error(`Error resolving leave request (${action}):`, err);
        alert('An error occurred. Please try again.');
    }
}
