export const description = "Show the first few lines of a file.";

export default async function head(args, base, stdin = '') {
    let numLines = 10;
    let path = null;

    // Parse options
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            numLines = parseInt(args[i + 1], 10);
            i++; // skip next arg
        } else {
            path = args[i];
        }
    }

    let text = '';

    if (path) {
        const url = `${base}/${resolvePath(path)}`;
        
        const res = await ghfetch(url);

        if (!res.ok) { return `head: cannot read file: ${path}`; }

        const file = await res.json();

        text = atob(file.content.replace(/\n/g, ''));

    } else {
        text = stdin;
    }

    return text.split('\n').slice(0, numLines).join('\n');
}

