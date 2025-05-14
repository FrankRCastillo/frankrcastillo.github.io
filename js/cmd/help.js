export const description = "Displays usage info for all commands.";

export default async function help(_, base) {
    const api = `${base}/js/cmd?ref=master`;

    try {
        const res = await fetch(api);
        if (!res.ok) return 'help: failed to fetch command list';

        const files = await res.json();

        const cmds = files
            .filter(f => f.name.endsWith('.js'))
            .map(f => f.name.replace('.js', ''));

        cmds.sort();

        const pad_len = Math.max(...cmds.map(cmd => cmd.length)) + 2;

        const results = await Promise.all(
            cmds.map(async (cmd) => {
                try {
                    const module = await import(`./${cmd}.js`);
                    return `${cmd.padEnd(pad_len)} ${module.description || 'No description.'}`;
                } catch {
                    return `${cmd.padEnd(pad_len)} (error loading)`;
                }
            })
        );

        return 'Available commands:\n' + results.join('\n');
    } catch {
        return 'help: error fetching command list';
    }
}

