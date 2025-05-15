export const description = "shows directory structure recursively.";

export default async function tree(args, base, indent = '', path = '') {
    const fullPath = resolvePath(path);
    const url      = encodeURI(`${base}/${fullPath}`);
    const res      = await fetch(url);

    if (!res.ok) {
        const label = fullPath.split('/').pop() || '.';

        return `${indent}└── ${label} [${res.status} ${res.statusText}]` + '\n';
    }

    const items = await res.json();

    if (!Array.isArray(items)) {
        return `${indent}└── ${path || '.'} [not a directory]\n`;
    }

    items.sort((a, b) => {
        if (a.type === b.type) { return a.name.localeCompare(b.name); }

        return a.type === 'dir' ? -1 : 1;
    });

    let output = '';

    for (let i = 0; i < items.length; i++) {
        const item       = items[i];
        const isLast     = i === items.length - 1;
        const prefix     = isLast ? '└── ' : '├── ';
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        const line       = `${indent}${prefix}${item.name}\n`;

        output += line;

        if (item.type === 'dir') {
            const subTree = await tree([], base, nextIndent, `${fullPath}/${item.name}`);
            output += subTree;
        }
    }

    return output;
}

