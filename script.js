// === ELEMENTS ===
const audioPlayer = document.getElementById('audio-player');
const songImage = document.getElementById('song-image');
const songTitle = document.getElementById('song-title');
const downloadLink = document.getElementById('download-link');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const ytUrlInput = document.getElementById('youtube-url');
const addYtBtn = document.getElementById('add-yt-btn');
const playlistList = document.getElementById('playlist-list');
const categoryMenuBtn = document.getElementById('category-menu-btn');
const categoryDropdown = document.getElementById('category-dropdown');

// === PLAYLIST & STATE ===
// YAHAN APNE GAANO KO CATEGORY KE SAATH DAALEIN
const masterPlaylist = [
    { type: 'mp3', title: 'Arijit Singh_ Ae Watan ', src: 'https://cepdelaoakyubgkvpppb.supabase.co/storage/v1/object/public/admin-songs/Arijit%20Singh_%20Ae%20Watan%20_%20Desh%20Mere%20_%20Lehra%20Do%20_%20Ashq%20Na%20Ho%20_%20Desh%20Bhakti%20Song(MP3_160K).mp3', image: './mjlogo.png', download: 'https://linksense.in/Arijit_Singh_Ae_Watan', category: 'Patriotic songs' },
    { type: 'mp3', title: 'Best of Pritam _ Nonstop Latest romantic songs ', src: 'https://cepdelaoakyubgkvpppb.supabase.co/storage/v1/object/public/admin-songs/Best%20of%20Pritam%20_%20Nonstop%20Latest%20romantic%20songs%20_%20Sorojit%20Biswas%20_(M4A_128K).m4a', image: './mjlogo.png', download: 'https://linksense.in/Best_of_Pritam', category: 'Love Songs' },
    { type: 'mp3', title: 'Radha Rani Song', src: 'https://cepdelaoakyubgkvpppb.supabase.co/storage/v1/object/public/admin-songs/Radha%20Rani%20_%20Swasti%20Mehul%20_%20Radha%20Krishna%20Bhajan(MP3_160K).mp3', image: './mjlogo.png', download: '://linksense.in/Hits_of_KK', category: 'Devotional Songs' },
    { type: 'mp3', title: 'Baarish Vibes With Arijit', src: 'https://dd.uptofiles.com/dd/2024/May/23/664f346e7f229/Uptofiles.com-Best_Of_Arijit_Singh_Mashup_2023(256k).mp3', image: './mjlogo.png', download: 'https://linksense.in/Arijit_Singh_Barish_ke_gane', category: 'Romantic' },
    { type: 'mp3', title: 'Hare Krishna Bhajan', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', image: './mjlogo.png', download: '#', category: 'Bhajan' },
    { type: 'mp3', title: 'Sample Bangla Song', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', image: './mjlogo.png', download: '#', category: 'Bangla' },
];

let currentPlaylist = [];
let currentSongIndex = 0;
let ytPlayer;
let isPlaying = false;
let isYTPlayerReady = false;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', initPlayer);

function initPlayer() {
    setupEventListeners();
    populateCategoryMenu();
    filterPlaylist('All'); // Shuruaat mein saare gaane dikhao
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);
    addYtBtn.addEventListener('click', addYouTubeSong);
    playlistList.addEventListener('click', handlePlaylistClick);
    categoryMenuBtn.addEventListener('click', toggleCategoryMenu);
    audioPlayer.addEventListener('play', () => setIsPlaying(true));
    audioPlayer.addEventListener('pause', () => setIsPlaying(false));
    audioPlayer.addEventListener('ended', playNextSong);
}

// === NAYA CATEGORY LOGIC ===
function populateCategoryMenu() {
    const categories = ['All', ...new Set(masterPlaylist.map(song => song.category))];
    categoryDropdown.innerHTML = '';
    categories.forEach(category => {
        const a = document.createElement('a');
        a.textContent = category === 'All' ? 'All Songs' : category;
        a.dataset.category = category;
        a.addEventListener('click', () => {
            filterPlaylist(category);
            toggleCategoryMenu(); // Menu ko band kar do
        });
        categoryDropdown.appendChild(a);
    });
}

function filterPlaylist(category) {
    if (category === 'All') {
        currentPlaylist = [...masterPlaylist];
    } else {
        currentPlaylist = masterPlaylist.filter(song => song.category === category);
    }
    updatePlaylistUI();
    if(currentPlaylist.length > 0) {
        loadSong(0); // Nayi playlist ka pehla gaana load karo
    } else {
        // Agar category mein koi gaana nahi hai
        songTitle.textContent = "Is category mein koi gaana nahi hai";
        songImage.src = "./mjlogo.png";
        currentPlaylist = [];
        updatePlaylistUI();
    }
}

function toggleCategoryMenu() {
    categoryDropdown.classList.toggle('show');
}
// Menu ke bahar click karne par use band kar do
window.onclick = function(event) {
    if (!event.target.matches('#category-menu-btn')) {
        if (categoryDropdown.classList.contains('show')) {
            categoryDropdown.classList.remove('show');
        }
    }
}

// === YOUTUBE API CALLBACKS ===
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerReady(event) {
    isYTPlayerReady = true;
    ytUrlInput.disabled = false;
    addYtBtn.disabled = false;
    ytUrlInput.placeholder = 'YouTube link yahan daalein';
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        const videoData = ytPlayer.getVideoData();
        currentPlaylist[currentSongIndex].title = videoData.title;
        songTitle.textContent = videoData.title;
        updatePlaylistUI();
        setIsPlaying(true);
    } else if (event.data === YT.PlayerState.PAUSED) {
        setIsPlaying(false);
    } else if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    }
}

