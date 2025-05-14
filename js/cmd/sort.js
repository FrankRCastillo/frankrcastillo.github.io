export const description = "Sort lines in a file or input.";

export default async function sort(args, base, stdin = '') {
    const path = args[0];
    let text = '';

    if (path) {
        const url = `${base}/${resolvePath(path)}`;
        const res = await fetch(url);
        if (!res.ok) return `sort: cannot read file: ${path}`;
        const file = await res.json();
        text = atob(file.content.replace(/\n/g, ''));
    } else {
        text = stdin;
    }

    return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .sort((a, b) => a.localeCompare(b))
        .join('\n');
}
