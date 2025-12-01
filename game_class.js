import { generate_song, generate_song_info } from './song_utils.js'
import { load_data } from './user_info.js'

export class Game {

    constructor(player, word_num, diff_index) {
        this.player = player;
        this.word_num = word_num;
        this.diff_index = diff_index;
        this.current_score = 0;
    }

    async get_song_info() {
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
        let all_players_info = await load_data(this.player);
        let player_index = all_players_info.findIndex(d => d.name == this.player);
        let player_info = all_players_info[player_index];
        document.getElementById('player_info').textContent = this.player;
        document.getElementById('player_score').textContent = `Score: ${this.current_score} | High score: ${player_info.high_score[this.diff_index]}`
        let song_info = await this.get_song_info();
        console.log(song_info);

        let options = await this.generate_options();
        console.log(options);

        await this.display_data(song_info[0], options);

    }
}