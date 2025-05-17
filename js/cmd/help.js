export const description = "Displays usage info for all commands.";

export default async function help() {
    const dir = window.getDirFromFS('js/cmd');

    if (!dir || !dir.children) {
        return 'help: command directory not found';
    }

    const cmds = Object.entries(dir.children)
        .filter(([name, node]) => name.endsWith('.js') && node.type === 'file')
        .map(([name]) => name.replace('.js', ''));

    cmds.sort();

    const padLen = Math.max(...cmds.map(cmd => cmd.length)) + 2;

    const results = await Promise.all(
        cmds.map(async (cmd) => {
            try {
                const module = await import(`./${cmd}.js`);
                return `${cmd.padEnd(padLen)} ${module.description || 'No description.'}`;
            } catch {
                return `${cmd.padEnd(padLen)} (error loading)`;
            }
        })
    );

    return 'Available commands:\n' + results.join('\n');
}

