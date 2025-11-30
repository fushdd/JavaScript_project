import { load_data, update_data } from './user_info.js'
import { Game } from './game_class.js'

let difficulty = sessionStorage.getItem('difficulty');
let player_name = sessionStorage.getItem('name');
if (!player_name) {
    window.location.href = './login.html';
} else if (!difficulty) {
    window.location.href = './choose_difficulty.html';
}

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


let all_players_info = await load_data(player_name);
let player_index = all_players_info.findIndex(d => d.name == player_name);
let player_info = all_players_info[player_index];

let new_game = new Game(player_info.name, word_num, diff_index);
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


// async function get_random_fact() {
//     let res = await fetch('https://uselessfacts.jsph.pl/random.json')
//     let data = await res.json()
//     console.log(data.text)
// }

// get_random_fact()