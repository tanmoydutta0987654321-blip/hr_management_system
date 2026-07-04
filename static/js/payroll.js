// HRMS Serene - Payroll & Salary Management JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. HR Salary Management Form Submit
    const salarySetForm = document.getElementById('salarySetForm');
    if (salarySetForm) {
        salarySetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const employee_id = document.getElementById('salaryEmpId').value;
            const basic_salary = document.getElementById('basicSalary').value;
            const bonus = document.getElementById('bonus').value;
            const deduction = document.getElementById('deduction').value;

            try {
                const resp = await fetch('/api/salary/set', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employee_id, basic_salary, bonus, deduction })
                });
                const data = await resp.json();

                if (data.success) {
                    alert('Salary updated successfully!');
                    location.reload();
                } else {
                    alert(data.error || 'Failed to update salary');
                }
            } catch (err) {
                console.error('Error updating salary:', err);
            }
        });
    }

    // 2. HR Process Payroll Form Submit
    const payrollProcessForm = document.getElementById('payrollProcessForm');
    if (payrollProcessForm) {
        payrollProcessForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const employee_id = document.getElementById('processEmpId').value;
            const pay_month = document.getElementById('processPayMonth').value;

            try {
                const resp = await fetch('/api/payroll/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employee_id, pay_month })
                });
                const data = await resp.json();

                if (data.success) {
                    alert('Payroll processed successfully for this month!');
                    location.reload();
                } else {
                    alert(data.error || 'Failed to process payroll');
                }
            } catch (err) {
                console.error('Error processing payroll:', err);
            }
        });
    }
});

// Show set salary form (HR)
function showSalaryForm(empId, empName, basic, bonus, deduction) {
    const section = document.getElementById('salaryFormSection');
    if (section) {
        document.getElementById('salaryEmpId').value = empId;
        document.getElementById('salaryEmpName').value = empName;
        document.getElementById('basicSalary').value = basic;
        document.getElementById('bonus').value = bonus;
        document.getElementById('deduction').value = deduction;
        
        section.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Hide set salary form (HR)
function hideSalaryForm() {
    const section = document.getElementById('salaryFormSection');
    if (section) {
        section.style.display = 'none';
    }
}

// Release Funds (HR Marks Payroll as Paid)
async function paySalary(payrollId) {
    if (!confirm('Are you sure you want to release funds and mark this payroll as PAID?')) return;

    try {
        const resp = await fetch(`/api/payroll/${payrollId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json();

        if (data.success) {
            // Update status badge
            const badge = document.getElementById(`badge-${payrollId}`);
            if (badge) {
                badge.className = 'badge-paid';
                badge.textContent = 'Paid';
            }

            // Remove release button
            const actionContainer = document.getElementById(`action-${payrollId}`);
            if (actionContainer) {
                actionContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">Completed</span>';
            }
        } else {
            alert(data.error || 'Failed to update payment status');
        }
    } catch (err) {
        console.error('Error releasing funds:', err);
    }
}
