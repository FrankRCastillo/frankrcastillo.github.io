export const description = "Search for files or directories matching a name.";

export default async function find(args, base, stdin = '') {
    if (!args.length) { return 'find: missing search term'; }

    const query = args[0].toLowerCase();
    const results = [];

    async function walk(path = '') {
        const url = `${base}/${path}`;
        const res = await ghfetch(url);

        if (!res.ok) { return; }

        const items = await res.json();
        
        if (!Array.isArray(items)) return;

        for (const item of items) {
            const fullPath = path ? `${path}/${item.name}` : item.name;

            if (item.name.toLowerCase().includes(query)) {
                results.push(fullPath + (item.type === 'dir' ? '/' : ''));
            }

            if (item.type === 'dir') {
                await walk(fullPath);
            }
        }
    }

    await walk(window.resolvePath(''));

    return results.length ? results.join('\n') : `find: no matches for "${query}"`;
}

