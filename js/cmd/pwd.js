export const description = "displays contents of the file.";

export default function pwd() {
    return '/' + (window.pathStack ? window.pathStack.join('/') : '');
}

