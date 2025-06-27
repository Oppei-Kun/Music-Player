
const songs = [
  {
    title: "Apple Cider",
    artist: "Beabadoobee",
    url: "beabadoobee-Apple-Cider.mp3",
    art: "Apple Cider.jpeg"
  },
  {
    title: "Coffee",
    artist: "Beabadoobee",
    url: "beabadoobee-Coffee.mp3",
    art: "coffee.jpeg"
  },
  {
    title: "Say So",
    artist: "Doja Cat",
    url: "Doja_Cat_-_Say_So.mp3",
    art: "Say-so.jpeg"
  },

  {
    title: "The Perfect Pair",
    artist: "Beabadoobee",
    url: "beabadoobee-The-Perfect-Pair.mp3",
    art: "The perfect pair.jpeg"
  }
];

let index = 0;
let isShuffle = false;
let isRepeat = false;

const audio = document.getElementById('audio');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const art = document.getElementById('art');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

function loadSong(i) {
  const song = songs[i];
  title.textContent = song.title;
  artist.textContent = song.artist;
  art.src = song.art;
  audio.src = song.url;
  highlightPlaylist(i);
}

function highlightPlaylist(i) {
  document.querySelectorAll("#playlist li").forEach((li, j) => {
    li.classList.toggle("active", j === i);
  });
}

document.getElementById("play").onclick = () => audio.play();
document.getElementById("pause").onclick = () => audio.pause();

document.getElementById("next").onclick = () => {
  index = isShuffle ? Math.floor(Math.random() * songs.length) : (index + 1) % songs.length;
  loadSong(index);
  audio.play();
};

document.getElementById("prev").onclick = () => {
  index = index === 0 ? songs.length - 1 : index - 1;
  loadSong(index);
  audio.play();
};

document.getElementById("shuffle").onclick = () => {
  isShuffle = !isShuffle;
  alert("Shuffle: " + (isShuffle ? "ON" : "OFF"));
};

document.getElementById("repeat").onclick = () => {
  isRepeat = !isRepeat;
  alert("Repeat: " + (isRepeat ? "ON" : "OFF"));
};

audio.onended = () => {
  if (isRepeat) {
    audio.play();
  } else {
    document.getElementById("next").click();
  }
};

// Progress Bar
audio.ontimeupdate = () => {
  const current = audio.currentTime;
  const total = audio.duration;
  if (total) {
    progress.value = (current / total) * 100;
    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(total);
  }
};

progress.oninput = () => {
  const seekTime = (progress.value / 100) * audio.duration;
  audio.currentTime = seekTime;
};

function formatTime(t) {
  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// Playlist
const playlist = document.getElementById("playlist");
songs.forEach((song, i) => {
  const li = document.createElement("li");
  li.textContent = song.title + " - " + song.artist;
  li.onclick = () => {
    index = i;
    loadSong(index);
    audio.play();
  };
  playlist.appendChild(li);
});

loadSong(index);

const toggleThemeBtn = document.getElementById('toggle-theme');

// Load saved theme
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

// Toggle
toggleThemeBtn.onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

const uploadInput = document.getElementById('upload');
const uploadBtn = document.getElementById('upload-btn');

// Trigger input when button is clicked
uploadBtn.onclick = () => uploadInput.click();

uploadInput.onchange = function () {
  const files = Array.from(this.files);

  files.forEach(file => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileData = e.target.result; // base64 audio data

      jsmediatags.read(file, {
        onSuccess: function (tag) {
          const tags = tag.tags;
          const title = tags.title || file.name.replace(/\.[^/.]+$/, "");
          const artist = tags.artist || "Local Upload";
          let art = "https://via.placeholder.com/300";

          if (tags.picture) {
            const { data, format } = tags.picture;
            let base64String = "";
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i]);
            }
            art = `data:${format};base64,${btoa(base64String)}`;
          }

          const newSong = {
            title,
            artist,
            url: fileData, // base64 audio
            art,
            lyrics: "Lyrics not available."
          };

          songs.push(newSong);
          saveSongsToLocalStorage();
          setupPlayer();
        },
        onError: function () {
          const fallbackSong = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Local Upload",
            url: fileData,
            art: "https://via.placeholder.com/300",
            lyrics: "Lyrics not available."
          };

          songs.push(fallbackSong);
          saveSongsToLocalStorage();
          setupPlayer();
        }
      });
    };

    reader.readAsDataURL(file);
  });
};


function saveSongsToLocalStorage() {
  const localSongs = songs.filter(song => song.url.startsWith("data:")); // only save base64
  localStorage.setItem("uploadedSongs", JSON.stringify(localSongs));
}


const stored = localStorage.getItem("uploadedSongs");
if (stored) {
  songs = JSON.parse(stored);
  setupPlayer();
}
