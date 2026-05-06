document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkButton');
    const swingPeriodInput = document.getElementById('swingPeriod');
    const rollPeriodInput = document.getElementById('rollPeriod');
    const resultArea = document.getElementById('resultArea');
    const diffValueSpan = document.getElementById('diffValue');
    const messageParagraph = document.getElementById('message');

    checkButton.addEventListener('click', () => {
        const swingPeriod = parseFloat(swingPeriodInput.value);
        const rollPeriod = parseFloat(rollPeriodInput.value);

        if (isNaN(swingPeriod) || isNaN(rollPeriod)) {
            alert('両方の周期に有効な数値を入力してください。');
            return;
        }

        const diff = Math.abs(swingPeriod - rollPeriod);
        const roundedDiff = diff.toFixed(3); // 小数第3位まで表示

        diffValueSpan.textContent = roundedDiff;
        resultArea.classList.remove('hidden');

        if (diff <= 0.05) {
            messageParagraph.textContent = '周期が近いため、共振しやすい可能性があります';
            messageParagraph.className = 'message warning';
            resultArea.style.borderLeftColor = 'var(--warning-color)';
        } else {
            messageParagraph.textContent = '周期差があるため、条件の見直しが必要です';
            messageParagraph.className = 'message safe';
            resultArea.style.borderLeftColor = 'var(--primary-color)';
        }
    });
});
