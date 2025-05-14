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

    const matchArgs = input.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];

    const [name, ...args] = matchArgs.map(arg => arg.replace(/^"|"$/g, ''));

    const cmd = await loadCommand(name.toLowerCase());

    return await cmd(args, REPO_API_BASE);
}

function resolvePath(path) {
    if (!window.pathStack) window.pathStack = [];

    if (!path || path === '.') {
        return window.pathStack.join('/');
    }

    if (path === '..') {
        const tmp = [...window.pathStack];
        tmp.pop();
        return tmp.join('/');
    }

    if (path === '/') {
        return '';
    }

    if (path.startsWith('/')) {
        return path.replace(/^\/+/, '');
    }

    return [...window.pathStack, path].join('/');
}

window.resolvePath = resolvePath;

export function setupTerminal() {
    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const prompt = document.getElementById('terminal-prompt');

    window.cmdHistory = [];
    window.cmdIndex   = -1;

    function updatePrompt() {
        prompt.innerText = `${pwd()}$ `;
    }

    function print(text) {
        const pre = document.createElement('pre');
        pre.textContent = text;
        output.appendChild(pre);
        output.scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', async (e) => {
        const input     = document.getElementById('terminal-input');
        const input_row = document.getElementById('terminal-prompt-row');

        if (e.key === 'Enter') {
            const command = input.value.trim();

            if (/^!\d+$/.test(command)) {
                const index = parseInt(command.slice(1), 10) - 1;

                const recalled = window.cmdHistory[index];

                if (recalled) {
                    input.value = recalled;

                    requestAnimationFrame(() => {
                        input.setSelectionRange(recalled.length, recalled.length);
                    });

                } else {
                    print(`history: event not found: ${command}`);

                }

                return; // Don't run the command yet
            }

            if (command) {
                window.cmdHistory.push(command);

                window.cmdIndex = window.cmdHistory.length;

            }

            input.value = '';

            input_row.style.visibility = 'hidden';

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

                input_row.style.visibility = 'visible';
            });
        }

        // Move cursor after prompt on Home
        if (e.key === 'Home') {
            e.preventDefault();
            input.setSelectionRange(promptLength, promptLength);
        }

        // Prevent deleting before prompt
        if ((e.key === 'Backspace' || e.key === 'Delete') &&
            input.selectionStart <= promptLength) {
            e.preventDefault();
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

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });

    updatePrompt();
}
