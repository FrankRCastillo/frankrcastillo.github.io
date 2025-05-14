export const description = "Show the last few lines of a file.";

export default async function tail(args, base, stdin = '') {
    let numLines = 10;
    let path = null;

    // Parse options
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            numLines = parseInt(args[i + 1], 10);
            i++; // skip the number
        } else {
            path = args[i];
        }
    }

    let text = '';

    if (path) {
        const url = `${base}/${resolvePath(path)}`;
        const res = await fetch(url);
        if (!res.ok) return `tail: cannot read file: ${path}`;
        const file = await res.json();
        text = atob(file.content.replace(/\n/g, ''));
    } else {
        text = stdin;
    }

    return text.split('\n').slice(-numLines).join('\n');
}
