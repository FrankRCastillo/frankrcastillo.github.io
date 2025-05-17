export const description = "Changes the working directory.";

export default async function cd(args, base, stdin = '') {
    const path = args[0];

    if (!path) {
        return 'cd: missing directory';
    }

    if (!window.pathStack) {
        window.pathStack = [];
    }

    const dirNode  = window.getDirFromFS(path);

    if (!dirNode) {
        return `cd: failed to change directory: ${path}`;
    }

    if (dirNode.type !== 'dir') {
        return `cd: not a directory: ${path}`;
    }

    const resolved = window.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    window.pathStack = parts;

    return '';
}

