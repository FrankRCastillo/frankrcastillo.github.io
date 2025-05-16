export const description = "Search for files or directories matching a name.";

import { getFSNode } from '../fsutil.js';

export default async function find(args, base, stdin = '') {
    if (!args.length) {
        return 'find: missing search term';
    }

    const query = args[0].toLowerCase();
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

    const [username, reponame] = window.repoName.split('/');
    const root = getFSNode(username, reponame);

    if (!root || !root.children) {
        return `find: failed to load filesystem for ${window.repoName}`;
    }

    walk(root.children);

    return results.length ? results.join('\n') : `find: no matches for "${query}"`;
}

