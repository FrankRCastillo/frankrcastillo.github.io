export const REPO_API_BASE = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents';

import pwd from './cmd/pwd.js';

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

export function setupTerminal() {
    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const prompt = document.getElementById('terminal-prompt');

    window.cmdHistory = [];
    window.cmdIndex   = -1;

    function updatePrompt() {
        prompt.innerText = `${pwd()}$`;
    }

    function print(text) {
        const pre = document.createElement('pre');
        pre.textContent = text;
        output.appendChild(pre);
        output.scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();

            if (command) {
                window.cmdHistory.push(command);

                window.cmdIndex = window.cmdHistory.length;

            }

            input.value = '';

            prompt.style.visibility = 'hidden';

            print(`${pwd()}$ ${command}`);

            try {
                const result = await runCommand(command);

                if (result) print(result);

            } catch (err) {
                print(`Error: ${err.message}`);

            }

            requestAnimationFrame(() => {
                input.focus();

                updatePrompt();

                prompt.style.visibility = 'visible';
            });
        }

        if (e.key === 'ArrowUp') {
            if (window.cmdIndex > 0) {
                window.cmdIndex--;

                input.value = window.cmdHistory[window.cmdIndex];

                requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));

            }

            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            if (window.cmdIndex < window.cmdHistory.length - 1) {
                window.cmdIndex++;

                input.value = window.cmdHistory[window.cmdIndex];

            } else {
                window.cmdIndex = window.cmdHistory.length;

                input.value = '';

            }

            requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));

            e.preventDefault();
        }
    });

    updatePrompt();
}
