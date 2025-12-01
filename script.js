import { Filter } from "https://esm.sh/bad-words";
import { load_data, add_data, update_data } from './user_info.js'



class game {

    constructor(player, word_num) {
        this.player = player;
        this.word_num = word_num;
        this.current_score = 0
    }

    async get_song_info() {
        console.log(word_num)
        let song_info = await generate_song_info();
        let lyrics = song_info[0]
        let artist = song_info[1]
        let title = song_info[2]
        this.correct_answer_str = `${artist} — ${title}`
        lyrics = lyrics.replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
        let lyrics_arr = lyrics.split(/\s+/);
        let start = Math.floor(Math.random() * (lyrics_arr.length - this.word_num))
        this.correct_answer_arr = [artist, title]
        return [lyrics_arr.slice(start, start + this.word_num).join(' '), artist, title]
    }

    async generate_options() {
        let options = [this.correct_answer_arr]
        for (let i = 0; i < 3; i++) {
            let song = await generate_song();
            song = song.results[0]
            options.push([song.artistName, song.trackName]);
        }

        let shuffled_options = []
        for (let i = 0; i < 4; i++) {
            let random_option_index = Math.floor(Math.random() * (4 - i));
            shuffled_options.push(options.splice(random_option_index, 1)[0]);
        }
        return shuffled_options;
    }

    async display_data(lyrics, options) {
        let buttons = document.querySelectorAll('.opt');
        buttons.forEach((btn, index) => {
            btn.textContent = options[index].join(' — ');
        });

        document.getElementById('lyrics').textContent = lyrics;
    }

    async init_round() {
        all_players_info = await load_data(player_name);
        player_index = all_players_info.findIndex(d => String(d.name) === String(player_name));
        player_info = all_players_info[player_index];
        document.getElementById('player_info').textContent = player_info.name;
        document.getElementById('player_score').textContent = `Score: ${this.current_score} | High score: ${player_info.high_score[diff_index]}`
        let song_info = await this.get_song_info();
        console.log(song_info);

        let options = await this.generate_options();
        console.log(options);

        await this.display_data(song_info[0], options);

    }
}

const difficulty = sessionStorage.getItem('difficulty');
let word_num = 0
let diff_index = 0
if (difficulty == 'easy') {
    word_num = 30;
    diff_index = 0;
} else if (difficulty == 'medium') {
    word_num = 20;
    diff_index = 1;
} else if (difficulty == 'hard') {
    word_num = 10;
    diff_index = 2;
}
let player_name = sessionStorage.getItem('name');

let all_players_info = await load_data(player_name);
let player_index = all_players_info.findIndex(d => String(d.name) === String(player_name));
let player_info = all_players_info[player_index];

let new_game = new game(player_info.name, word_num);
new_game.init_round()
document.querySelectorAll('.opt').forEach(option => {
            option.addEventListener('click', async () => {
                if (option.textContent == new_game.correct_answer_str) {
                    new_game.current_score += 1;
                } else {
                    if (new_game.current_score > player_info.high_score[diff_index]) {
                        let new_high_scores = [...player_info.high_score];
                        new_high_scores[diff_index] = new_game.current_score;
                        await update_data(player_info.name, new_high_scores);
                    }
                    new_game.current_score = 0;
                }
                new_game.init_round();
            });
        });



async function generate_query() {
  let res = await fetch("https://random-word-api.vercel.app/api?words=1");
  let data = await res.json();
  return data[0];
}

async function generate_song() {
    let query =  await generate_query()
    console.log(query)

    let song_res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=musicTrack&attribute=songTerm&lang=en_us&limit=1`)
    if (!song_res.ok) {
        console.log('Limit reached')
    }
    let song = await song_res.json();
    return song
}

async function generate_song_info() {
    while (true){
        let song = await generate_song()
        song = song.results[0]

        var artist = song.artistName;
        var title = song.trackName;
        console.log(`${artist}; ${title}`);
        var song_lyrics = false;
        while (true) {
            try {
                if (artist.includes("/") || artist.includes("\\") || title.includes("/") || title.includes("\\")) {
                    break
                }
                song_lyrics = await fetch_lyrics_with_timeout(artist, title);
                break;
            } catch (err) {
                if (err.message === "Timeout") {
                    continue;
                } else {
                    break;
                }
            }
        }
        if (song_lyrics.lyrics) {
            break;
        }    
    }

    const filter = new Filter();

    song_lyrics.lyrics = filter.clean(song_lyrics.lyrics);
    return [song_lyrics.lyrics, artist, title]
    
}

async function fetch_lyrics_with_timeout(artist, title, timeout = 700) {
    let controller = new AbortController();
    let timer = setTimeout(() => controller.abort(), timeout);

    try {
        let res = await fetch(
            `https://api.lyrics.ovh/v1/${artist}/${title}`,
            { signal: controller.signal }
        );
        clearTimeout(timer);
        return await res.json();
    } catch (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") {
            throw new Error("Timeout");
        }
        throw err;
    }
}


// async function get_random_fact() {
//     let res = await fetch('https://uselessfacts.jsph.pl/random.json')
//     let data = await res.json()
//     console.log(data.text)
// }

// get_random_fact()