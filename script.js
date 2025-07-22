// Get references to HTML elements
const audioPlayer = document.getElementById('audio-player');
const globalPlayPauseButton = document.getElementById('global-play-pause-button');
const progressBar = document.getElementById('progress');
const progressBarContainer = document.getElementById('progress-bar');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const nowPlayingBar = document.querySelector('.now-playing-bar');
const nowPlayingCover = document.getElementById('now-playing-cover');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingArtist = document.getElementById('now-playing-artist'); // Assuming you might add artist info later
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// Get all individual card play buttons
const cardPlayButtons = document.querySelectorAll('.card .play-button');

// Variable to keep track of the currently playing song's card ID
let currentPlayingCardId = null;

// --- Helper Functions ---

/**
 * Formats time in seconds into MM:SS format.
 * @param {number} seconds - The time in seconds.
 * @returns {string} Formatted time string.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Updates the play/pause icon for a given button.
 * @param {HTMLElement} button - The button element.
 * @param {boolean} isPlaying - True if playing, false if paused.
 */
function updatePlayPauseIcon(button, isPlaying) {
    button.innerHTML = isPlaying ?
        `<svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>` :
        `<svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}

/**
 * Resets all card play buttons to a play icon.
 */
function resetAllCardPlayIcons() {
    cardPlayButtons.forEach(button => {
        updatePlayPauseIcon(button, false); // Set to play icon
    });
}

/**
 * Plays a specific song.
 * @param {string} src - The URL of the song.
 * @param {string} title - The title of the song.
 * @param {string} cover - The URL of the song cover image.
 * @param {string} cardId - The ID of the card associated with the song.
 */
function playSong(src, title, cover, cardId) {
    // If a new song is clicked, reset the icon of the previously playing card
    if (currentPlayingCardId && currentPlayingCardId !== cardId) {
        const prevCard = document.querySelector(`.card[data-song-id="${currentPlayingCardId}"]`);
        if (prevCard) {
            const prevPlayButton = prevCard.querySelector('.play-button');
            if (prevPlayButton) {
                updatePlayPauseIcon(prevPlayButton, false); // Change to play icon
            }
        }
    }

    audioPlayer.src = src;
    nowPlayingCover.src = cover;
    nowPlayingTitle.textContent = title;
    // For simplicity, artist is hardcoded as 'Unknown Artist' or can be derived if available
    nowPlayingArtist.textContent = 'Unknown Artist'; // You can extend this if you have artist data
    nowPlayingBar.style.display = 'flex'; // Show the now playing bar

    audioPlayer.play();
    updatePlayPauseIcon(globalPlayPauseButton, true); // Set global button to pause
    currentPlayingCardId = cardId; // Update currently playing card ID

    // Update the icon of the specific card that was clicked
    const clickedCard = document.querySelector(`.card[data-song-id="${cardId}"]`);
    if (clickedCard) {
        const clickedPlayButton = clickedCard.querySelector('.play-button');
        if (clickedPlayButton) {
            updatePlayPauseIcon(clickedPlayButton, true); // Change to pause icon
        }
    }
}

// --- Event Listeners ---

// Listen for clicks on individual song card play buttons
cardPlayButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click event if any
        const songSrc = button.dataset.songSrc;
        const songTitle = button.dataset.songTitle;
        // Get the cover image from the parent card
        const card = button.closest('.card');
        const songCover = card.querySelector('img').src;
        const cardId = card.dataset.songId;

        if (audioPlayer.src.includes(songSrc) && !audioPlayer.paused) {
            // If the same song is playing, pause it
            audioPlayer.pause();
            updatePlayPauseIcon(globalPlayPauseButton, false); // Set global button to play
            updatePlayPauseIcon(button, false); // Set card button to play
        } else if (audioPlayer.src.includes(songSrc) && audioPlayer.paused) {
            // If the same song is paused, play it
            audioPlayer.play();
            updatePlayPauseIcon(globalPlayPauseButton, true); // Set global button to pause
            updatePlayPauseIcon(button, true); // Set card button to pause
        } else {
            // Play a new song
            playSong(songSrc, songTitle, songCover, cardId);
        }
    });
});

// Global Play/Pause button functionality
globalPlayPauseButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        updatePlayPauseIcon(globalPlayPauseButton, true); // Set to pause icon
        // If a song is playing from a card, update its icon too
        if (currentPlayingCardId) {
            const card = document.querySelector(`.card[data-song-id="${currentPlayingCardId}"]`);
            if (card) {
                const button = card.querySelector('.play-button');
                if (button) {
                    updatePlayPauseIcon(button, true);
                }
            }
        }
    } else {
        audioPlayer.pause();
        updatePlayPauseIcon(globalPlayPauseButton, false); // Set to play icon
        // If a song is playing from a card, update its icon too
        if (currentPlayingCardId) {
            const card = document.querySelector(`.card[data-song-id="${currentPlayingCardId}"]`);
            if (card) {
                const button = card.querySelector('.play-button');
                if (button) {
                    updatePlayPauseIcon(button, false);
                }
            }
        }
    }
});

// Update progress bar and time display as song plays
audioPlayer.addEventListener('timeupdate', () => {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
});

// Update total duration when song metadata is loaded
audioPlayer.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(audioPlayer.duration);
});

// Handle song ending
audioPlayer.addEventListener('ended', () => {
    updatePlayPauseIcon(globalPlayPauseButton, false); // Set global button to play
    if (currentPlayingCardId) {
        const card = document.querySelector(`.card[data-song-id="${currentPlayingCardId}"]`);
        if (card) {
            const button = card.querySelector('.play-button');
            if (button) {
                updatePlayPauseIcon(button, false); // Set card button to play
            }
        }
    }
    currentPlayingCardId = null; // Reset current playing song
    nowPlayingBar.style.display = 'none'; // Hide the now playing bar
});

// Seek functionality for progress bar
progressBarContainer.addEventListener('click', (e) => {
    const clickX = e.clientX - progressBarContainer.getBoundingClientRect().left;
    const width = progressBarContainer.offsetWidth;
    const seekTime = (clickX / width) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
    // You could also change the volume icon based on volume level here
});

// Set initial volume
audioPlayer.volume = volumeSlider.value;

// Initial state: hide the now playing bar until a song is played
nowPlayingBar.style.display = 'none';



let a =document.getElementById("spotilogo");
let b=  document.getElementById("homelogo");




    a.addEventListener('click', () => {
        window.location.reload(); // Reloads the current page (index.html in this case)
    });

    b.addEventListener('click', () => {
        window.location.reload(); // Reloads the current page (index.html in this case)
    });



    let c=document.getElementsByClassName("playlist");

    c[0].addEventListener('click',()=>{
               window.location.href="index.html";

    });


    c[1].addEventListener('click',()=>{
window.location.reload();

    });