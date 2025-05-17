export const description = "Lists contents of the directory.";

function humanSize(bytes) {
    const units = ['B', 'K', 'M', 'G'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(1)}${units[i]}`;
}

export default async function ls(args, base, stdin = '') {
    const path = window.resolvePath(args[0] || '');
    const node = window.getGithubFSNode(path);

    if (!node) {
        return `ls: cannot access ${path || '.'}`;
    }

    const [user, repo] = window.repoName.split('/');

    const entries = node.children ? Object.entries(node.children) : [[path.split('/').pop(), node]];

    const sizes = entries.map(([_, item]) =>
        item.size != null ? humanSize(item.size) : ''
    );

    const maxSizeWidth = Math.max(...sizes.map(s => s.length), 0);

    const formatLine = (name, item) => {
        const type = item.type === 'tree' || item.type === 'dir' ? 'd' : 'f';
        const size = item.size != null
            ? humanSize(item.size).padStart(maxSizeWidth)
            : ' '.repeat(maxSizeWidth);
        const display = name + (type === 'd' ? '/' : '');
        return `${type}  ${user}  ${repo}  ${size}  ${display}`;
    };

    return entries.map(([name, item]) => formatLine(name, item)).join('\n');
}

