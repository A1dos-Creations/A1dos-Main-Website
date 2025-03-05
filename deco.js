const canvas = document.getElementById("starsCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
const numStars = 150;
const speedFactor = 0.008; // Mouse movement effect
const scrollFactor = 0.2; // How much stars move when scrolling

// Resize canvas to cover the full scrollable page
function resizeCanvas() {
  canvas.width = document.documentElement.scrollWidth;
  canvas.height = document.documentElement.scrollHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Create normal stars
for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1 + 0.5,
    baseBrightness: Math.random() * 0.4 + 0.3,
    phase: Math.random() * Math.PI * 2
  });
}

// Track mouse movement for parallax effect
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Track scroll position for slight scrolling effect
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// Function to add a shooting star at a random interval
function addShootingStar() {
  shootingStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    length: Math.random() * 80 + 50,
    speed: Math.random() * 2 + 2,
    opacity: 1,
    fadeRate: 0.02
  });

  setTimeout(addShootingStar, Math.random() * 120000 + 60000);
}
addShootingStar();

function drawStars(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const t = time * 0.001;

  // Draw normal stars
  for (let star of stars) {
    const moveX = (mouseX / window.innerWidth - 0.5) * speedFactor * canvas.width;
    const moveY = (mouseY / window.innerHeight - 0.5) * speedFactor * canvas.height;
    const scrollOffset = scrollY * scrollFactor; // Apply a slight scroll effect

    const starX = star.x + moveX;
    const starY = star.y + moveY + scrollOffset;

    const twinkle = Math.sin(t + star.phase) * 0.2;
    const currentBrightness = Math.min(Math.max(star.baseBrightness + twinkle, 0), 1);

    ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
    ctx.beginPath();
    ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let star = shootingStars[i];
    star.x += star.speed;
    star.y += star.speed * 0.5;
    star.opacity -= star.fadeRate;

    ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
    ctx.stroke();

    if (star.opacity <= 0) {
      shootingStars.splice(i, 1);
    }
  }

  requestAnimationFrame(drawStars);
}

requestAnimationFrame(drawStars);
