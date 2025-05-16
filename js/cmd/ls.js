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
    let long = false;
    let human = false;
    const paths = [];

    for (const arg of args) {
        if (arg.startsWith('-')) {
            long ||= arg.includes('l');
            human ||= arg.includes('h');
        } else {
            paths.push(arg);
        }
    }

    const path = resolvePath(paths[0] || '');
    const node = window.getGithubFSNode(path);

    if (!node) {
        return `ls: cannot access ${path || '.'}`;
    }

    const username = window.repoName.split('/')[0];
    const reponame = window.repoName.split('/')[1];

    const formatLine = (name, item) => {
        const type    = item.type === 'tree' || item.type === 'dir' ? 'd' : 'f';
        const size    = item.size != null ? (human ? humanSize(item.size).padStart(5) : `${item.size}B`.padStart(5)) : '     ';
        const display = name + (type === 'd' ? '/' : '');

        return `${type}  ${username}  ${reponame}  ${size}  ${display}`;
    };

    if (!node.children) {
        return formatLine(path.split('/').pop(), node);
    }

    return Object.entries(node.children)
        .map(([name, item]) => formatLine(name, item))
        .join('\n');
}

