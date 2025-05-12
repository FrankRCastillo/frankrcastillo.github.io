async function load_feeds() {
    const list = document.getElementById('feedList');
    const csvUrl = 'https://raw.githubusercontent.com/FrankRCastillo/frankrcastillo.github.io/master/pages/feeds.csv';

    const res = await fetch(csvUrl);
    if (!res.ok) {
        list.innerHTML = '<p>Error loading feed sources.</p>';
        return;
    }

    const text = await res.text();
    const rows = text.trim().split('\n');

    list.innerHTML = '';

    for (const line of rows) {
        const [name, url] = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());

        if (!url) continue;

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = name;

        const div = document.createElement('div');
        div.appendChild(link);
        list.appendChild(div);
    }
}

