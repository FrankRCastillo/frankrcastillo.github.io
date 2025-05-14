export const description = "Displays usage info for a command.";

export default async function help() {
    const res = await fetch('js/cmd/');
    const text = await res.text();

    // Extract JS filenames using a regex
    const matches = Array.from(text.matchAll(/href="([^"]+\.js)"/g)).map(m => m[1]);

    const entries = await Promise.all(matches.map(async filename => {
        const name = filename.replace('.js', '');
        try {
            const module = await import(`./${name}.js`);
            const desc = module.description || '';
            return `${name}\t${desc}`;
        } catch {
            return `${name}`;
        }
    }));

    entries.sort((a, b) => a.localeCompare(b));

    return ['Available commands:', ...entries].join('\n');
}

