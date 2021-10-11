// Clear the screen

export function clear() {
    let body = document.getElementById('consoleBuffer');
    if (body != null) { body.innerHTML = ''; }
}
