export const description = "Mount a public GitHub repo into the shell.";

export default async function mount(args) {
    if (args.length === 0) {
        const status = (window.repoName === window.defaultRepoName && window.repoBase === window.defaultRepoBase) ? 'default' : 'mounted'

        return [ `repo   : ${window.repoName}`
               , `base   : ${window.repoBase}`
               , `status : ${status}`
               ].join('\n');
    }

    const repo = args[0];
    const url = `https://api.github.com/repos/${repo}/contents`;

    try {
        const res = await ghfetch(url);

        if (!res.ok) { return `mount: failed to mount repo: ${repo}`; }

        window.repoName = repo;
        window.repoBase = url;

        return `repo set to ${repo}`;

    } catch {
        return `mount: error mounting ${repo}`;

    }
}
