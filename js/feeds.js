async function load_feeds() {
    const list = document.getElementById('feedList');
    const api = `https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents/pages/feeds?ref=master`;
    const res = await fetch(api);
    if (!res.ok) {
        list.innerHTML = '<p>Error loading feed sources.</p>';
        return;
    }

    const files = await res.json();
    list.innerHTML = '';

    for (const src of files.filter(f => f.name.endsWith('.json'))) {
        const res = await fetch(src.download_url);
        if (!res.ok) continue;
        const data = await res.json();

        const link = document.createElement('a');
        link.href = data.feed;
        link.target = '_blank';
        link.textContent = data.name;

        const div = document.createElement('div');
        div.appendChild(link);
        list.appendChild(div);
    }
}

