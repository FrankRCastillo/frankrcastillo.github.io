export const description = "Mount a public GitHub repo into the shell.";

export default async function mount(args) {
    if (args.length === 0) {
      return 'mount: missing repo name (e.g., user/repo)';
    }

    const repo = args[0];
    const url = `https://api.github.com/repos/${repo}/contents`;

    try {
        const res = await ghfetch(url);

        if (!res.ok) { return `mount: failed to access repo: ${repo}`; }

        window.repoName = repo;
        window.repoBase = url;

        return `mounted ${repo}`;

    } catch {
        return `mount: error mounting ${repo}`;

    }
}
