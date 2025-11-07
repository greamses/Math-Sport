// Create animated binary background
document.addEventListener('DOMContentLoaded', function() {
  const binaryBg = document.getElementById('binary-bg');
  const digits = ['0', '1'];
  
  for (let i = 0; i < 80; i++) {
    const digit = document.createElement('div');
    digit.className = 'binary-digit';
    digit.textContent = digits[Math.floor(Math.random() * digits.length)];
    digit.style.left = `${Math.random() * 100}%`;
    digit.style.animationDelay = `${Math.random() * 15}s`;
    digit.style.fontSize = `${Math.random() * 8 + 10}px`;
    binaryBg.appendChild(digit);
  }
});