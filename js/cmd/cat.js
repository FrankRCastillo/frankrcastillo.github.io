export const description = "Displays contents of the file.";

import { getFileFromFS } from '../fsutil.js';

export default async function cat(args, base, stdin = '') {
    const path = args[0];

    if (!path) {
        return 'cat: missing file name';
    }

    const file = getFileFromFS(path);

    if (!file || file.type !== 'file') {
        return `cat: cannot open ${path}`;
    }

    try {
        const res = await fetch(file.download_url);

        if (!res.ok) {
            return `cat: cannot open ${path}`;
        }

        const content = await res.text();

        if (file.encoding === 'base64') {
            return atob(content.replace(/\n/g, ''));
        } else {
            return content;
        }
    } catch (err) {
        return `cat: error reading ${path}`;
    }
}

