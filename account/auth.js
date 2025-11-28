document.addEventListener("DOMContentLoaded", () => {
    if (typeof firebase === 'undefined') {
        showMessage("Configuration error. Please try again later.", "red");
        return;
    }

    // --- Get UI Elements ---
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const toggleFormButton = document.getElementById('toggle-form-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');
    const formWrapper = document.getElementById('form-wrapper');

    let isLoginVisible = true;

    // --- Attach Event Listeners ---
    loginButton.addEventListener('click', () => handleAuth(false));
    registerButton.addEventListener('click', () => handleAuth(true));
    toggleFormButton.addEventListener('click', toggleForms);

    // --- UI Toggling with Animation ---
    function toggleForms() {
        const loginHeight = loginForm.scrollHeight;
        const registerHeight = registerForm.scrollHeight;
        formWrapper.style.height = `${isLoginVisible ? registerHeight : loginHeight}px`;

        if (isLoginVisible) {
            loginForm.classList.add('hidden', 'left');
            registerForm.classList.remove('hidden', 'left');
            formTitle.textContent = 'Register';
            toggleFormButton.textContent = 'Already have an account? Login.';
        } else {
            loginForm.classList.remove('hidden', 'left');
            registerForm.classList.add('hidden');
            formTitle.textContent = 'Login';
            toggleFormButton.textContent = "Don't have an account? Register one.";
        }
        isLoginVisible = !isLoginVisible;
    }

    // Set initial height
    formWrapper.style.height = `${loginForm.scrollHeight}px`;

    // --- Combined Login & Registration Handler ---
    async function handleAuth(isRegistering) {
        const email = document.getElementById(isRegistering ? 'register-email' : 'email').value.trim();
        const password = document.getElementById(isRegistering ? 'register-password' : 'password').value.trim();
        const name = isRegistering ? document.getElementById('name').value.trim() : undefined;

        if (!email || !password || (isRegistering && !name)) {
            return showMessage('Please fill out all required fields.', 'red');
        }

        showMessage("Connecting...", "grey");

        try {
            // Use the Firebase SDK to call your function
            const functions = firebase.app().functions("us-central1");
            const createTokenFunction = functions.httpsCallable('createCustomAuthToken');

            const result = await createTokenFunction({ email, password, name, isRegistering });
            const { token } = result.data;

            if (token) {
                // Sign in with the token from the backend
                await firebase.auth().signInWithCustomToken(token);
            } else {
                throw new Error("Could not retrieve authentication token.");
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`, 'red');
        }
    }
    
    function showMessage(msg, color = 'var(--text-color)') {
        document.getElementById('message').textContent = msg;
        document.getElementById('message').style.color = color;
    }

    // Redirect user after successful login
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            showMessage("Success! Redirecting...", "green");
            setTimeout(() => { window.location.href = "/dashboard.html"; }, 1000);
        }
    });
});