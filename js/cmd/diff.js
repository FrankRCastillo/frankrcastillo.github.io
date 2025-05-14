export const description = "Find the difference between two files.";

export default async function diff(args, base, stdin = '') {
    if (args.length < 2) return 'diff: missing file operands';

    const [file1, file2] = args;

    const fetchLines = async (path) => {
        const url = `${base}/${resolvePath(path)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const file = await res.json();
        return atob(file.content.replace(/\n/g, '')).split('\n');
    };

    const lines1 = await fetchLines(file1);
    const lines2 = await fetchLines(file2);

    if (lines1 == null) return `diff: cannot read file: ${file1}`;
    if (lines2 == null) return `diff: cannot read file: ${file2}`;

    const maxLen = Math.max(lines1.length, lines2.length);
    const output = [];

    for (let i = 0; i < maxLen; i++) {
        const a = lines1[i];
        const b = lines2[i];

        if (a === b) continue;

        if (a !== undefined && b !== undefined) {
            output.push(`${i + 1}c${i + 1}`);
            output.push(`< ${a}`);
            output.push('---');
            output.push(`> ${b}`);
        } else if (a === undefined) {
            output.push(`${i + 1}a${i + 1}`);
            output.push(`> ${b}`);
        } else {
            output.push(`${i + 1}d${i + 1}`);
            output.push(`< ${a}`);
        }
    }

    return output.length ? output.join('\n') : '';
}

