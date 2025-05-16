export const description = "Page through output one screen at a time.";

import { getFileFromFS } from '../fsutil.js';

export default async function less(args, base, stdin = '') {
    const path = args[0];
    let text = '';

    if (path) {
        const file = getFileFromFS(path);

        if (!file || file.type !== 'file') {
            return `less: cannot read file: ${path}`;
        }

        try {
            const res = await fetch(file.download_url);

            if (!res.ok) {
                return `less: cannot read file: ${path}`;
            }

            const content = await res.text();

            if (file.encoding === 'base64') {
                text = atob(content.replace(/\n/g, ''));
            } else {
                text = content;
            }
        } catch (err) {
            return `less: error reading ${path}`;
        }
    } else {
        text = stdin;
    }

    const lines = text.split('\n');
    const pageSize = 20;

    let output = '';
    for (let i = 0; i < lines.length; i += pageSize) {
        output += lines.slice(i, i + pageSize).join('\n') + '\n';

        if (i + pageSize < lines.length) {
            const cont = prompt('--More-- (press OK to continue, Cancel to stop)');

            if (cont === null) {
                break;
            }
        }
    }

    return output;
}

