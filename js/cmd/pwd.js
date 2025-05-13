export default function pwd() {
    return '/' + (window.pathStack ? window.pathStack.join('/') : '');
}

