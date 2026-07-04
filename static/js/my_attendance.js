// HRMS Serene - My Attendance Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. CSV Export Simulation
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            // Generate standard CSV layout
            const headers = ['Date', 'Day', 'Check In', 'Check Out', 'Work Hours', 'Extra Hours', 'Status'];
            const rows = [
                ['28/10/2025', 'Tuesday', '09:05 AM', '06:12 PM', '09h 07m', '+00h 07m', 'REGULAR'],
                ['29/10/2025', 'Wednesday', '08:58 AM', '06:45 PM', '09h 47m', '+00h 47m', 'OVERTIME'],
                ['30/10/2025', 'Thursday', '--', '--', 'ABSENT', '--', 'SICK LEAVE']
            ];

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += headers.join(",") + "\n";
            rows.forEach(row => {
                csvContent += row.join(",") + "\n";
            });

            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "my_attendance_records.csv");
            document.body.appendChild(link); // Required for FF
            
            link.click();
            document.body.removeChild(link);
        });
    }

    // 2. Filter Mockup
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) {
        btnFilter.addEventListener('click', () => {
            alert('Filter option clicked! In a live app, this will open a dialog to filter by status or date ranges.');
        });
    }

    // 3. Floating Add button Click
    const btnFloating = document.getElementById('btnFloating');
    if (btnFloating) {
        btnFloating.addEventListener('click', () => {
            const dateStr = prompt("Enter Date (DD/MM/YYYY):", "31/10/2025");
            if (!dateStr) return;
            const checkin = prompt("Enter Check In Time:", "09:00 AM");
            const checkout = prompt("Enter Check Out Time:", "05:00 PM");
            
            if (dateStr && checkin && checkout) {
                const tbody = document.querySelector('.records-table tbody');
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="date-col">
                                <span class="date-bold">${dateStr}</span>
                                <span class="date-day">Requested Adjustment</span>
                            </div>
                        </td>
                        <td>${checkin}</td>
                        <td>${checkout}</td>
                        <td><span class="hours-badge">08h 00m</span></td>
                        <td>+00h 00m</td>
                        <td>
                            <button class="btn-action-dots">⋮</button>
                        </td>
                    `;
                    tbody.insertBefore(tr, tbody.firstChild);
                }
            }
        });
    }
});
