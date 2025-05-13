export default async function cd(args, base) {
    const path = args[0];
    if (!path) return 'cd: missing directory';

    const resolved = resolvePath(path);
    const url = `${base}/${resolved}`;
    const res = await fetch(url);
    if (!res.ok) return `cd: no such directory: ${path}`;

    const meta = await res.json();
    if (!Array.isArray(meta)) return `cd: not a directory: ${path}`;

    window.cwd = resolved.replace(/\/+$/, '');
    return '';
}

function resolvePath(path) {
    if (!window.cwd || path.startsWith('/')) return path.replace(/^\/+/, '');
    return `${window.cwd.replace(/\/$/, '')}/${path}`;
}

