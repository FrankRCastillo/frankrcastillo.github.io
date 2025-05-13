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

// this is called by main.js after cmd.html is loaded
export function setupTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    function print(text) {
        const input = document.getElementById('terminal-input');
        const pre = document.createElement('pre');
        pre.textContent = text;
        output.appendChild(pre);
        output.scrollTop = output.scrollHeight;
        requestAnimationFrame(() => input.focus());
    }

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            input.value = '';

            print(` ${window.cwd} $ ${command}`);

            try {
                const result = await runCommand(command);

                if (result) print(result);

            } catch (err) {
                print(`Error: ${err.message}`);
            }
        }
    });
}

