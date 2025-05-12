function parseCSV(text) {
    return text
        .trim()
        .split('\n')
        .map(line => {
            return line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(field =>
                field.replace(/^"(.*)"$/, '$1').trim()
            ) || [];
        });
}

async function load_projects() {
    const projList = document.getElementById('projectsList');
    const api      = `https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents/pages/projects.csv?ref=master`;
    const res      = await fetch(api);

    if (!res.ok) {
        blogList.innerHTML = '<p>Error loading projects.</p>';
        return;
    }

    const files = await res.text();
    const rows  = parseCSV(files);

    ul = document.createElement('ul')

    rows.forEach(row => {
        name = row[0];
        link = row[1];
        desc = row[2];

        li     = document.createElement('li');
        strong = document.createElement('strong');
        atag   = document.createElement('a');

        atag.textContent = name;
        atag.href = link;

        strong.appendChild(atag);
        li.appendChild(strong);
        li.textContent += desc;
        ul.appendchild(li);
    });

    projList.appendChild(ul);
}

