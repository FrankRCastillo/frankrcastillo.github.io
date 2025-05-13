export default async function cd(args, base) {
    const path = args[0];
    if (!path) return 'cd: missing directory';

    if (!window.pathStack) window.pathStack = [];

    let newStack = [...window.pathStack];

    if (path === '..') {
        newStack.pop();
    } else if (path === '/') {
        newStack = [];
    } else if (path.startsWith('/')) {
        newStack = path.replace(/^\/+/, '').split('/');
    } else {
        newStack.push(path);
    }

    const resolved = newStack.join('/');
    const url = `${base}/${resolved}`;
    const res = await fetch(url);
    if (!res.ok) return `cd: no such directory: ${path}`;

    const meta = await res.json();
    if (!Array.isArray(meta)) return `cd: not a directory: ${path}`;

    window.pathStack = newStack;
    return '';
}

function resolvePath(path) {
    if (!window.pathStack) window.pathStack = [];

    if (path === '..') {
        window.pathStack.pop();
        return window.pathStack.join('/');
    }

    if (path === '/') {
        window.pathStack = [];
        return '';
    }

    if (path.startsWith('/')) {
        window.pathStack = path.replace(/^\/+/, '').split('/').filter(Boolean);
        return window.pathStack.join('/');
    }

    window.pathStack.push(path);
    return window.pathStack.join('/');
}

