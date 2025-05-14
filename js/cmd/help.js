export const description = "Displays usage info for a command.";

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

        return 'Available commands:\n' + cmds.join('\n');
    } catch (err) {
        return 'help: error fetching command list';
    }
}

