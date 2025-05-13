export default async function cat(args, base) {
    const path = args[0];
    if (!path) return 'cat: missing file name';

    const url = `${base}/${resolvePath(path)}`;
    const res = await fetch(url);
    if (!res.ok) return `cat: cannot open ${path}`;

    const file = await res.json();
    const decoded = atob(file.content.replace(/\n/g, ''));
    return decoded;
}

function resolvePath(path) {
    if (!window.cwd || path.startsWith('/')) return path.replace(/^\/+/, '');
    return `${window.cwd.replace(/\/$/, '')}/${path}`;
}

