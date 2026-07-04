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
    
    // Initial clock load
    updateClock();
    // Refresh every second
    setInterval(updateClock, 1000);

    // 2. State & Interactivity for Check In/Out
    const fingerprintBtn = document.getElementById('fingerprintBtn');
    const badgeStatus = document.getElementById('badgeStatus');
    const sidebarStatusDot = document.getElementById('statusDot');
    const sidebarStatusText = document.getElementById('statusText');
    const sidebarCheckinBtn = document.getElementById('btnCheckIn');
    
    const workHoursVal = document.getElementById('workHoursVal');
    const overtimeVal = document.getElementById('overtimeVal');
    const awaitingLogTime = document.getElementById('awaitingLogTime');
    const awaitingLogIcon = document.getElementById('awaitingLogIcon');
    const recentActivityBody = document.getElementById('recentActivityBody');

    // Restore state from localStorage or default to False
    let isCheckedIn = localStorage.getItem('checked_in') === 'true';
    let checkinTimeStr = localStorage.getItem('checkin_time') || '';
    
    // Function to apply check in state styles and labels
    const applyCheckInState = (state, animate = false) => {
        if (state) {
            // Checked In state
            if (badgeStatus) {
                badgeStatus.className = 'checkin-status-badge checked-in';
                badgeStatus.innerHTML = '<span class="status-badge-dot"></span>Status: Checked In';
            }
            if (fingerprintBtn) {
                fingerprintBtn.classList.add('checked-out-state'); // Change colors/styling
                const label = fingerprintBtn.querySelector('.fingerprint-label');
                const subText = fingerprintBtn.querySelector('.fingerprint-sub');
                if (label) label.textContent = 'CHECK OUT';
                if (subText) subText.textContent = 'Tap to end shift';
            }
            
            // Sidebar changes
            if (sidebarStatusDot) {
                sidebarStatusDot.className = 'status-dot status-in';
            }
            if (sidebarStatusText) {
                sidebarStatusText.textContent = 'Current Status: In';
            }
            if (sidebarCheckinBtn) {
                sidebarCheckinBtn.classList.add('checked-in');
                sidebarCheckinBtn.textContent = 'Check Out';
            }
            
            // Daily Log updates
            if (awaitingLogTime) {
                awaitingLogTime.textContent = checkinTimeStr || '09:00 AM';
                awaitingLogTime.classList.add('text-green-bold');
            }
            if (awaitingLogIcon) {
                awaitingLogIcon.classList.add('active');
            }
            
            // Work Hours placeholder
            if (workHoursVal) workHoursVal.textContent = '08:00 hrs';
            
        } else {
            // Checked Out state
            if (badgeStatus) {
                badgeStatus.className = 'checkin-status-badge';
                badgeStatus.innerHTML = '<span class="status-badge-dot"></span>Status: Not Checked In';
            }
            if (fingerprintBtn) {
                fingerprintBtn.classList.remove('checked-out-state');
                const label = fingerprintBtn.querySelector('.fingerprint-label');
                const subText = fingerprintBtn.querySelector('.fingerprint-sub');
                if (label) label.textContent = 'CHECK IN';
                if (subText) subText.textContent = 'Tap to start shift';
            }
            
            // Sidebar changes
            if (sidebarStatusDot) {
                sidebarStatusDot.className = 'status-dot status-out';
            }
            if (sidebarStatusText) {
                sidebarStatusText.textContent = 'Current Status: Out';
            }
            if (sidebarCheckinBtn) {
                sidebarCheckinBtn.classList.remove('checked-in');
                sidebarCheckinBtn.textContent = 'Check In';
            }
            
            // Daily Log updates reset
            if (awaitingLogTime) {
                awaitingLogTime.textContent = '--:--';
                awaitingLogTime.classList.remove('text-green-bold');
            }
            if (awaitingLogIcon) {
                awaitingLogIcon.classList.remove('active');
            }
            
            // Work Hours reset
            if (workHoursVal) workHoursVal.textContent = '00:00 hrs';
        }
    };

    // Initial check in state render
    applyCheckInState(isCheckedIn);

    // Click handler for Fingerprint Check In button
    const handleCheckInToggle = () => {
        isCheckedIn = !isCheckedIn;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        if (isCheckedIn) {
            checkinTimeStr = timeStr;
            localStorage.setItem('checked_in', 'true');
            localStorage.setItem('checkin_time', timeStr);
        } else {
            localStorage.setItem('checked_in', 'false');
            localStorage.setItem('checkin_time', '');
            
            // Dynamic Insertion into table (only on check out to record the complete activity)
            if (recentActivityBody) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${checkinTimeStr || '09:00 AM'}</td>
                    <td>${timeStr}</td>
                    <td class="text-green-bold">08:00</td>
                    <td>00:00</td>
                    <td><span class="badge-status badge-status-regular">REGULAR</span></td>
                `;
                // Insert at the top of the table body
                recentActivityBody.insertBefore(newRow, recentActivityBody.firstChild);
            }
        }
        applyCheckInState(isCheckedIn, true);
    };

    if (fingerprintBtn) {
        fingerprintBtn.addEventListener('click', handleCheckInToggle);
    }
    
    if (sidebarCheckinBtn) {
        sidebarCheckinBtn.addEventListener('click', handleCheckInToggle);
    }
});
