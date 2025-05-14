export const description = "Lists contents of the directory.";

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
