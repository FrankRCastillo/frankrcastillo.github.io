export const description = "Show the last few lines of a file.";

export default async function tail(args, base, stdin = '') {
    let numLines = 10;
    let path = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            numLines = parseInt(args[i + 1], 10);
            i++;
        } else {
            path = args[i];
        }
    }

    let text = '';

    if (path) {
        const file = window.getFileFromFS(path);

        if (!file || file.type !== 'file') {
            return `tail: cannot read file: ${path}`;
        }

        try {
            const res = await window.ghfetch(file.url);

            if (!res.ok) {
                return `tail: cannot read file: ${path}`;
            }

            text = await res.text();

            if (file.encoding === 'base64') {
                text = atob(text.replace(/\n/g, ''));
            }
        } catch (err) {
            return `tail: error reading ${path}`;
        }
    } else {
        text = stdin;
    }

    return text.split('\n').slice(-numLines).join('\n');
}

