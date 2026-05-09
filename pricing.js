// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Calculator
const pactCount = document.getElementById('pact-count');
const fineAmt = document.getElementById('fine-amt');
const slipDays = document.getElementById('slip-days');

function updateCalc() {
  const p = parseInt(pactCount.value);
  const f = parseInt(fineAmt.value);
  const s = parseInt(slipDays.value);

  document.getElementById('pact-count-val').textContent = p;
  document.getElementById('fine-amt-val').textContent = '$' + f;
  document.getElementById('slip-days-val').textContent = s;

  const daily = p * f;
  const weekly = daily * s;
  const monthly = weekly * 4.33;

  document.getElementById('daily-max').textContent = '$' + daily.toFixed(2);
  document.getElementById('weekly-est').textContent = '$' + weekly.toFixed(2);
  document.getElementById('monthly-est').textContent = '$' + monthly.toFixed(2);

  [pactCount, fineAmt, slipDays].forEach(el => {
    const min = parseInt(el.min);
    const max = parseInt(el.max);
    const val = parseInt(el.value);
    const pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--progress', pct + '%');
  });
}

[pactCount, fineAmt, slipDays].forEach(el => el.addEventListener('input', updateCalc));
updateCalc();

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
