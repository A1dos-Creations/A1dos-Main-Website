function submitRSVP(event, uniqueId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    const guests = formData.get('guests');
  
    const token = localStorage.getItem("authToken") || "";
  
    fetch('https://api.a1dos-creations.com/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ uniqueId, name, guests })
    })
    .then(res => res.json())
    .then(data => {
      const statusEl = document.getElementById(`rsvpStatus-${uniqueId}`);
      if (data.success) {
        statusEl.textContent = "RSVP successful!";
        statusEl.style.color = "green";
      } else {
        statusEl.textContent = "Error: " + data.message;
        statusEl.style.color = "red";
      }
    })
    .catch(err => {
      console.error("RSVP error:", err);
      document.getElementById(`rsvpStatus-${uniqueId}`).textContent = "Network error!";
    });
  }
  