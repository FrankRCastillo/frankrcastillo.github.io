export default async function ls(args, base) {
    const path = args[0] || '';
    const url = `${base}/${resolvePath(path)}`;

    const res = await fetch(url);
    if (!res.ok) return `ls: cannot access ${path || '.'}`;

    const files = await res.json();
    if (!Array.isArray(files)) return `ls: ${path || '.'} is not a directory`;

    return files
        .map(f => f.name + (f.type === 'dir' ? '/' : ''))
        .join('\n');
}

function resolvePath(path) {
    if (!window.pathStack) window.pathStack = [];

    if (!path || path === '.') {
        return window.pathStack.join('/');
    }

    if (path.startsWith('/')) {
        return path.replace(/^\/+/, '');
    }

    return [...window.pathStack, path].join('/');
}