// === PLAYLIST UI FUNCTION ===
function updatePlaylistUI() {
    playlistList.innerHTML = '';
    currentPlaylist.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        li.dataset.index = index;
        if (index === currentSongIndex && isPlaying) {
            li.classList.add('active');
        }
        playlistList.appendChild(li);
    });
}

// === CORE PLAYER LOGIC ===
function loadSong(index) {
    if(currentPlaylist.length === 0) return;
    currentSongIndex = index;
    const song = currentPlaylist[index];
    
    setIsPlaying(false);
    songTitle.textContent = song.title;
    songImage.src = song.type === 'mp3' ? song.image : `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`;
    updatePlaylistUI();

    if (song.type === 'mp3') {
        audioPlayer.src = song.src;
        downloadLink.classList.remove('disabled');
        downloadLink.href = song.download;
    } else {
        downloadLink.classList.add('disabled');
        downloadLink.href = '#';
        if (isYTPlayerReady) {
            ytPlayer.cueVideoById(song.id);
        }
    }
}

function togglePlayPause() {
    if(currentPlaylist.length === 0) return;
    if (isPlaying) pauseSong();
    else playSong();
}

function playSong() {
    const song = currentPlaylist[currentSongIndex];
    if (song.type === 'mp3') {
        audioPlayer.play();
    } else if (song.type === 'youtube' && isYTPlayerReady) {
        ytPlayer.playVideo();
    }
}

function pauseSong() {
    const song = currentPlaylist[currentSongIndex];
    if (song.type === 'mp3') {
        audioPlayer.pause();
    } else if (song.type === 'youtube' && isYTPlayerReady) {
        ytPlayer.pauseVideo();
    }
}

function setIsPlaying(state) {
    isPlaying = state;
    playPauseBtn.innerHTML = state ? '❚❚' : '▶';
    songImage.classList.toggle('rotate', state);
    updatePlaylistUI();
}

function playNextSong() {
    if(currentPlaylist.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    loadSong(currentSongIndex);
    playSong();
}

function playPrevSong() {
    if(currentPlaylist.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadSong(currentSongIndex);
    playSong();
}

function addYouTubeSong() {
    const url = ytUrlInput.value;
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (videoId && videoId[1]) {
        const newSong = {
            type: 'youtube',
            id: videoId[1],
            title: 'YouTube Gaana (Loading...)',
            category: 'YouTube' // YouTube gaano ke liye alag category
        };
        // Naye gaane ko master playlist mein bhi daalo
        masterPlaylist.push(newSong);
        // Current playlist ko filter karke update karo taaki naya gaana dikhe
        filterPlaylist(newSong.category);
        ytUrlInput.value = '';
        
        // Naye gaane ko turant play karo
        setTimeout(() => {
            loadSong(currentPlaylist.length - 1);
            playSong();
        }, 100);
        
    } else {
        alert('Yeh ek valid YouTube link nahi hai.');
    }
}

function handlePlaylistClick(e) {
    if (e.target && e.target.nodeName === 'LI') {
        const index = parseInt(e.target.dataset.index, 10);
        loadSong(index);
        playSong();
    }
}
