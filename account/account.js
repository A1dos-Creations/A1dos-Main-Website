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

    const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
    

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
        // Redirect the user to the Stripe Checkout page.
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
  
    updateGoogleButton();
  });
  