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
    window.cmdHistory = [];
    window.cmdIndex   = -1;

    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const prompt = document.getElementById('terminal-prompt');
    const pwd    = (await loadCommand('pwd'));

    let promptLength = 0;

    let tabComplete = {
        active: false,
        baseText: '',
        matchStart: 0,
        matchEnd: 0,
        matches: new Map()
    };

    function updatePrompt() {
        const promptText = `${pwd()}$ `;
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

    // Terminal input interaction
    input.addEventListener('keydown', async (e) => {
        const input     = document.getElementById('terminal-input');
        const input_row = document.getElementById('terminal-prompt-row');

        // Enter
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

            print(`${pwd()}$ ${command}`);

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

        // Arrow Up
        if (e.key === 'ArrowUp') {
            if (window.cmdIndex > 0) {
                window.cmdIndex--;

                input.value = window.cmdHistory[window.cmdIndex];

                requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));

            }

            e.preventDefault();
        }

        // Arrow Down
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

        // Tab
        if (e.key === 'Tab') {
            e.preventDefault();

            if (input.value.trim() === '') { return; }

            const cursor = input.selectionStart;

            if (!tabComplete.active) {
                const preCursor  = input.value.slice(0, cursor);
                const tokens     = preCursor.split(/\s+/);
                const partial    = tokens[tokens.length - 1] || '';
                const matchStart = preCursor.endsWith(' ') ? cursor : preCursor.lastIndexOf(partial);
                const dir        = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/')) : '';
                const base       = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial;
                const resolved   = window.resolvePath(dir);
                const url        = `${window.repoBase}/${resolved}`;

                try {
                    const res = await ghfetch(url);

                    if (!res.ok) { return; }

                    const items = await res.json();
                    const matches = items
                        .filter(item => item.name.startsWith(base))
                        .map(item => item.name + (item.type === 'dir' ? '/' : ''));

                    if (!matches.length) { return; }

                    tabComplete = {
                        active: true,
                        baseText: input.value,
                        matchStart,
                        matchEnd: cursor,
                        matches: new Map(matches.map((item, i) => [item, i === 0]))
                    };                

                } catch (err) {
                    console.error('Tab completion error:', err);
                    return;

                }

            } else {
                const keys         = [...tabComplete.matches.keys()];
                const currentIndex = keys.findIndex(k => tabComplete.matches.get(k));
                const nextIndex    = (currentIndex + 1) % keys.length;

                for (const key of keys) {
                    tabComplete.matches.set(key, false);
                }

                tabComplete.matches.set(keys[nextIndex], true);
            }

            const [focusedMatch] = [...tabComplete.matches.entries()].find(([, focused]) => focused);

            const newInput = tabComplete.baseText.slice(0, tabComplete.matchStart)
                           + focusedMatch
                           + tabComplete.baseText.slice(tabComplete.matchEnd);

            input.value = newInput;
            const newCursor = tabComplete.matchStart + focusedMatch.length;
            input.setSelectionRange(newCursor, newCursor);

        }

        // Disable tab autocomplete if not pressing tab or shift+tab
        if (!['Tab', 'Shift'].includes(e.key)) {
            tabComplete.active = false;
        }

        let isSelecting = false;

        // Detect start of a selection
        output.addEventListener('mousedown', () => {
            isSelecting = true;
        });

        // Detect end of selection or simple click
        output.addEventListener('mouseup', () => {
            const sel = window.getSelection();

            if (!sel || sel.isCollapsed) {
                input.focus();
            }

            isSelecting = false;
        });

        // Refocus input when selection is cleared some other way
        output.addEventListener('selectionchange', () => {
            if (!document.activeElement || document.activeElement !== input) {
                const sel = window.getSelection();

                if (output.contains(sel.anchorNode) && sel.isCollapsed) {
                    input.focus();
                }
            }
        });

        input.focus();
    });

    updatePrompt();
}
