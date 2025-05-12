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

        const section = document.createElement('section');
        const header = document.createElement('h3');
        header.textContent = name;
        section.appendChild(header);

        const ul = document.createElement('ul');
        ul.textContent = 'Loading...';
        section.appendChild(ul);
        list.appendChild(section);

        try {
            const feedRes = await fetch(url);
            const xmlText = await feedRes.text();
            const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
            const items = doc.querySelectorAll('entry, item');

            ul.innerHTML = '';
            items.forEach((item, i) => {
                if (i >= 10) return; // limit to 10 items
                const title = item.querySelector('title')?.textContent || '(no title)';
                const link = item.querySelector('link');
                const href = link?.getAttribute('href') || link?.textContent;

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = href;
                a.target = '_blank';
                a.textContent = title;
                li.appendChild(a);
                ul.appendChild(li);
            });

            if (ul.innerHTML === '') ul.textContent = '(no items found)';
        } catch (err) {
            ul.textContent = 'Failed to load feed.';
        }
    }
}

