const commands = {};

let tabComplete = { active     : false
                    , baseText   : ''
                    , matchStart : 0
                    , matchEnd   : 0
                    , matches    : new Map()
                    };

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

(async () => {
    window.pwdcmd = await loadCommand('pwd');
    updatePrompt();
})();

window.runCommand = async function(input) {
    if (!input.trim()) {
        return '';
    }

    const segments = input.split('|').map(s => s.trim());
    let stdin = '';

    for (const segment of segments) {
        const matchArgs = [...segment.matchAll(/"([^"]*)"|[^\s]+/g)];
        const parts = matchArgs.map(m => m[1] ?? m[0]);
        const [name, ...args] = parts;
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
};

window.setupTerminal = async function() {
    window.cmdHistory = [];
    window.cmdIndex   = -1;

    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await keydown_enter();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            keydown_uparrow();
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            keydown_dnarrow();
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            keydown_tab();
        }
        
        if(!['Tab', 'Shift'].includes(e.key)) {
            tabComplete.active = false;
        }

        const input  = document.getElementById('terminal-input');

        input.focus();

        updatePrompt();
    });

    output.addEventListener('mouseup', () => {
        const input  = document.getElementById('terminal-input');
        const sel = window.getSelection();

        if (!sel || sel.isCollapsed) {
            input.focus();
        }
    });

    output.addEventListener('selectionchange', () => {
        const input  = document.getElementById('terminal-input');

        if (!document.activeElement || document.activeElement !== input) {
            const sel = window.getSelection();

            if (output.contains(sel.anchorNode) && sel.isCollapsed) {
                input.focus();
            }
        }
    });
};

function updatePrompt() {
    const input      = document.getElementById('terminal-input');
    const output     = document.getElementById('terminal-output');
    const prompt     = document.getElementById('terminal-prompt');
    const promptText = `${window.pwdcmd()}$ `;

    prompt.innerText = promptText;

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

function print(text) {
    const input  = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const pre    = document.createElement('pre');

    pre.textContent = text;

    output.appendChild(pre);

    output.scrollTop = output.scrollHeight;

    input.focus();
}

async function keydown_enter() {
    const input     = document.getElementById('terminal-input');
    const input_row = document.getElementById('terminal-prompt-row');
    const command   = input.value.trim();

    if (/^!\d+$/.test(command)) {
        const index    = parseInt(command.slice(1), 10) - 1;
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

    print(`${window.pwdcmd()}$ ${command}`);

    try {
        const result = await runCommand(command);

        if (result) {
            print(result);
        }

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

function keydown_tab() {
    const input  = document.getElementById('terminal-input');
    const cursor = input.selectionStart;
    const text   = input.value;

    if (!tabComplete.active) {
        const tokens = [...text.matchAll(/"([^"]*)"|[^\s]+/g)];

        if (tokens.length === 0) { return; }

        let activeToken = null;

        for (const match of tokens) {
            const start = match.index;
            const end   = start + match[0].length;

            if (cursor >= start && cursor <= end) {
                activeToken = { text: match[1] ?? match[0], start, end };
                break;
            }
        }

        if (!activeToken || tokens[0].index === activeToken.start) { return; }

        const raw          = activeToken.text;
        const isQuoted     = text[activeToken.start] === '"';
        const pathPart     = raw.includes('/') ? raw.slice(0, raw.lastIndexOf('/')) : '';
        const basePart     = raw.includes('/') ? raw.slice(raw.lastIndexOf('/') + 1) : raw;
        const resolvedPath = window.resolvePath(pathPart);
        const dirNode      = window.getDirFromFS(resolvedPath);

        if (!dirNode || !dirNode.children) { return; }

        const candidates = Object.keys(dirNode.children)
            .filter(name => name.startsWith(basePart))
            .map(name => {
                const isDir  = dirNode.children[name].type === 'dir';
                const quoted = name.includes(' ') && !isQuoted ? `"${name}"` : name;

                return quoted + (isDir ? '/' : '');
            });

        if (!candidates.length) { return; }

        tabComplete = { active     : true
                      , baseText   : text
                      , matchStart : activeToken.start
                      , matchEnd   : activeToken.end
                      , matches    : candidates
                      , index      : 0
                      };

    } else {
        tabComplete.index = (tabComplete.index + 1) % tabComplete.matches.length;
    }

    const replacement = tabComplete.matches[tabComplete.index];
    const newText = tabComplete.baseText.slice(0, tabComplete.matchStart)
                  + replacement
                  + tabComplete.baseText.slice(tabComplete.matchEnd);

    const newCursor = tabComplete.matchStart + replacement.length;
    input.value = newText;

    input.setSelectionRange(newCursor, newCursor);

    // If it's a dir and ends with "/", clear cycling so user can tab into contents
    if (replacement.endsWith('/')) {
        tabComplete.active = false;
    }
}

function keydown_uparrow() {
    const input = document.getElementById('terminal-input');

    if (window.cmdIndex > 0) {
        window.cmdIndex--;

        input.value = window.cmdHistory[window.cmdIndex];

        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    }
}

function keydown_dnarrow() {
    const input = document.getElementById('terminal-input');
    const input_row = document.getElementById('terminal-prompt-row');

    if (window.cmdIndex < window.cmdHistory.length - 1) {
        window.cmdIndex++;

        input.value = window.cmdHistory[window.cmdIndex];

    } else {
        window.cmdIndex = window.cmdHistory.length;

        input.value = '';
    }

    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
}
