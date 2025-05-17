export const description = "Changes the working directory.";

export default async function cd(args, base, stdin = '') {
    const path = args[0];

    if (!path) {
        return 'cd: missing directory';
    }

    if (!window.pathStack) {
        window.pathStack = [];
    }

    const resolved = window.resolvePath(path);
    const parts = resolved ? resolved.split('/').filter(Boolean) : [];
    const dirNode = window.getDirFromFS(resolved);

    if (!dirNode) {
        return `cd: failed to change directory: ${path}`;
    }
    if (dirNode.type !== 'dir') {
        return `cd: not a directory: ${path}`;
    }

    window.pathStack = parts;

    return '';
}

