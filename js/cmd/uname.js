export const description = "Show browser and platform information.";

export default async function uname(args, base, stdin = '') {
    const ua = navigator.userAgent;
    const platform = navigator.platform || 'unknown';
    const language = navigator.language || 'unknown';

    return [
        `Platform: ${platform}`,
        `User Agent: ${ua}`,
        `Language: ${language}`
    ].join('\n');
}

