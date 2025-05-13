export default async function cd(args, base) {
    const path = args[0];
    if (!path) return 'cd: missing directory';

    const resolved = resolvePath(path);
    const url = `${base}/${resolved}`;
    const res = await fetch(url);
    if (!res.ok) return `cd: no such directory: ${path}`;

    const meta = await res.json();
    if (!Array.isArray(meta)) return `cd: not a directory: ${path}`;

    if (!window.pathStack) window.pathStack = [];

    if (path === '..') {
        window.pathStack.pop();
    } else if (path !== '.') {
        window.pathStack.push(path);
    }

    window.cwd = '/' + window.pathStack.join('/');

    return '';
}

function resolvePath(path) {
    if (!window.pathStack) window.pathStack = [];

    if (path === '..') {
        const newPath = [...window.pathStack];
        newPath.pop();
        return newPath.join('/');
    }

    if (path.startsWith('/')) {
        return path.replace(/^\/+/, '');
    }

    return [...window.pathStack, path].join('/');
}

