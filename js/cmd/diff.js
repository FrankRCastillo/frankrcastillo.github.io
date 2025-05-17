export const description = "Find the difference between two files.";

export default async function diff(args, base, stdin = '') {
    if (args.length < 2) {
        return 'diff: missing file operands';
    }

    const [file1Path, file2Path] = args;

    const file1 = window.getFileFromFS(file1Path);
    const file2 = window.getFileFromFS(file2Path);

    if (!file1 || file1.type !== 'file') {
        return `diff: cannot read file: ${file1Path}`;
    }

    if (!file2 || file2.type !== 'file') {
        return `diff: cannot read file: ${file2Path}`;
    }

    const fetchContent = async (file, path) => {
        try {
            const res = await fetch(file.url);
            if (!res.ok) {
                return null;
            }
            const content = await res.text();
            return file.encoding === 'base64' ? atob(content.replace(/\n/g, '')) : content;
        } catch {
            return null;
        }
    };

    const text1 = await fetchContent(file1, file1Path);
    const text2 = await fetchContent(file2, file2Path);

    if (text1 === null) {
        return `diff: cannot read file: ${file1Path}`;
    }

    if (text2 === null) {
        return `diff: cannot read file: ${file2Path}`;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const output = [];

    for (let i = 0; i < maxLen; i++) {
        const a = lines1[i];
        const b = lines2[i];

        if (a === b) {
            continue;
        }

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

