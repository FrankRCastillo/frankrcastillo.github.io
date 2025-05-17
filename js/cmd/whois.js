export const description = "Get information from another GitHub user.";

export default async function whois(args) {
    if (args.length === 0) { return 'whois: missing GitHub username'; }

    const username = args[0];
    const url = `https://api.github.com/users/${username}`;

    try {
        const res = await window.ghfetch(url);

        if (!res.ok) { return `whois: user not found: ${username}`; }

        const data = await res.json();

        return [ `Username     : ${data.login}`
               , `Name         : ${data.name || '(no name)'}`
               , `Bio          : ${data.bio || '(no bio)'}`
               , `Location     : ${data.location || '(no location)'}`
               , `Public Repos : ${data.public_repos}`
               , `Followers    : ${data.followers}`
               , `Following    : ${data.following}`
               , `Profile      : ${data.html_url}`
               ].join('\n');

    } catch {
        return `whois: error retrieving data for ${username}`;
    }
}

