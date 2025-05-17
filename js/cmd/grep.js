export const description = 'Search for a string in input or file.';

export default async function grep(args, base, stdin = '') {
    const pattern = args[0];
    const path = args[1];

    if (!pattern) {
        return 'grep: missing search pattern';
    }

    let text = '';

    if (path) {
        const file = window.getFileFromFS(path);

        if (!file || file.type !== 'file') {
            return `grep: cannot read file: ${path}`;
        }

        try {
            const res = await fetch(file.download_url);

            if (!res.ok) {
                return `grep: cannot read file: ${path}`;
            }

            const content = await res.text();

            if (file.encoding === 'base64') {
                text = atob(content.replace(/\n/g, ''));
            } else {
                text = content;
            }
        } catch (err) {
            return `grep: error reading ${path}`;
        }
    } else {
        text = stdin;
    }

    return text
        .split('\n')
        .filter(line => line.includes(pattern))
        .join('\n');
}

