// HRMS Serene - Employee Profile Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switcher
    const tabButtons = document.querySelectorAll('.profile-tab-btn');
    const salaryTabContent = document.getElementById('salaryTabContent');
    const placeholderTabContent = document.getElementById('placeholderTabContent');
    const placeholderTabTitle = document.getElementById('placeholderTabTitle');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.textContent.trim();
            if (tabName === 'Salary Info') {
                if (salaryTabContent) salaryTabContent.style.display = 'grid';
                if (placeholderTabContent) placeholderTabContent.style.display = 'none';
            } else {
                if (salaryTabContent) salaryTabContent.style.display = 'none';
                if (placeholderTabContent) {
                    placeholderTabContent.style.display = 'block';
                    if (placeholderTabTitle) placeholderTabTitle.textContent = `${tabName} Details`;
                }
            }
        });
    });

    // 2. Real-time Compensation Calculator
    const basicRange = document.getElementById('basicRange');
    const basicValEl = document.getElementById('basicVal');
    const basicPercentEl = document.getElementById('basicPercent');

    const hraRange = document.getElementById('hraRange');
    const hraValEl = document.getElementById('hraVal');
    const hraPercentEl = document.getElementById('hraPercent');

    const stdRange = document.getElementById('stdRange');
    const stdValEl = document.getElementById('stdVal');
    const stdPercentEl = document.getElementById('stdPercent');

    const bonusRange = document.getElementById('bonusRange');
    const bonusValEl = document.getElementById('bonusVal');
    const bonusPercentEl = document.getElementById('bonusPercent');

    // Summary Card Elements
    const summaryGrossEl = document.getElementById('summaryGross');
    const summaryPfEl = document.getElementById('summaryPf');
    const summaryNetEl = document.getElementById('summaryNet');

    const monthlyWage = 50000; // Base gross salary

    const recalculateCompensation = () => {
        const basicPct = parseFloat(basicRange.value);
        const hraPct = parseFloat(hraRange.value);
        const stdPct = parseFloat(stdRange.value);
        const bonusPct = parseFloat(bonusRange.value);

        // Calculations
        const basicVal = Math.round(monthlyWage * (basicPct / 100));
        const hraVal = Math.round(monthlyWage * (hraPct / 100));
        const stdVal = Math.round(monthlyWage * (stdPct / 100));
        const bonusVal = Math.round(monthlyWage * (bonusPct / 100));

        // Update labels
        if (basicPercentEl) basicPercentEl.textContent = `(${basicPct}%)`;
        if (basicValEl) basicValEl.textContent = `₹${basicVal.toLocaleString('en-IN')}`;

        if (hraPercentEl) hraPercentEl.textContent = `(${hraPct}%)`;
        if (hraValEl) hraValEl.textContent = `₹${hraVal.toLocaleString('en-IN')}`;

        if (stdPercentEl) stdPercentEl.textContent = `(${stdPct}%)`;
        if (stdValEl) stdValEl.textContent = `₹${stdVal.toLocaleString('en-IN')}`;

        if (bonusPercentEl) bonusPercentEl.textContent = `(${bonusPct}%)`;
        if (bonusValEl) bonusValEl.textContent = `₹${bonusVal.toLocaleString('en-IN')}`;

        // PF Contribution (12% of Basic Salary)
        const pfContribution = Math.round(basicVal * 0.12);
        const profTax = 200;
        const netSalary = monthlyWage - pfContribution - profTax;

        // Update Summary Card
        if (summaryPfEl) summaryPfEl.textContent = `-₹${pfContribution.toLocaleString('en-IN')}`;
        if (summaryNetEl) summaryNetEl.textContent = `₹${netSalary.toLocaleString('en-IN')}.00`;
    };

    // Attach event listeners to all sliders
    if (basicRange) basicRange.addEventListener('input', recalculateCompensation);
    if (hraRange) hraRange.addEventListener('input', recalculateCompensation);
    if (stdRange) stdRange.addEventListener('input', recalculateCompensation);
    if (bonusRange) bonusRange.addEventListener('input', recalculateCompensation);

    // Initial run
    if (basicRange) recalculateCompensation();

    // 3. Save Changes Alert
    const btnSaveChanges = document.getElementById('btnSaveChanges');
    if (btnSaveChanges) {
        btnSaveChanges.addEventListener('click', () => {
            alert('Changes saved successfully on the control panel!');
        });
    }
});
