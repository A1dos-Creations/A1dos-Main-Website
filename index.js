document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button');
    const loginTxt = document.getElementById('loginTxt');

    const token = localStorage.getItem('authToken'); 
    if (token) {
      loginBtn.href = "account/dashboard"; 
      loginTxt.textContent = "My Account";
      loginTxt.style.width = 'fit-content';
      loginBtn.style.width = 'fit-content';
      loginBtn.style.marginLeft = '-1000px';
    }
  });
  