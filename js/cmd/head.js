export const description = "Show the first few lines of a file.";

export default async function head(args, base, stdin = '') {
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
            return `head: cannot read file: ${path}`;
        }

        try {
            const res = await fetch(file.download_url);

            if (!res.ok) {
                return `head: cannot read file: ${path}`;
            }

            const content = await res.text();
            text = file.encoding === 'base64' ? atob(content.replace(/\n/g, '')) : content;
        } catch (err) {
            return `head: error reading ${path}`;
        }
    } else {
        text = stdin;
    }

    return text.split('\n').slice(0, numLines).join('\n');
}

