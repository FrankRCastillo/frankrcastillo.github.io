const REPO    = 'FrankRCastillo/frankrcastillo.github.io';
const BRANCH  = 'master';
const content = document.getElementById('content');
const nav     = document.getElementById('nav');

async function fetchPages() {
    const api = `https://api.github.com/repos/${REPO}/contents/pages?ref=${BRANCH}`;
    const res = await fetch(api);

    return res.ok ? await res.json() : [];
}

function importScript(name) {
    return new Promise((resolve, reject) => {
        const script   = document.createElement('script');
        script.src     = `js/${name}.js`;
        script.onload  = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    });
}

async function loadPage(url, pageName) {
    const res = await fetch(url);

    if (!res.ok) {
        content.innerHTML = '<p>Error loading page.</p>';
        return;
    }

    const html = await res.text();
    content.innerHTML = html;

    try {
        await importScript(pageName);
    } catch (_) {
        // it's okay if there's no associated script
    }

    const hook = window[`load_${pageName}`];
    if (typeof hook === 'function') hook();

    // If this is the terminal page, load and run the module
    if (pageName === 'cmd') {
        const module = await import(`./cmd.js`);

        console.log("cmd.js loaded");
    
        requestAnimationFrame(() => module.setupTerminal());
    }
}

function createNavItem(file) {
    const name = file.name.replace('.html', '');

    const btn = document.createElement('button');

    btn.textContent = name;

    btn.onclick = () => {
        history.pushState(null, '', `?page=${name}`);
        loadPage(file.download_url, name);
    };

    nav.appendChild(btn);
}

async function init() {
    const files = await fetchPages();
    const pages = files.filter(f => f.name.endsWith('.html'));

    // puts home at the beginning and cmd at end
    pages.sort((a, b) => {
        if (a.name === 'home.html') return -1;
        if (b.name === 'home.html') return 1;
        if (a.name === 'cmd.html') return 1;
        if (b.name === 'cmd.html') return -1;
        return a.name.localeCompare(b.name);
    }).forEach(createNavItem);

    const params = new URLSearchParams(window.location.search);
    const page   = params.get('page') || 'home';
    const match  = pages.find(f => f.name === `${page}.html`);

    if (match) {
        loadPage(match.download_url, page);

    } else {
        content.innerHTML = '<p>Page not found.</p>';

    }
}

window.addEventListener('popstate', init);
init();
