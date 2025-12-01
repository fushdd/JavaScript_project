export async function load_data() {
    const response = await fetch('/data');
    const data = await response.json();
    
    return data
}
 
export async function add_data(s_name, s_password) {
    const name = s_name
    const password = s_password
    let high_score = [0, 0, 0]
    const newData = { name, password, high_score };
 
    const response = await fetch('/add-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
    });
 
    if (response.ok) {
        
    } else {
        console.error('Error updating data');
    }
}

export async function update_data(name, new_hs) {;

    const response = await fetch(`/update-data/${name}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({high_score: new_hs}),
    });
 
    if (!response.ok) {
        console.error('Error updating data');
    }
}