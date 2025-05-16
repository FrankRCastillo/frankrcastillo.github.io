window.defaultRepoName = "FrankRCastillo/frankrcastillo.github.io";
window.defaultRepoBase = `https://api.github.com/repos/${window.defaultRepoName}/contents`;
window.repoName = window.defaultRepoName;
window.repoBase = window.defaultRepoBase;

await importScript('fsutil');
await window.populateGithubFS(window.repoName);

const BRANCH  = 'master';
const content = document.getElementById('content');
const nav     = document.getElementById('nav');

window.githubfs = window.githubfs || {};

async function fetchPages() {
    const api = `${window.repoBase}/pages?ref=${BRANCH}`;
    const res = await ghfetch(api);

    return res.ok ? await res.json() : [];
}

function importScript(name) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `js/${name}.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function loadPage(url, pageName) {
    const res = await ghfetch(url);
    if (!res.ok) {
        content.innerHTML = '<p>Error loading page.</p>';
        return;
    }

    const html = await res.text();
    content.innerHTML = html;

    try {
        await importScript(pageName);
    } catch (_) {
        // continue
    }

    const hook = window[`load_${pageName}`];
    if (typeof hook === 'function') hook();

    if (pageName === 'cmd') {
        const module = await import(`./cmd.js`);
        console.log("cmd.js loaded");
        requestAnimationFrame(async () => {
            await window.setupTerminal();
        });
    }
}

function createNavItem(file) {
    const name = file.name.replace('.html', '');
    const btn  = document.createElement('button');
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
