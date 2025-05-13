export default function pwd() {
    if (!window.pathStack) return '/';
    return '/' + window.pathStack.join('/');
}


