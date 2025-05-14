export const description = 'Clears the terminal screen.';

export default function clear() {
    const output = document.getElementById('terminal-output');
    if (output) output.innerHTML = '';
    return '';
}

