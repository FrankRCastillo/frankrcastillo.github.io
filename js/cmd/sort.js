export const description = "Sort lines in a file or input.";

export default async function sort(args, base, stdin = '') {
    const path = args[0];
    let text = '';

    if (path) {
        const file = window.getFileFromFS(path);

        if (!file || file.type !== 'file') {
            return `sort: cannot read file: ${path}`;
        }

        try {
            const res = await window.ghfetch(file.url);

            if (!res.ok) {
                return `sort: cannot read file: ${path}`;
            }

            const content = await res.text();

            if (file.encoding === 'base64') {
                text = atob(content.replace(/\n/g, ''));
            } else {
                text = content;
            }
        } catch (err) {
            return `sort: error reading ${path}`;
        }
    } else {
        text = stdin;
    }

    return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .sort((a, b) => a.localeCompare(b))
        .join('\n');
}

