function removeGoogleLinkedParam() {
    const url = new URL(window.location);
    url.searchParams.delete("googleLinked");
    window.history.replaceState({}, document.title, url.pathname);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem("user") || "{}");
  
    const accountInfoDiv = document.getElementById('accountInfo');
    const googleLinkBtn = document.getElementById('google-link-btn');
    const googleLinkBtnTxt = document.getElementById('google-link-btn-text');
    const googleStatus = document.getElementById('google-status');
    const emailToggle = document.getElementById('emailToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const logoutBtn = document.getElementById("logout-btn");
    const hidden = document.getElementById('about');
    const showbtn = document.getElementById('aboutHvr');
  
    if (showbtn && hidden) {
      showbtn.addEventListener('mouseover', () => {
        hidden.style.display = 'block';
      });
      showbtn.addEventListener('mouseout', () => {
        hidden.style.display = 'none';
      });
    }
  
    function showMessage(msg, color = 'black') {
      const message = document.getElementById('message');
      message.textContent = msg;
      message.style.color = color;
      message.style.display = msg.trim() ? 'block' : 'none';
    }
  
    if (user && user.email) {
      const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown";
      accountInfoDiv.innerHTML = `
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Account Created:</strong> ${createdAt}</p>
        <p><strong>Name:</strong> ${user.name}</p>
      `;
    } else {
      accountInfoDiv.innerHTML = "<p>User data not available. Please log in.</p>";
      window.location.href = "./auth";
    }
  
    if (emailToggle && toggleLabel) {
      if (user.email_notifications === false) {
        emailToggle.checked = false;
        toggleLabel.textContent = "Disabled";
      } else {
        emailToggle.checked = true;
        toggleLabel.textContent = "Enabled";
      }
      emailToggle.addEventListener('change', () => {
        const newPreference = emailToggle.checked;
        toggleLabel.textContent = newPreference ? "Enabled" : "Disabled";
        if (!token) {
          showMessage("Session expired. Please log in again.", 'red');
          return;
        }
        fetch("https://a1dos-login.onrender.com/update-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, emailNotifications: newPreference }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showMessage("Notification preferences updated.", 'green');
            user.email_notifications = newPreference;
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            showMessage("Failed to update preferences: " + data.message, 'red');
          }
        })
        .catch(err => console.error("Error updating preferences:", err));
      });
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    let googleLinked = urlParams.get('googleLinked') === 'true';
    if (googleLinked) {
      googleStatus.textContent = "Google Account Linked ✅";
      showMessage("Google account linked successfully! ✅", 'green');
      setTimeout(() => showMessage(' ', 'black'), 4000);
      removeGoogleLinkedParam();
    }
  
    function updateGoogleButton() {
      if (googleLinked) {
        googleLinkBtnTxt.textContent = "Unlink Google Account";
        googleLinkBtn.onclick = unlinkGoogleHandler;
      } else {
        googleLinkBtnTxt.textContent = "Link Google Account";
        googleLinkBtn.onclick = linkGoogleHandler;
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
          setTimeout(() => showMessage(' ', 'black'), window.location.href = "account.html", 3000);
          googleLinked = false;
          googleStatus.textContent = "Google Account Not Linked ❌";
          localStorage.removeItem("googleLinked");
          updateGoogleButton();
        } else {
          showMessage("Error unlinking Google: " + data.message, 'red');
        }
      })
      .catch(err => console.error("Error unlinking Google:", err));
    }
  
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

    const stripe = Stripe('pk_live_51QzQdOG1SPsRBHogtiBFwbebzV9JmhES0R4ZZGjHABPcEvnpGZaFDGlDONzPMz0gNMn664g1fcfhrUYpaUv4We7o00QsWelAuT');
    

    document.getElementById('upgrade-button').addEventListener('click', () => {
      fetch('https://a1dos-login.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          const userId = data.user.id;
          return stripe.redirectToCheckout({ sessionId: data.id });
        }
      })
      .then(response => response.json())
      .then(data => {
        return stripe.redirectToCheckout({ sessionId: data.id });
      })
      .then(result => {
        if (result.error) {
          console.error(result.error.message);
        }
      })
      .catch(error => {
        console.error('Error creating checkout session:', error);
      });
    });

    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const passwordForm = document.getElementById('passwordForm');
    const showForm = document.getElementById('showForm');
    const pswDiv = document.getElementById('resetPswPopup');

    showForm.addEventListener('click', () => {
      if(pswDiv.style.display === 'block') {
          pswDiv.style.display = 'none';
      } else {
        pswDiv.style.display = 'block';
      }
    });

    function showMessagePsw(msg, color = 'black') {
      const message = document.getElementById('pswAlert');
      message.textContent = msg;
      message.style.color = color;
      message.style.display = msg.trim() ? 'block' : 'none';
    }

    sendCodeBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value.trim();
        fetch('https://a1dos-login.onrender.com/send-verification-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessagePsw("Verification code sent to your email.", 'green');
                setTimeout(() => showMessagePsw(' ', 'black'), 3000);
            } else {
                showMessagePsw(data.message, "red");
                setTimeout(() => showMessagePsw(' ', 'black'), 3000);
            }
        })
        .catch(err => console.error('Error sending verification code:', err));
    });

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const verificationCode = document.getElementById('verificationCode').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();

        fetch('https://a1dos-login.onrender.com/update-password', {
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

    
  
    updateGoogleButton();
  });


  function loadUserSessions() {
    fetch("https://a1dos-login.onrender.com/get-user-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
          const deviceList = document.getElementById("deviceList");
          console.log("Device list element:", deviceList);
          if (!deviceList) {
            console.error("No element with id 'deviceList' found in the DOM.");
          }
          deviceList.innerHTML = "<br>";
  
          data.sessions.forEach(session => {
              const li = document.createElement("li");
              li.innerHTML = `
                  <strong>Device:</strong> ${session.device_info} <br>
                  <strong>Location:</strong> ${session.location || "Unknown Location"} <br>
                  <strong>Last Login:</strong> ${new Date(session.login_time).toLocaleString()} 
                  <button onclick="revokeSession(${session.id})">Revoke</button>
                  <br>
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
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
  
    fetch("https://a1dos-login.onrender.com/get-user-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
          const deviceList = document.getElementById("deviceList");
          console.log("Device list element:", deviceList);
          if (!deviceList) {
            console.error("No element with id 'deviceList' found in the DOM.");
          }
          deviceList.innerHTML = "<br>";
  
          data.sessions.forEach(session => {
              const li = document.createElement("li");
              li.innerHTML = `
                  <strong>Device:</strong> ${session.device_info} <br>
                  <strong>Location:</strong> ${session.location || "Unknown Location"} <br>
                  <strong>Last Login:</strong> ${new Date(session.login_time).toLocaleString()} 
                  <button onclick="revokeSession(${session.id})">Revoke</button>
                  <br>
              `;
              deviceList.appendChild(li);
          });
  
          deviceList.style.display = "block";
      } else {
          deviceList.innerHTML = "<li>No sessions found.</li>";
      }
  })
  .catch(err => console.error("Error fetching sessions:", err));
  
    
  });

  function showMessage(msg, color = 'black') {
    const message = document.getElementById('message');
    message.textContent = msg;
    message.style.color = color;
    message.style.display = msg.trim() ? 'block' : 'none';
  }
  
  function revokeSession(sessionId, sessionToken) {
    const currentToken = localStorage.getItem("authToken");
    fetch('https://a1dos-login.onrender.com/revoke-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: currentToken, sessionId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showMessage("Session revoked successfully.", "green");
          setTimeout(() => showMessage(' ', 'black'), 3000);

          if (sessionToken === currentToken) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("googleLinked");
            window.location.href = "./auth.html";
          } else {
            loadUserSessions();
          }
        } else {
          showMessage("Failed to revoke session: " + data.message, "red");
          setTimeout(() => showMessage(' ', 'black'), 3000);

        }
      })
      .catch(err => console.error("Error revoking session:", err));
  }
  
  
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  
  if (token) {
    try {
      const decoded = jwt_decode(token); 
      const expiry = decoded.exp * 1000;
      if (Date.now() > expiry) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("authToken");
        window.location.href = "./account/auth.html";
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      window.location.href = "./account/auth.html";
    }
  } else {
    window.location.href = "./account/auth.html";
  }
});

fetch('https://a1dos-login.onrender.com/verify-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})
.then(response => {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error("HTTP error " + response.status);
  }
  return response.json();
})
.then(data => {
})
.catch(err => {
  showMessage(err.message, "red");
  setTimeout(() => showMessage(' ', 'black'), 3000);
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("googleLinked");
  window.location.href = "./account/auth.html";
});

  