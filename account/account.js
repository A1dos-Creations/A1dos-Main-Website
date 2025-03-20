function removeGoogleLinkedParam() {
  const url = new URL(window.location);
  url.searchParams.delete("googleLinked");
  window.history.replaceState({}, document.title, url.pathname);
}
function removeResetPswParam() {
  const url = new URL(window.location);
  url.searchParams.delete("resetPsw");
  window.history.replaceState({}, document.title, url.pathname);
}
  
  document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('pk_live_51QzQdOG1SPsRBHogtiBFwbebzV9JmhES0R4ZZGjHABPcEvnpGZaFDGlDONzPMz0gNMn664g1fcfhrUYpaUv4We7o00QsWelAuT');

    document.getElementById('upgrade-button').addEventListener('click', () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert("You must be logged in to upgrade.");
        return;
      }
      
      fetch('https://api.a1dos-creations.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          return stripe.redirectToCheckout({ sessionId: data.id });
        } else {
          throw new Error("Failed to create checkout session");
        }
      })
      .then(result => {
        if (result.error) {
          console.error(result.error.message);
          alert(result.error.message);
        }
      })
      .catch(error => {
        console.error("Error creating checkout session:", error);
        alert("Error creating checkout session. Please try again.");
      });
    });

    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem("user") || "{}");
  
    if (new URLSearchParams(window.location.search).get('googleLinked') === 'true') {
      localStorage.setItem('googleLinked', 'true');
    }
    let googleLinked = localStorage.getItem('googleLinked') === 'true';
  
    const accountInfoDiv = document.getElementById('accountInfo');
    const googleLinkBtn = document.getElementById('google-link-btn');
    const googleLinkBtnTxt = document.getElementById('google-link-btn-text');
    const googleStatus = document.getElementById('google-status');
    const emailToggle = document.getElementById('emailToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const logoutBtn = document.getElementById("logout-btn");
    const deviceList = document.getElementById("deviceList");
    const messageEl = document.getElementById("message");
  
    function showMessage(msg, color = 'black') {
      messageEl.textContent = msg;
      messageEl.style.color = color;
      messageEl.style.display = msg.trim() ? 'block' : 'none';
    }
  
    if (!token) {
      window.location.href = "./auth.html";
      return;
    }
  
    try {
      const decoded = jwt_decode(token);
      const expiry = decoded.exp * 1000;
      if (Date.now() > expiry) {
        showMessage("Your session has expired. Please log in again.", "red");
        localStorage.clear();
        window.location.href = "./auth.html";
        return;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      window.location.href = "./auth.html";
      return;
    }

    function pollTokenValidity() {
      const token = localStorage.getItem("authToken");
      if (!token) return; 
      
      fetch("https://api.a1dos-creations.com/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Token invalid or session revoked");
          }
          return response.json();
        })
        .then(data => {
          if (!data.valid) {
            console.log("Token invalid, logging out immediately.");
            localStorage.clear();
            window.location.href = "./auth.html";
          }
        })
        .catch(err => {
          console.error("Token validity check failed:", err);
          localStorage.clear();
          window.location.href = "./auth.html";
        });
    }
    
    setInterval(pollTokenValidity, 5000);

    const socket = new WebSocket('wss://api.a1dos-creations.com');

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.action === "logout") {
            console.log("Session revoked. Logging out...");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.location.href = "./auth.html";
        }
    };

    socket.onopen = () => {
        const token = localStorage.getItem("authToken");
        if (token) {
            socket.send(JSON.stringify({ token }));
        }
    };

  
    if (user.email) {
      const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown";
      accountInfoDiv.innerHTML = `
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Account Created:</strong> ${createdAt}</p>
        <p><strong>Name:</strong> ${user.name}</p>
      `;
    } else {
      accountInfoDiv.innerHTML = "<p>User data not available. Please log in.</p>";
      window.location.href = "./auth.html";
      return;
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "./auth.html";
      });
    }
  
    if (emailToggle && toggleLabel) {
      emailToggle.checked = (user.email_notifications !== false);
      toggleLabel.textContent = emailToggle.checked ? "Enabled" : "Disabled";
      emailToggle.addEventListener('change', () => {
        const newPreference = emailToggle.checked;
        toggleLabel.textContent = newPreference ? "Enabled" : "Disabled";
        fetch("https://api.a1dos-creations.com/update-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, emailNotifications: newPreference })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            user.email_notifications = newPreference;
            localStorage.setItem("user", JSON.stringify(user));
            showMessage("Notification preferences updated.", 'green');
          } else {
            showMessage("Failed to update preferences: " + data.message, 'red');
          }
        })
        .catch(err => console.error("Error updating preferences:", err));
      });
    }
  
    function updateGoogleButton() {
        googleLinkBtnTxt.textContent = googleLinked ? "Unlink Google Account" : "Link Google Account";
        googleLinkBtn.onclick = googleLinked ? unlinkGoogleHandler : linkGoogleHandler;
        googleStatus.textContent = googleLinked ? "Google Account Linked ✅" : "Google Account Not Linked ❌";
    }
    
    function linkGoogleHandler() {
        fetch('https://api.a1dos-creations.com/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                const userId = data.user.id;
                window.location.href = `https://api.a1dos-creations.com/auth/google?state=${userId}`;
            } else {
                showMessage("Session expired. Please log in again.", 'red');
                setTimeout(() => showMessage('', 'black'), 3000);
            }
        })
        .catch(err => console.error("Error verifying token:", err));
    }
    
    function unlinkGoogleHandler() {
        fetch("https://api.a1dos-creations.com/unlink-google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('googleLinked', 'false');
                googleLinked = false;
                updateGoogleButton();
                showMessage("Google account unlinked.", 'green');
            }
        })
        .catch(err => console.error("Error unlinking Google:", err));
    }
    
    function checkGoogleLinkStatus() {
        fetch('https://api.a1dos-creations.com/check-google-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            googleLinked = data.linked;
            localStorage.setItem('googleLinked', data.linked ? 'true' : 'false');
            updateGoogleButton();
        })
        .catch(err => console.error("Error checking Google link status:", err));
    }
    
    updateGoogleButton();
    setTimeout(() => {
        checkGoogleLinkStatus();
    }, 2000);
    
    window.revokeSession = function(sessionId, sessionToken) {
      fetch('https://api.a1dos-creations.com/revoke-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sessionId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showMessage("Session revoked successfully.", "green");
          loadUserSessions(); // Refresh session list immediately
          if (sessionToken === token) {
            localStorage.clear();
            window.location.href = "./auth.html";
          }
        } else {
          showMessage("Failed to revoke session: " + data.message, "red");
        }
      })
      .catch(err => console.error("Error revoking session:", err));
    };
  
    function filterDuplicateSessions(sessions) {
      const seen = {};
      return sessions.filter(session => {
        const key = `${session.device_info}-${session.location}`;
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    }
  
    function loadUserSessions() {
      fetch("https://api.a1dos-creations.com/get-user-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          deviceList.innerHTML = "<br>";
          const uniqueSessions = filterDuplicateSessions(data.sessions);
          uniqueSessions.forEach(session => {
            const li = document.createElement("li");
            li.innerHTML = `
              <strong>Device:</strong> ${session.device_info} <br>
              <strong>Location:</strong> ${session.location || "Unknown Location"} <br>
              <strong>Last Login:</strong> ${new Date(session.login_time).toLocaleString()} <br>
              <button onclick="revokeSession(${session.id}, '${session.session_token}')">Revoke</button><br>
            `;
            deviceList.appendChild(li);
          });
          deviceList.style.display = "block";
        } else {
          deviceList.innerHTML = "<li>No sessions found.</li>";
        }
      })
      .catch(err => console.error("Error fetching sessions:", err));
    }
  
    loadUserSessions();
  });

  const messageEl = document.getElementById("message");
  
  function showMessage(msg, color = 'black') {
    messageEl.textContent = msg;
    messageEl.style.color = color;
    messageEl.style.display = msg.trim() ? 'block' : 'none';
  }

  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const passwordForm = document.getElementById('passwordForm');
  const pswDiv = document.getElementById('resetPswPopup');
  const overlay = document.getElementById('overlay');
  const openPopup = document.getElementById("showForm");

  console.warn("Account Page - Web Version 2.3.28")

  let isOpen = false;

  if (new URLSearchParams(window.location.search).get('resetPsw') === 'true') {
    togglePopup();
    removeResetPswParam();
  };

    function togglePopup() {
      if (isOpen) {
        hidePopup();
      } else {
        showPopup();
      }
    }
  
    function showPopup() {
      overlay.style.backdropFilter = "blur(0px)"
      pswDiv.style.display = "block";
      overlay.style.display = "block";
      overlay.style.backdropFilter = "blur(8px)";
      void pswDiv.offsetWidth;
      pswDiv.style.opacity = "1";
      pswDiv.style.transform = "scale(1)";
      isOpen = true;
    }
  
    function hidePopup() {
      pswDiv.style.opacity = "0";
      pswDiv.style.transform = "scale(0.95)";
      overlay.style.backdropFilter = "blur(0px)";
      setTimeout(() => {
        pswDiv.style.display = "none";
        overlay.style.display = "none";
      }, 400);
      isOpen = false;
    }
  
    overlay.addEventListener("click", () => {
      if (isOpen) hidePopup();
    });
    
    if(openPopup) {
      openPopup.addEventListener("click", togglePopup);
    } else {
      console.error('Toggle button element not found');
    }

    document.getElementById("sendCodeBtn").addEventListener("click", () => {
      const email = document.getElementById("email").value.trim();
      
      if (!email) {
          showMessage("Please enter a valid email address.", "red");
          return;
      }
  
      fetch("https://api.a1dos-creations.com/send-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              showMessage("Verification code sent successfully!", "green");
          } else {
              showMessage("Failed to send verification code: " + data.message, "red");
          }
      })
      .catch(err => {
          console.error("Error sending verification code:", err);
          showMessage("Network error. Please try again later.", "red");
      });
  });  

  passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const verificationCode = document.getElementById('verificationCode').value.trim();
      const newPassword = document.getElementById('newPassword').value.trim();

      fetch('https://api.a1dos-creations.com/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, verificationCode, newPassword }),
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              showMessage("Password changed successfully.", 'green');
              setTimeout(() => showMessage(' ', 'black'), 3000);
              pswDiv.style.display = 'none';
          } else {
              showMessagePsw(data.message, 'red');
              setTimeout(() => showMessagePsw(' ', 'black'), 3000);
          }
      })
      .catch(err => console.error('Error updating password:', err));
  });
  