export const description = "Mount a public GitHub repo into the shell.";

export default async function mount(args) {
    if (args.length === 0) {
        const status = ( window.repoName === window.defaultRepoName
                      && window.repoBase === window.defaultRepoBase
                       ) ? 'default' : 'mounted';

        return [ `repo   : ${window.repoName}`
               , `base   : ${window.repoBase}`
               , `status : ${status}`
               ].join('\n');
    }

    const repoName = args[0];
    const url = `https://api.github.com/repos/${repoName}/contents`;

    try {
        const res = await window.ghfetch(url);

        if (!res.ok) { return `mount: failed to mount repo: ${repoName}`; }

        window.repoName = repoName;
        window.repoBase = url;
        window.repoTree = await window.getGithubTree();

        const [ user, repo ] = window.repoName.split('/');

        if (!window.githubfs?.[user]?.[repo]) {
            window.githubfs[user] = window.githubfs[user] || {};
            window.githubfs[user][repo] = window.githubfs[user][repo] || {};
            window.getGithubFS(window.repoTree, window.githubfs[user][repo]);
        }

        return `repo set to ${repo}`;

    } catch {
        return `mount: error mounting ${repo}`;

    }
}
