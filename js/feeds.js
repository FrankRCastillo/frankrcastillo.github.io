async function load_feeds() {
    const list = document.getElementById('feedList');
    const api = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents/pages/feeds/generated?ref=master';

    const res = await fetch(api);
    if (!res.ok) {
        list.innerHTML = '<p>Error loading feed data.</p>';
        return;
    }

    const files = await res.json();
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    list.innerHTML = '';

    for (const file of jsonFiles) {
        const res = await fetch(file.download_url);
        if (!res.ok) continue;

        const data = await res.json();

        const section = document.createElement('section');
        const header = document.createElement('h3');
        header.textContent = data.name;
        section.appendChild(header);

        const ul = document.createElement('ul');
        for (const item of data.items) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.link;
            a.target = '_blank';
            a.textContent = item.title;
            li.appendChild(a);
            ul.appendChild(li);
        }

        section.appendChild(ul);
        list.appendChild(section);
    }
}

