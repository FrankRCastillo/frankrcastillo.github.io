export const REPO_API_BASE = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents';

const commands = {};

async function loadCommand(name) {
    if (!commands[name]) {
        try {
            const module = await import(`./cmd/${name}.js`);
            commands[name] = module.default;
        } catch {
            commands[name] = () => `Command not found: ${name}`;
        }
    }
    return commands[name];
}

export async function runCommand(input) {
    if (!input.trim()) return '';
    const [name, ...args] = input.trim().split(/\s+/);
    const cmd = await loadCommand(name.toLowerCase());
    return await cmd(args, REPO_API_BASE);
}

