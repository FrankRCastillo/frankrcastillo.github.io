import { runCommand } from './cmd.js';

export const REPO_API_BASE = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents';

const commands = {};

async function loadCommand(name) {
    if (!commands[name]) {
        try {
            const module = await import(`./cmd/${name}.js`);
            commands[name] = module.default;
        } catch (_) {
            commands[name] = () => `Command not found: ${name}`;
        }
    }
    return commands[name];
}

export async function runCommand(input) {
    const [name, ...args] = input.trim().split(/\s+/);
    const cmd = await loadCommand(name);
    const result = await cmd(args, REPO_API_BASE);
    return result;
}

function print(text) {
    const out = document.getElementById('terminal-output');
    const div = document.createElement('div');
    div.textContent = text;
    out.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('terminal-input');
    if (!input) return;

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            print(`$ ${cmd}`);
            input.value = '';
            const result = await runCommand(cmd);
            if (result) print(result);
        }
    });
});

