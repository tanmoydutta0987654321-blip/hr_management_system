// HRMS Serene - Daily Attendance Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Digital Clock
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');

    const updateClock = () => {
        const now = new Date();
        
        // Time format: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        if (clockElement) {
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }

        // Date format: July 3, 2026 (matching locale layout)
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    };
    
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Attendance Elements
    const fingerprintBtn = document.getElementById('fingerprintBtn');
    const fingerprintPulse = document.getElementById('fingerprintPulse');
    const badgeStatus = document.getElementById('badgeStatus');
    const badgeStatusText = document.getElementById('badgeStatusText');
    const btnActionText = document.getElementById('btnActionText');
    const btnActionSub = document.getElementById('btnActionSub');

    const checkInTimeVal = document.getElementById('checkInTimeVal');
    const checkOutTimeVal = document.getElementById('checkOutTimeVal');

    const clockInLogDot = document.getElementById('clockInLogDot');
    const clockInLogTitle = document.getElementById('clockInLogTitle');
    const clockInLogSub = document.getElementById('clockInLogSub');
    const clockInLogTime = document.getElementById('clockInLogTime');

    const sidebarStatusDot = document.getElementById('statusDot');
    const sidebarStatusText = document.getElementById('statusText');
    const sidebarCheckinBtn = document.getElementById('btnCheckIn');

    // Fetch and sync current attendance status
    const syncAttendanceStatus = async () => {
        try {
            const resp = await fetch('/api/attendance/status');
            if (!resp.ok) return;
            const status = await resp.json();

            updateDOMState(status);
        } catch (err) {
            console.error('Error syncing attendance status:', err);
        }
    };

    const updateDOMState = (status) => {
        const isCheckedIn = status.checked_in;
        const isCheckedOut = status.checked_out;

        if (isCheckedIn && !isCheckedOut) {
            // Active shift (Checked in, not checked out)
            if (badgeStatus) {
                badgeStatus.className = 'checkin-status-badge status-in';
            }
            if (badgeStatusText) badgeStatusText.textContent = 'Status: Checked In';
            if (btnActionText) btnActionText.textContent = 'CHECK OUT';
            if (btnActionSub) btnActionSub.textContent = 'Tap to end shift';
            if (fingerprintBtn) {
                fingerprintBtn.classList.add('checked-in');
                fingerprintBtn.disabled = false;
                fingerprintBtn.style.opacity = '1';
                fingerprintBtn.style.cursor = 'pointer';
            }
            if (fingerprintPulse) {
                fingerprintPulse.style.animation = 'pulse-ring 1.5s infinite';
            }

            // Logs
            if (clockInLogDot) clockInLogDot.classList.add('active');
            if (clockInLogTitle) clockInLogTitle.textContent = 'Shift In Process';
            if (clockInLogSub) clockInLogSub.textContent = 'Checked in via portal';
            if (clockInLogTime && status.check_in) {
                clockInLogTime.textContent = formatTimeString(status.check_in);
            }

            // Sidebar
            if (sidebarStatusDot) sidebarStatusDot.className = 'status-dot status-in';
            if (sidebarStatusText) sidebarStatusText.textContent = 'Current Status: In';
            if (sidebarCheckinBtn) {
                sidebarCheckinBtn.className = 'btn-checkin checked-in';
                sidebarCheckinBtn.textContent = 'Check Out';
            }
        } else if (isCheckedIn && isCheckedOut) {
            // Shift completed (Both checked in and checked out)
            if (badgeStatus) {
                badgeStatus.className = 'checkin-status-badge status-out';
            }
            if (badgeStatusText) badgeStatusText.textContent = 'Status: Checked Out';
            if (btnActionText) btnActionText.textContent = 'COMPLETED';
            if (btnActionSub) btnActionSub.textContent = 'Shift ended';
            if (fingerprintBtn) {
                fingerprintBtn.classList.remove('checked-in');
                fingerprintBtn.disabled = true;
                fingerprintBtn.style.opacity = '0.6';
                fingerprintBtn.style.cursor = 'not-allowed';
            }
            if (fingerprintPulse) {
                fingerprintPulse.style.animation = 'none';
            }

            // Logs
            if (clockInLogDot) clockInLogDot.classList.add('active');
            if (clockInLogTitle) clockInLogTitle.textContent = 'Shift Completed';
            if (clockInLogSub) clockInLogSub.textContent = 'Shift completed today';
            if (clockInLogTime && status.check_in) {
                clockInLogTime.textContent = formatTimeString(status.check_in);
            }

            // Sidebar
            if (sidebarStatusDot) sidebarStatusDot.className = 'status-dot status-out';
            if (sidebarStatusText) sidebarStatusText.textContent = 'Current Status: Out';
            if (sidebarCheckinBtn) {
                sidebarCheckinBtn.className = 'btn-checkin';
                sidebarCheckinBtn.textContent = 'Completed';
                sidebarCheckinBtn.disabled = true;
            }
        } else {
            // Not clocked in at all
            if (badgeStatus) {
                badgeStatus.className = 'checkin-status-badge';
            }
            if (badgeStatusText) badgeStatusText.textContent = 'Status: Not Checked In';
            if (btnActionText) btnActionText.textContent = 'CHECK IN';
            if (btnActionSub) btnActionSub.textContent = 'Tap to start shift';
            if (fingerprintBtn) {
                fingerprintBtn.classList.remove('checked-in');
                fingerprintBtn.disabled = false;
                fingerprintBtn.style.opacity = '1';
                fingerprintBtn.style.cursor = 'pointer';
            }
            if (fingerprintPulse) {
                fingerprintPulse.style.animation = 'none';
            }

            // Logs
            if (clockInLogDot) clockInLogDot.classList.remove('active');
            if (clockInLogTitle) clockInLogTitle.textContent = 'Awaiting Check-In';
            if (clockInLogSub) clockInLogSub.textContent = 'Waiting for manual fingerprint scan';
            if (clockInLogTime) clockInLogTime.textContent = '--:--';

            // Sidebar
            if (sidebarStatusDot) sidebarStatusDot.className = 'status-dot status-out';
            if (sidebarStatusText) sidebarStatusText.textContent = 'Current Status: Out';
            if (sidebarCheckinBtn) {
                sidebarCheckinBtn.className = 'btn-checkin';
                sidebarCheckinBtn.textContent = 'Check In';
                sidebarCheckinBtn.disabled = false;
            }
        }

        // Times
        if (checkInTimeVal) {
            checkInTimeVal.textContent = status.check_in ? formatTimeStringFull(status.check_in) : '--:--:--';
        }
        if (checkOutTimeVal) {
            checkOutTimeVal.textContent = status.check_out ? formatTimeStringFull(status.check_out) : '--:--:--';
        }
    };

    const formatTimeString = (dtStr) => {
        try {
            // dtStr might look like "2026-07-04 15:40:22" or similar
            const t = dtStr.split(' ')[1] || dtStr;
            const parts = t.split(':');
            let hr = parseInt(parts[0]);
            const min = parts[1];
            const ampm = hr >= 12 ? 'PM' : 'AM';
            hr = hr % 12;
            hr = hr ? hr : 12; // 0 should be 12
            return `${String(hr).padStart(2, '0')}:${min} ${ampm}`;
        } catch (e) {
            return dtStr;
        }
    };

    const formatTimeStringFull = (dtStr) => {
        try {
            return dtStr.split(' ')[1] || dtStr;
        } catch (e) {
            return dtStr;
        }
    };

    const triggerClockAction = async () => {
        try {
            // First check status to see which action to take
            const statusResp = await fetch('/api/attendance/status');
            if (!statusResp.ok) return;
            const status = await statusResp.json();

            let endpoint = '/api/attendance/clock-in';
            if (status.checked_in && !status.checked_out) {
                endpoint = '/api/attendance/clock-out';
            } else if (status.checked_in && status.checked_out) {
                return; // Completed
            }

            const actionResp = await fetch(endpoint, { method: 'POST' });
            const data = await actionResp.json();

            if (data.success) {
                location.reload(); // Reload to refresh history list & states cleanly
            } else {
                alert(data.error || 'Attendance log action failed.');
            }
        } catch (err) {
            console.error('Error logging attendance action:', err);
        }
    };

    if (fingerprintBtn) {
        fingerprintBtn.addEventListener('click', triggerClockAction);
    }
    if (sidebarCheckinBtn) {
        sidebarCheckinBtn.addEventListener('click', triggerClockAction);
    }

    // Initial load sync
    syncAttendanceStatus();
});
