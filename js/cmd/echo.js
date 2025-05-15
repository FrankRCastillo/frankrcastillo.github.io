export const description = "Print text to the terminal.";

export default async function echo(args, base, stdin = '') {
    if (args.length === 0 && !stdin) { return ''; }

    const text = args.join(' ');

    return text || stdin;
}
