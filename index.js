// index.js
document.addEventListener('DOMContentLoaded', () => {
  const nicknameInput = document.getElementById('nickname');
  const joinBtn = document.getElementById('joinBtn');
  const errorDiv = document.getElementById('error');

  nicknameInput.addEventListener('input', () => {
    if (nicknameInput.value.trim().length >= 5) {
      joinBtn.disabled = false;
      joinBtn.classList.add('animated');
      errorDiv.textContent = '';
    } else {
      joinBtn.disabled = true;
      joinBtn.classList.remove('animated');
      errorDiv.textContent = 'Nick musi mieć minimum 5 znaków.';
    }
  });

  joinBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (nickname.length >= 5) {
      // Przechowaj nick w localStorage, aby strona chatu mogła go odczytać
      localStorage.setItem('nickname', nickname);
      window.location.href = 'chat.html';
    }
  });
});
