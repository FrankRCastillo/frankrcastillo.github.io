export const description = "Check if two files are identical.";

export default async function cmp(args, base, stdin = '') {
    if (args.length < 2) {
        return 'cmp: missing file operands';
    }

    const [file1, file2] = args;

    const fetchFile = async (path) => {
        const file = window.getFileFromFS(path);

        if (!file || file.type !== 'file') {
            return null;
        }

        try {
            const res = await fetch(file.download_url);

            if (!res.ok) {
                return null;
            }

            const content = await res.text();

            if (file.encoding === 'base64') {
                return atob(content.replace(/\n/g, ''));
            } else {
                return content;
            }
        } catch {
            return null;
        }
    };

    const text1 = await fetchFile(file1);
    const text2 = await fetchFile(file2);

    if (text1 == null) {
        return `cmp: cannot read file: ${file1}`;
    }

    if (text2 == null) {
        return `cmp: cannot read file: ${file2}`;
    }

    const len = Math.max(text1.length, text2.length);

    for (let i = 0; i < len; i++) {
        if (text1[i] !== text2[i]) {
            return `cmp: ${file1} ${file2}: differ: byte ${i + 1}`;
        }
    }

    return '';
}

