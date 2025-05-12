const REPO = 'FrankRCastillo/frankrcastillo.github.io';
const BRANCH = 'master';
const content = document.getElementById('content');
const nav = document.getElementById('nav');

async function fetchPages() {
    const api = `https://api.github.com/repos/${REPO}/contents/pages?ref=${BRANCH}`;
    const res = await fetch(api);
    return res.ok ? await res.json() : [];
}

async function fetchBlogFiles() {
    const api = `https://api.github.com/repos/${REPO}/contents/blog?ref=${BRANCH}`;
    const res = await fetch(api);
    return res.ok ? await res.json() : [];
}

async function loadPage(url) {
    const res = await fetch(url);
    if (!res.ok) {
        content.innerHTML = '<p>Error loading page.</p>';
        return;
    }
    const html = await res.text();
    content.innerHTML = html;

    // Special handling for blog
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'blog') {
        loadBlog();
    }
}

async function loadBlog() {
    const blogList = document.getElementById('blogList');
    const files = await fetchBlogFiles();
    blogList.innerHTML = '';

    files
        .filter(f => f.name.endsWith('.txt'))
        .forEach(file => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = file.name.replace('.txt', '');
            link.onclick = async (e) => {
                e.preventDefault();
                const res = await fetch(file.download_url);
                if (!res.ok) {
                    blogList.innerHTML = '<p>Error loading post.</p>';
                    return;
                }
                const text = await res.text();
                blogList.innerHTML = `<pre>${text}</pre>`;
            };
            const item = document.createElement('div');
            item.appendChild(link);
            blogList.appendChild(item);
        });
}

function createNavItem(file) {
    const btn = document.createElement('button');
    const name = file.name.replace('.html', '');
    btn.textContent = name;
    btn.onclick = () => {
        history.pushState(null, '', `?page=${name}`);
        loadPage(file.download_url);
    };
    nav.appendChild(btn);
}

async function init() {
    const files = await fetchPages();
    files.filter(f => f.name.endsWith('.html')).forEach(createNavItem);

    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    const match = files.find(f => f.name === `${page}.html`);
    if (match) loadPage(match.download_url);
    else content.innerHTML = '<p>Page not found.</p>';
}

window.addEventListener('popstate', init);
init();
