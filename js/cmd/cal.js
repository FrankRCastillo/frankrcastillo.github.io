export const description = "View a command-line calendar.";

export default async function cal(args, base, stdin = '') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    const date = new Date(year, month, 1);
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    let output = `     ${date.toLocaleString('default', { month: 'long' })} ${year}\n`;
    output += days.join(' ') + '\n';

    let week = new Array(date.getDay()).fill('  ');
    while (date.getMonth() === month) {
        const day = date.getDate().toString().padStart(2, ' ');
        week.push(day);
        if (week.length === 7) {
            output += week.join(' ') + '\n';
            week = [];
        }
        date.setDate(date.getDate() + 1);
    }
    if (week.length > 0) output += week.concat(new Array(7 - week.length).fill('  ')).join(' ') + '\n';

    return output.trimEnd();
}

