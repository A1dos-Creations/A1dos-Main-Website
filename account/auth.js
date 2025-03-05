const apiBaseUrl = 'https://a1dos-login.onrender.com';

const button = document.getElementById('login-button');

function showMessage(msg, color = 'black') {
    const message = document.getElementById('message');
    message.textContent = msg;
    message.style.color = color;
    if(msg === " "){
        message.style.display = 'none';
    } else {
        message.style.display = 'block';
    }
}

const user = JSON.parse(localStorage.getItem("user") || "{}");
if(user || user.email){
    const logoutBtn = document.getElementById('logout').style.display = 'none';
} else {
    window.location.href = "account";
}

const showRegister = document.getElementById('shwRgstr');
const registerDiv = document.getElementById('registerDiv');
showRegister.addEventListener('click', () => {registerDiv.style.display = 'flex';});

async function loginUser() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    fetch(`${apiBaseUrl}/login-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(async (data) => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage(`Login successful! Welcome, ${data.user.name}`, 'green');
        setTimeout(() => showMessage(' ', 'black'), window.location.href = "account.html", 3000);
  
        //await syncLocalTasks(data.token);
        //fetchTasks();
      } else {
        showMessage(data, 'red');
        setTimeout(() => showMessage(' ', 'black'), 3000);
      }
    })
    .catch(err => showMessage(`Login error: ${err.message}`, 'red'));
  }
  
function registerUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!name || !email || !password) {
        showMessage("Please fill in all fields.", 'red');
        setTimeout(() => showMessage(' ', 'black'), 3000);
        return;
    }

    fetch(`${apiBaseUrl}/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage(`Registration successful! Welcome, ${data.user.name}`, 'green');
            setTimeout(() => showMessage(' ', 'black'), 3000);
        } else {
            showMessage(data, 'red');
            setTimeout(() => showMessage(' ', 'black'), 3000);
        }
    })
    .catch(err => showMessage(`Registration error: ${err.message}`, 'red'));
    setTimeout(() => showMessage(' ', 'black'), 3000);
}

window.onload = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
        fetch(`${apiBaseUrl}/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                showMessage(`Welcome back, ${user.name}`, 'green');
                setTimeout(() => showMessage(' ', 'black'), 3000);
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                showMessage('Session expired. Please log in again.', 'red');
                setTimeout(() => showMessage(' ', 'black'), 3000);
            }
        })
        .catch(err => showMessage(`Error verifying token: ${err.message}`, 'red'));
        setTimeout(() => showMessage(' ', 'black'), 3000);
    }
};

function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showMessage('You have been logged out.', 'green');
    setTimeout(() => showMessage(' ', 'black'), 3000);
}
