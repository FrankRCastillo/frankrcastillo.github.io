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
        if (arg === '-l') long = true;
        else if (arg === '-h') human = true;
        else if (arg === '-lh' || arg === '-hl') {
            long = true;
            human = true;
        } else {
            paths.push(arg);
        }
    }

    const path = paths[0] || '';
    const url = `${base}/${resolvePath(path)}`;
    const res = await fetch(url);

    if (!res.ok) return `ls: cannot access ${path || '.'}`;

    const username = window.repoName.split('/')[0];
    const reponame = window.repoName.split('/')[1];

    const formatLine = (item) => {
        const type = item.type === 'dir' ? 'd' : 'f';
        const size = item.type === 'file' ? (human ? humanSize(item.size).padStart(5) : `${item.size}B`.padStart(5)) : '     ';
        const name = item.name + (item.type === 'dir' ? '/' : '');

        return `${type}  ${username}  ${reponame}  ${size}  ${name}`;
    };

    if (!Array.isArray(await res.clone().json())) {
        const file = await res.json();
        return formatLine(file);
    }

    const files = await res.json();

    return files.map(formatLine).join('\n');
}

