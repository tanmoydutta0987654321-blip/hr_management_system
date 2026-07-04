// HRMS Serene - My Attendance Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Export CSV from actual table content
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            const table = document.querySelector('.records-table');
            if (!table) return;

            const rows = table.querySelectorAll('tr');
            let csv = [];
            
            rows.forEach((row, i) => {
                const cols = row.querySelectorAll('th, td');
                let rowData = [];
                
                cols.forEach(col => {
                    // Extract text content and clean it
                    let text = col.innerText.trim();
                    // Escape double quotes
                    text = text.replace(/"/g, '""');
                    // Wrap in quotes if contains commas or newlines
                    if (text.includes(',') || text.includes('\n')) {
                        text = `"${text}"`;
                    }
                    rowData.push(text);
                });
                
                csv.push(rowData.join(','));
            });

            const csvString = csv.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "my_attendance_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
