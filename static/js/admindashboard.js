// HRMS Serene - Admin Dashboard Interactivity

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Check In/Out Toggle
    const btnCheckIn = document.getElementById('btnCheckIn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (btnCheckIn && statusDot && statusText) {
        btnCheckIn.addEventListener('click', () => {
            const isCheckedIn = btnCheckIn.classList.contains('checked-in');
            
            if (isCheckedIn) {
                // Perform check out
                btnCheckIn.classList.remove('checked-in');
                btnCheckIn.textContent = 'Check In';
                
                statusDot.className = 'status-dot status-out';
                statusText.textContent = 'Current Status: Out';
            } else {
                // Perform check in
                btnCheckIn.classList.add('checked-in');
                btnCheckIn.textContent = 'Check Out';
                
                statusDot.className = 'status-dot status-in';
                statusText.textContent = 'Current Status: In';
            }
        });
    }

    // 2. Top Navigation Tabs Underline Switcher
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            tabLinks.forEach(tab => tab.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 3. Sidebar Menu Items Navigation Highlights
    const sidebarItems = document.querySelectorAll('.nav-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // 4. Search Filter Mockup (Filters Pending Actions & Events)
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Search Pending Actions
            const actionItems = document.querySelectorAll('.action-item');
            actionItems.forEach(item => {
                const actorName = item.querySelector('.action-actor').textContent.toLowerCase();
                const descText = item.querySelector('.action-desc').textContent.toLowerCase();
                
                if (actorName.includes(query) || descText.includes(query)) {
                    item.style.display = 'flex';
                    item.style.backgroundColor = query !== '' ? 'rgba(163, 217, 201, 0.2)' : ''; // Highlight search matches
                } else {
                    item.style.display = 'none';
                }
            });

            // Search Upcoming Events
            const eventItems = document.querySelectorAll('.event-item');
            eventItems.forEach(item => {
                const titleText = item.querySelector('.event-title').textContent.toLowerCase();
                const timeText = item.querySelector('.event-time').textContent.toLowerCase();
                
                if (titleText.includes(query) || timeText.includes(query)) {
                    item.style.display = 'flex';
                    item.style.border = query !== '' ? '1px solid var(--accent-mint)' : '';
                    item.style.borderRadius = query !== '' ? '10px' : '';
                    item.style.padding = query !== '' ? '6px' : '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 5. Interactive chart tooltip animations
    const barFills = document.querySelectorAll('.bar-fill');
    barFills.forEach(bar => {
        // Micro animation on load: start heights at 0 and transition up
        const finalHeight = bar.style.height;
        bar.style.height = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'height 1s cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.height = finalHeight;
        }, 150);
    });
});
