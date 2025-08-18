console.log("Javascript is running");
let audio = new Audio();
let control = document.getElementsByClassName('control')[1];
let back = document.getElementsByClassName('control')[0];
let next = document.getElementsByClassName('control')[2];
let flag = false;
let s_name = document.getElementById('name');
let artist = document.getElementById('artist');
let song_list = [];
let curr_song, curr_folder;
let sound_bar = document.getElementById('sound');

async function display_songs(folder) {
    curr_folder = folder;
    song_list = [];
    let songs = await fetch(`${folder}`);
    let song_info = await songs.text();
    let div = document.createElement('div');
    div.innerHTML = song_info;
    document.querySelector('.playlist').innerHTML = ``;
    div.querySelectorAll('a').forEach((x) => {
        if (x.href.includes('.mp3')) {
            let song = x.href.split('/').slice(-1)[0];
            let item = document.createElement('li');
            item.className = 'lcard';
            item.innerHTML = `
                        <div class="details">
                            <div class="song_name">${song.slice(0, 20)}</div>
                            <div class="song_artist">Artist</div>
                        </div>
                        <div class="play">
                            <span style="  padding-left: 10px;font-weight:bold">Play</span>
                            <img src="./assets/icons/play_now.svg" alt="" height="30px">
                        </div>
                    </div>`;
            document.querySelector('.playlist').append(item);
            item.addEventListener('click', () => { play_music(song) });
            song_list.push(x.href.split('/').slice(-1).toString());
        }
    });
}

async function display_albums(folders) {
    for (let i = 0; i < folders.length; i++) {
        let info = await fetch(`${folders[i]}/info.json`);
        let processed_info = await info.json();
        let template = `<div class="card" onclick='display_songs("${folders[i]}")'>
                    <div class="img">
                        <img src="${folders[i]}/profile.jpg" class="album_profile">
                        <div class="inbtn">
                            <img src="./assets/icons/float-btn.svg" alt="" class="float-btn">
                        </div>
                    </div>
                    <div class="description">
                        <div class="chead">${processed_info.title}</div>
                        <div class="artist">${processed_info.artist}</div>
                    </div>
                </div>`;

        //write code for selecting which section to populate
        document.querySelector('.ch1').innerHTML += template;
        if (i > 4) {
            document.querySelector('.ch2').innerHTML += template;
        }

    }
}

async function play_music(music) {
    curr_song = song_list.indexOf(music);

    s_name.innerHTML = music;
    audio.src = curr_folder + `/` + music;
    flag = true;
    await audio.play();
    control.src = `./assets/icons/pause.svg`;
    display_timestamp();
}


function s2m(seconds) {
    let minutes = Math.floor(seconds / 60);
    let second = Math.floor(seconds % 60);

    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(second).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}

async function display_timestamp() {
    let time = Math.floor(audio.duration);
    document.getElementById('duration').innerHTML = `${s2m(time)}`;
    audio.addEventListener('timeupdate', () => {
        document.getElementById('timer').innerHTML = `${s2m(audio.currentTime)}`;
        document.getElementById('dot').style.left = `${(audio.currentTime / audio.duration) * 100}%`;
        if (audio.currentTime == audio.duration) {
            control.src = `./assets/icons/play.svg`;
        }
    })
}

async function main() {
    //gets all the albums 
    let data = await fetch("http://127.0.0.1:5500/assets/songs/");
    let processed_data = await data.text();
    let div = document.createElement('div');
    div.innerHTML = processed_data;
    let arr = Array.from(div.getElementsByTagName('a'));
    let albums = [];
    let vbutton = document.getElementById('volume');
    sound_bar.value = 100;

    arr.forEach((x) => {
        if (x.href.includes('album')) {
            albums.push(x.href)
        };
    });

    //display albums
    display_albums(albums);

    //display default songs
    display_songs("/assets/songs/album1/");

    //seekbar control

    document.querySelector('.playbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        audio.currentTime = (audio.duration * percent) / 100;
    })

    //handling the controls

    control.addEventListener('click', () => {
        document.getElementById('dot').style.left = `${(audio.currentTime / audio.duration) * 100}%`;
        if (audio.src != ``) {
            let currState = control.src.split('/').slice(-1);
            if (currState == `play.svg` && flag == false) {
                audio.play();
                control.src = `./assets/icons/pause.svg`;
                flag = true;
            }
            else if (currState == `pause.svg` && flag == true) {
                audio.pause();
                control.src = `./assets/icons/play.svg`;
                flag = false;
            }
        }
    })

    back.addEventListener('click', () => {
        if (audio.src != ``) {
            audio.pause();
            if (curr_song == 0) {
                play_music(song_list[song_list.length - 1]);
            }
            else {
                play_music(song_list[curr_song - 1]);
            }
        }
    })

    next.addEventListener('click', () => {
        if (audio.src != ``) {
            audio.pause();
            if (curr_song == song_list.length - 1) {
                play_music(song_list[0]);
            }
            else {
                play_music(song_list[curr_song + 1]);
            }
        }
    })

    sound_bar.addEventListener('change', () => {
        audio.volume = sound_bar.value / 100;
        if (sound_bar.value == 0) {
            vbutton.src = `./assets/icons/mute.svg`;
        }
        else {
            vbutton.src = `./assets/icons/volume.svg`;
        }
    })

    vbutton.addEventListener('click', () => {
        if (sound_bar.value == 0) {
            vbutton.src = `./assets/icons/volume.svg`;
            sound_bar.value = 70;
            audio.volume = 0.7;
        }
        else {
            vbutton.src = `./assets/icons/mute.svg`;
            sound_bar.value = 0;
            audio.volume = 0;
        }
    });

    document.getElementById('menu').addEventListener('click', () => {
        document.querySelector('.bleft').style.display = 'block';
    });
    document.getElementById('close').addEventListener('click', () => {
        document.querySelector('.bleft').style.display = 'none';
    });
}
main();