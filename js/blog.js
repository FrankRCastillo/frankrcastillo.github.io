async function load_blog() {
    const blogList = document.getElementById('blogList');
    const api      = `https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents/blog?ref=master`;
    const res      = await fetch(api);

    if (!res.ok) {
        blogList.innerHTML = '<p>No posts found.</p>';
        return;
    }

    const files = await res.json();

    files.filter(f => f.name.endsWith('.txt')).forEach(file => {
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

        const div = document.createElement('div');

        div.appendChild(link);

        blogList.appendChild(div);
    });
}

