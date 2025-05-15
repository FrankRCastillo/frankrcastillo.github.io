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

window.runCommand = async function runCommand(input) {
    if (!input.trim()) return '';

    const segments = input.split('|').map(s => s.trim());
    let stdin = '';

    for (const segment of segments) {
        const matchArgs = segment.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const [name, ...args] = matchArgs.map(arg => arg.replace(/^"|"$/g, ''));

        const cmd = await loadCommand(name.toLowerCase());

        if (!cmd || typeof cmd !== 'function') {
            stdin = `Command not found: ${name}`;
            break;
        }

        try {
            stdin = await cmd(args, window.repoBase, stdin);
        } catch (err) {
            stdin = `Error running ${name}: ${err.message}`;
            break;
        }
    }

    return stdin;
}

window.resolvePath = function resolvePath(path) {
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

window.setupTerminal = async function setupTerminal() {
    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const prompt = document.getElementById('terminal-prompt');
    const pwd    = (await loadCommand('pwd'));

    let promptLength = 0;

    window.cmdHistory = [];
    window.cmdIndex   = -1;

    function updatePrompt() {
        const promptText = `${window.repoName}${pwd()}$ `;
        prompt.innerText = promptText;
        promptLength = promptText.length;

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }

    function print(text) {
        const pre = document.createElement('pre');

        pre.textContent = text;

        output.appendChild(pre);

        output.scrollTop = output.scrollHeight;

        input.focus();
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

                return;
            }

            if (command) {
                window.cmdHistory.push(command);

                window.cmdIndex = window.cmdHistory.length;

            }

            input.value = '';

            input_row.style.visibility = 'hidden';

            print(`${window.repoName}${pwd()}$ ${command}`);

            try {
                const result = await runCommand(command);

                if (result) print(result);

            } catch (err) {
                print(`Error: ${err.message}`);

            }

            requestAnimationFrame(() => {
                input_row.style.visibility = 'visible';
                setTimeout(() => {
                    updatePrompt();
                }, 0);
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

        if (e.key === 'Tab') {
            e.preventDefault();

            const text         = input.value;
            const cursor       = input.selectionStart;
            const beforeCursor = text.slice(0, cursor);
            const match        = beforeCursor.match(/(?:[^\s"]+|"[^"]*")$/);
            const partial      = match ? match[0].replace(/^"/, '') : '';
            const dir          = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/')) : '';
            const base         = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial;
            const resolved     = window.resolvePath(dir);
            const url          = `${window.repoBase}/${resolved}`;

            try {
                const res = await fetch(url);

                if (!res.ok) { return; }

                const items   = await res.json();
                const matches = items
                    .filter(item => item.name.startsWith(base))
                    .map(item => item.name + (item.type === 'dir' ? '/' : ''));

                if (matches.length === 1) {
                    const completed = matches[0];
                    const newPath   = dir ? `${dir}/${completed}` : completed;
                    const newValue  = text.slice(0, match.index) + newPath + text.slice(cursor);

                    input.value = newValue;
                    input.setSelectionRange(newValue.length, newValue.length);

                } else if (matches.length > 1) {
                    const output = document.getElementById('terminal-output');
                    const pre    = document.createElement('pre');

                    pre.textContent = matches.join('\t');
                    output.appendChild(pre);
                    output.scrollTop = output.scrollHeight;
                }

            } catch (err) {
                console.error('Tab completion error:', err);
            }
        }

        input.focus();
    });

    updatePrompt();
}
