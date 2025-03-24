const uniqueId = window.location.pathname.split('/').pop();

fetch(`https://api.a1dos-creations.com/movie/${uniqueId}`)
  .then(response => response.json())
  .then(movie => {
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieDescription').textContent = movie.description;
    document.getElementById('releaseDate').textContent = `Release Date: ${movie.release_date || 'N/A'}`;
  })
  .catch(error => {
    console.error('Error fetching movie data:', error);
    document.getElementById('movieTitle').textContent = 'Error fetching movie details';
    document.getElementById('movieDescription').textContent = 'Could not load the movie details. Please try again later.';
  });

function submitRSVP(event) {
  event.preventDefault();

  const name = event.target.name.value;
  const guests = event.target.guests.value;

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
