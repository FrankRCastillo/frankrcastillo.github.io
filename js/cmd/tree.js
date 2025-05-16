export const description = "shows directory structure recursively.";

export default async function tree(args, base, indent = '', path = '') {
    const dir = window.getDirFromFS(path);

    const label = path.split('/').pop() || '.';

    if (!dir || dir.type !== 'dir' || !dir.children) {
        return `${indent}└── ${label} [not a directory]\n`;
    }

    const entries = Object.entries(dir.children).sort(([aName, a], [bName, b]) => {
        if (a.type === b.type) {
            return aName.localeCompare(bName);
        }
        return a.type === 'dir' ? -1 : 1;
    });

    let output = '';

    for (let i = 0; i < entries.length; i++) {
        const [name, item] = entries[i];
        const isLast = i === entries.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        const line = `${indent}${prefix}${name}\n`;

        output += line;

        if (item.type === 'dir') {
            const subTree = await tree([], base, nextIndent, `${path}/${name}`);
            output += subTree;
        }
    }

    return output;
}

