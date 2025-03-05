function removeGoogleLinkedParam() {
    const url = new URL(window.location);
    url.searchParams.delete("googleLinked"); 
    window.history.replaceState({}, document.title, url.pathname); 
}

document.addEventListener('DOMContentLoaded', () => {
    const googleLinkBtn = document.getElementById('google-link-btn');
    const googleLinkBtnTxt = document.getElementById('google-link-btn-text');
    const googleStatus = document.getElementById('google-status');
    const token = localStorage.getItem('authToken');

    const accountInfoDiv = document.getElementById('accountInfo');

    const hidden = document.getElementById('about');

    googleLinkBtn.addEventListener('mouseover', () => {
        hidden.style.display = 'block';
    });
    googleLinkBtn.addEventListener('mouseout', () => {
        hidden.style.display = 'none';
    });

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

    if (user && user.email) {
        const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown";

        accountInfoDiv.innerHTML = `
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Account Created:</strong> ${createdAt}</p>
        `;
    } else {
        accountInfoDiv.innerHTML = "<p>User data not available. Please log in.</p>";
        window.location.href = "./auth";
    }

    const urlParams = new URLSearchParams(window.location.search);
    let googleLinked = urlParams.get('googleLinked') === 'true';

    if (googleLinked) {
        googleStatus.textContent = "Google Account Linked ✅";
        showMessage("Google account linked successfully! ✅", 'green');
        setTimeout(() => showMessage(' ', 'black'), 4000);
    }

    function updateGoogleButton() {
        if (googleLinked) {
            googleLinkBtnTxt.textContent = "Unlink Google Account";
            googleLinkBtn.onclick = unlinkGoogleHandler;
        } else {
            googleLinkBtnTxt.textContent = "Link Google Account";
            googleLinkBtn.onclick = linkGoogleHandler;
            removeGoogleLinkedParam();
        }
    }

    function linkGoogleHandler() {
        if (!token) {
            showMessage("Please log in first.", 'red');
            setTimeout(() => showMessage(' ', 'black'), 3000);
            return;
        }

        fetch('https://a1dos-login.onrender.com/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })            
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                const userId = data.user.id;
                window.location.href = `https://a1dos-login.onrender.com/auth/google?state=${userId}`;
            } else {
                showMessage("Session expired. Please log in again.", 'red');
                setTimeout(() => showMessage(' ', 'black'), 3000);
            }
        })
        .catch(err => console.error("Error verifying token:", err));
    }

    function unlinkGoogleHandler() {
        const token = localStorage.getItem("authToken"); 
        if (!token) {
            showMessage("Session expired. Please log in again.", 'red');
            setTimeout(() => showMessage(' ', 'black'), 3000);
            return;
        }
    
        fetch("https://a1dos-login.onrender.com/unlink-google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }), 
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessage("Google account unlinked successfully.", 'green');
                googleLinked = false;
                googleStatus.textContent = "Google Account Successfully Unlinked";
                localStorage.removeItem("googleLinked"); 
                updateGoogleButton();
            } else {
                showMessage("Error unlinking Google: " + data.message, 'red');
            }
        })
        .catch(err => console.error("Error unlinking Google:", err));
    }
    
    const logoutBtn = document.getElementById("logout-btn");
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logoutUser();
        });
    }
    
    function logoutUser() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("googleLinked");    
        window.location.href = "auth"; 
    }

    updateGoogleButton();
});
