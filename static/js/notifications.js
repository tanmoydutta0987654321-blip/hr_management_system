// HRMS Serene - Notifications System (Shared across pages)

document.addEventListener('DOMContentLoaded', () => {
    const notifBell = document.getElementById('notifBell');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    const markAllReadBtn = document.getElementById('markAllRead');

    if (!notifBell) return;

    // Toggle dropdown
    notifBell.addEventListener('click', (e) => {
        // Prevent click inside dropdown from closing it
        if (e.target.closest('#notifDropdown')) return;
        notifDropdown.classList.toggle('show');
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!notifBell.contains(e.target)) {
            notifDropdown.classList.remove('show');
        }
    });

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const resp = await fetch('/api/notifications');
            if (!resp.ok) return;
            const data = await resp.json();

            // Update badge
            if (data.unread_count > 0) {
                notifBadge.textContent = data.unread_count;
                notifBadge.style.display = 'flex';
            } else {
                notifBadge.style.display = 'none';
            }

            // Update list
            if (data.notifications && data.notifications.length > 0) {
                notifList.innerHTML = '';
                data.notifications.forEach(notif => {
                    const item = document.createElement('div');
                    item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;
                    item.dataset.id = notif.id;
                    item.innerHTML = `
                        <div class="notif-title">${escapeHTML(notif.title)}</div>
                        <div class="notif-msg">${escapeHTML(notif.message)}</div>
                        <div class="notif-time">${notif.created_at || ''}</div>
                    `;

                    // Click event to mark as read
                    item.addEventListener('click', async () => {
                        if (!notif.is_read) {
                            try {
                                const readResp = await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
                                if (readResp.ok) {
                                    item.classList.remove('unread');
                                    // Decrement badge count
                                    let currentCount = parseInt(notifBadge.textContent) || 0;
                                    if (currentCount > 1) {
                                        notifBadge.textContent = currentCount - 1;
                                    } else {
                                        notifBadge.style.display = 'none';
                                    }
                                }
                            } catch (err) {
                                console.error('Error marking notification read:', err);
                            }
                        }
                    });

                    notifList.appendChild(item);
                });
            } else {
                notifList.innerHTML = '<div class="notif-empty">No notifications</div>';
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    // Mark all read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            try {
                const resp = await fetch('/api/notifications/read-all', { method: 'POST' });
                if (resp.ok) {
                    document.querySelectorAll('.notif-item').forEach(item => {
                        item.classList.remove('unread');
                    });
                    notifBadge.style.display = 'none';
                    notifBadge.textContent = '0';
                }
            } catch (err) {
                console.error('Error marking all notifications read:', err);
            }
        });
    }

    // Helper to escape HTML characters
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Initial fetch and poll every 30 seconds
    fetchNotifications();
    setInterval(fetchNotifications, 30000);
});
