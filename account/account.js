function removeGoogleLinkedParam() {
  const url = new URL(window.location);
  url.searchParams.delete("googleLinked");
  window.history.replaceState({}, document.title, url.pathname);
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  let googleLinked = localStorage.getItem('googleLinked') === 'true'; // Get Google linked status from localStorage
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

  const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('googleLinked') === 'true'){
        localStorage.setItem('googleLinked', 'true');
    }

    if (!token) {
      window.location.href = "./auth.html";
      return;
  }

  try {
      const decoded = jwt_decode(token);
      const expiry = decoded.exp * 1000;
      if (Date.now() > expiry) {
          alert("Your session has expired. Please log in again.");
          localStorage.clear();
          window.location.href = "./auth.html";
          return;
      }
  } catch (error) {
      console.error("Error decoding token:", error);
      window.location.href = "./auth.html";
      return;
  }

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
          fetch("https://a1dos-login.onrender.com/update-notifications", {
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
    fetch('https://a1dos-login.onrender.com/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
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
    fetch("https://a1dos-login.onrender.com/unlink-google", {
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
  fetch('https://a1dos-login.onrender.com/check-google-link', {
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

checkGoogleLinkStatus();

  // Device sessions: revoke session and load sessions
  window.revokeSession = function(sessionId, sessionToken) {
      fetch('https://a1dos-login.onrender.com/revoke-session', {
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
      fetch("https://a1dos-login.onrender.com/get-user-sessions", {
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
                      <strong>Last Login:</strong> ${new Date(session.login_time).toLocaleString()} <br>\n                        <button onclick="revokeSession(${session.id}, '${session.session_token}')\">Revoke</button><br>\n                    `;
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
