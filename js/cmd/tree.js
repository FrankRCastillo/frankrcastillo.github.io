export const description = "shows directory structure recursively.";

export default async function tree(args, base, indent = '', path = '') {
    const fullPath = resolvePath(path);
    const url = `${base}/${fullPath}`;
    const res = await fetch(url);

    if (!res.ok) {
        return `tree: cannot access ${path || '.'}`;
    }

    const items = await res.json();
    if (!Array.isArray(items)) return `tree: ${path || '.'} is not a directory`;

    // Sort directories first
    items.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });

    let output = '';

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLast = i === items.length - 1;
        const prefix = isLast ? '└── ' : '├── ';

        output += `${indent}${prefix}${item.name}\n`;

        if (item.type === 'dir') {
            const subTree = await tree([], base, indent + (isLast ? '    ' : '│   '), `${fullPath}/${item.name}`);
            output += subTree;
        }
    }

    return output;
}
