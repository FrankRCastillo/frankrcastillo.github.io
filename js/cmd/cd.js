export const description = "Changes the working directory.";

export default async function cd(args, base, stdin = '') {
    const path = args[0];

    if (!path) { return 'cd: missing directory'; }

    if (!window.pathStack) { window.pathStack = []; }

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

    window.pathStack = newStack;

    const resolved = newStack.join('/');
    const url = `${base}/${resolved}`;
    const res = await fetch(url);

    if (!res.ok) {
        window.pathStack = [...window.pathStack];

        return `cd: no such directory: ${path}`;
    }

    const meta = await res.json();

    if (!Array.isArray(meta)) {
        return `cd: not a directory: ${path}`;
    }

    return '';
}
