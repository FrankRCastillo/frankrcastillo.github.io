export const description = "shows directory structure recursively.";

import { getDirFromFS } from '../fsutil.js';

export default async function tree(args, base, indent = '', path = '') {
    const dir = getDirFromFS(path);

    const label = path.split('/').pop() || '.';

    if (!dir || dir.type !== 'dir' || !dir.children) {
        return `${indent}└── ${label} [not a directory]\n`;
    }

    const items = Object.values(dir.children).sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'dir' ? -1 : 1;
    });

    let output = '';

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLast = i === items.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        const line = `${indent}${prefix}${item.name}\n`;

        output += line;

        if (item.type === 'dir') {
            const subTree = await tree([], base, nextIndent, `${path}/${item.name}`);
            output += subTree;
        }
    }

    return output;
}

