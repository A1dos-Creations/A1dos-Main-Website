const dntBtn = document.getElementById("donateInstead");
let countdown = 3; 
const redirectURL = "https://paypal.me/a1dos?country.x=US&locale.x=en_US";
const redirectBck = document.getElementById("redirectBackup");

function updateCountdown() {
    document.getElementById("countdown").textContent = countdown;
    if (countdown > 0) {
        countdown--;
        setTimeout(updateCountdown, 1000); // Update every second
        redirectBck.href = redirectURL;
    } else {
        window.location.href = redirectURL;
    }
}

window.onload = updateCountdown;

dntBtn.addEventListener("click", () => {
    window.location.href = "/redirect.html";
});