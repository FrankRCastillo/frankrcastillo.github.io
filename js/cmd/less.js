export const description = "Page through output one screen at a time.";

export default async function less(args, base, stdin = '') {
    const path = args[0];
    let text = '';

    if (path) {
        const url = `${base}/${resolvePath(path)}`;
        const res = await fetch(url);
        
        if (!res.ok) { return `less: cannot read file: ${path}`; }

        const file = await res.json();

        text = atob(file.content.replace(/\n/g, ''));

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

            if (cont === null) { break; }
        }
    }

    return output;
}
