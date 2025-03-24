// Function to extract uniqueId from the URL path
function getUniqueIdFromPath() {
    const pathParts = window.location.pathname.split('/'); // Split the URL path by '/'
    return pathParts[pathParts.length - 1]; // The last part should be the uniqueId
  }
  
  // Get the uniqueId from the URL path
  const uniqueId = getUniqueIdFromPath();
  
  // Check if uniqueId is available
  if (!uniqueId) {
    document.getElementById('movieTitle').textContent = 'Error: No Movie ID Provided';
    document.getElementById('movieDescription').textContent = 'Please provide a valid movie ID.';
  } else {
    // Fetch the movie data from the API using the uniqueId
    fetch(`https://api.a1dos-creations.com/movie/${uniqueId}`)
      .then(response => response.json())
      .then(movie => {
        // If movie data is successfully fetched, display it
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieDescription').textContent = movie.description;
        document.getElementById('releaseDate').textContent = `Release Date: ${movie.release_date || 'N/A'}`;
      })
      .catch(error => {
        console.error('Error fetching movie data:', error);
        document.getElementById('movieTitle').textContent = 'Error fetching movie details';
        document.getElementById('movieDescription').textContent = 'Could not load the movie details. Please try again later.';
      });
  }
  
  // RSVP form submission
  function submitRSVP(event) {
    event.preventDefault();
  
    const name = event.target.name.value;
    const guests = event.target.guests.value;
  
    // Send RSVP data to your backend API (you can customize this endpoint)
    fetch(`https://api.a1dos-creations.com/movie/rsvp/${uniqueId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, guests })
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('rsvpStatus').textContent = `RSVP submitted successfully: ${data.message}`;
      })
      .catch(error => {
        console.error('Error submitting RSVP:', error);
        document.getElementById('rsvpStatus').textContent = 'Failed to submit RSVP.';
      });
  }
  