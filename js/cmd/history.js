export const description = 'Shows command history. Use !N to reuse.';

export default function history() {
    if (!window.cmdHistory || window.cmdHistory.length === 0) {
        return '';
    }

    return window.cmdHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');
}

