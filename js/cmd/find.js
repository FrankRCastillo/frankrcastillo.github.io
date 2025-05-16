export const description = "Search for files or directories matching a name.";

export default async function find(args, base, stdin = '') {
    if (!args.length) {
        return 'find: missing search term';
    }

    const query    = args[0].toLowerCase();
    const basePath = args[1] ? window.resolvePath(args[1]) : window.resolvePath('.');
    const root     = window.getFSNode(basePath);

    if (!root || root.type !== 'dir' || !root.children) {
        return `find: failed to load filesystem for ${basePath}`;
    }

    const results = [];

    function walk(node, path = '') {
        for (const [name, item] of Object.entries(node)) {
            const fullPath = path ? `${path}/${name}` : name;

            if (name.toLowerCase().includes(query)) {
                results.push(fullPath + (item.type === 'dir' ? '/' : ''));
            }

            if (item.type === 'dir' && item.children) {
                walk(item.children, fullPath);
            }
        }
    }

    walk(root.children, basePath);

    return results.length ? results.join('\n') : `find: no matches for "${query}"`;
}

