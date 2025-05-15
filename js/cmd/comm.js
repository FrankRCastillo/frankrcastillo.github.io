export const description = "Compare two sorted files line by line.";

export default async function comm(args, base, stdin = '') {
    if (args.length < 2) return 'comm: missing file operands';

    const [file1, file2] = args;

    const fetchLines = async (path) => {
        const url = `${base}/${resolvePath(path)}`;
        const res = await ghfetch(url);
        if (!res.ok) return null;
        const file = await res.json();
        return atob(file.content.replace(/\n/g, '')).split('\n').sort();
    };

    const lines1 = await fetchLines(file1);
    const lines2 = await fetchLines(file2);

    if (lines1 == null) return `comm: cannot read file: ${file1}`;
    if (lines2 == null) return `comm: cannot read file: ${file2}`;

    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    const all = Array.from(new Set([...lines1, ...lines2])).sort();

    return all.map(line => {
        const in1 = set1.has(line);
        const in2 = set2.has(line);

        if (in1 && in2) return `\t\t${line}`;
        if (in1)       return `${line}`;
        if (in2)       return `\t${line}`;
    }).join('\n');
}
