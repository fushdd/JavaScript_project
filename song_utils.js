import { Filter } from "https://esm.sh/bad-words";

export async function generate_query() {
  let res = await fetch("https://random-word-api.vercel.app/api?words=1");
  let data = await res.json();
  return data[0];
}

export async function generate_song() {
    let query =  await generate_query()
    console.log(query)

    let song_res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=musicTrack&attribute=songTerm&lang=en_us&limit=5`)
    if (!song_res.ok) {
        console.log('Limit reached')
    }
    let songs = await song_res.json();
    return songs
}

export async function generate_song_info() {
    while (true){
        let songs = await generate_song()

        for (let song of songs.results) {
            var artist = song.artistName;
            var title = song.trackName;
            console.log(`${artist}; ${title}`);
            var song_lyrics = false;
            for (let i = 0; i < 5; i++) {
                try {
                    if (artist.includes("/") || artist.includes("\\") || title.includes("/") || title.includes("\\")) {
                        break
                    }
                    song_lyrics = await fetch_lyrics_with_timeout(artist, title);
                    break;
                } catch (err) {
                    if (err.message == "Timeout") {
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
        if (song_lyrics.lyrics) {
                break;
        }
           
    }

    const filter = new Filter();

    song_lyrics.lyrics = filter.clean(song_lyrics.lyrics);
    return [song_lyrics.lyrics, artist, title]
    
}

export async function fetch_lyrics_with_timeout(artist, title, timeout = 700) {
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