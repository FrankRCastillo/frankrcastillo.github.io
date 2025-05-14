export const description = 'Search for a string in input or file.';

export default async function grep(args, base, stdin = '') {
    const pattern = args[0];
    const path = args[1];

    if (!pattern) return 'grep: missing search pattern';

    let text = '';

    if (path) {
        const url = `${base}/${resolvePath(path)}`;
        const res = await fetch(url);
        if (!res.ok) return `grep: cannot read file: ${path}`;
        const file = await res.json();
        text = atob(file.content.replace(/\n/g, ''));
    } else {
        text = stdin;
    }

    return text
        .split('\n')
        .filter(line => line.includes(pattern))
        .join('\n');
}
