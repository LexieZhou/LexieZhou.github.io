let songsSecondHalf = document.getElementById("songs-second-half")
function toggleSongs() {
    songsSecondHalf.classList.toggle("hidden");
}
document.getElementById("toggle-button").onclick = toggleSongs;