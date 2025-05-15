async function load_feeds() {
    const list = document.getElementById('feedList');
    const api = `${window.defaultRepoBase}/pages/feeds?ref=master`;

    const res = await ghfetch(api);
    if (!res.ok) {
        list.innerHTML = '<p>Error loading feed data.</p>';
        return;
    }

    const files = await res.json();
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    list.innerHTML = '<p>Loading feeds...</p>';

    const fragment = document.createDocumentFragment();
    const sections = [];

    for (const file of jsonFiles) {
        try {
            const res = await ghfetch(file.download_url);
            if (!res.ok) throw new Error(`Fetch failed for ${file.name}`);

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
                a.rel = 'noopener noreferrer';
                a.textContent = item.title;
                li.appendChild(a);
                ul.appendChild(li);
            }

            section.appendChild(ul);
            sections.push({ name: data.name.toLowerCase(), section });

        } catch (err) {
            console.error(`Failed to load feed ${file.name}:`, err);
            const errMsg = document.createElement('p');
            errMsg.textContent = `⚠️ Failed to load feed: ${file.name}`;
            sections.push({ name: file.name.toLowerCase(), section: errMsg });
        }
    }

    sections.sort((a, b) => a.name.localeCompare(b.name));
    sections.forEach(({ section }) => fragment.appendChild(section));

    list.innerHTML = '';
    list.appendChild(fragment);
}

