export const description = "Changes the working directory.";

export default async function cd(args, base, stdin = '') {
    const path = args[0];

    if (!path) {
        return 'cd: missing directory';
    }

    if (!window.pathStack) {
        window.pathStack = [];
    }

    let newStack = [...window.pathStack];

    if (path === '..') {
        newStack.pop();
    } else if (path === '/') {
        newStack = [];
    } else if (path.startsWith('/')) {
        newStack = path.replace(/^\/+/g, '').split('/');
    } else {
        newStack.push(path);
    }

    const resolved = newStack.join('/');
    const dirNode = window.getDirFromFS(resolved);

    if (!dirNode || dirNode.type !== 'dir') {
        return `cd: not a directory: ${path}`;
        debugger;
    }

    window.pathStack = newStack;

    return '';
}

