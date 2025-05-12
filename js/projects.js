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
    const projFile = "/pages/projects.csv";
    const res      = await fetch(projFile);

    if (!res.ok) {
        projList.innerHTML = '<p>Error loading projects.</p>';
        return;
    }

    projList.innerHTML = '';

    const files = await res.text();
    const rows  = parseCSV(files);

    ul = document.createElement('ul')

    rows.forEach(row => {
        const name   = row[0];
        const link   = row[1];
        const desc   = row[2];
        const li     = document.createElement('li');
        const strong = document.createElement('strong');
        const atag   = document.createElement('a');
        const text   = document.createTextNode(' - ' + desc);


        atag.textContent = name;
        atag.href = link;

        strong.appendChild(atag);
        li.appendChild(strong);
        li.appendChild(text);
        ul.appendChild(li);
    });

    projList.appendChild(ul);
}

