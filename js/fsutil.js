window.ghfetch = async function(url, options = {}) {
    return fetch( url
                , { method      : 'GET'
                  , credentials : 'omit'
                  , cache       : 'no-cache'
                  ,...options
                  }
                );
};

window.getFSNode = function(path) {
    if (!window.repoName || !window.githubfs) {
        return null;
    }

    const [user, repo] = window.repoName.split('/');
    const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

    let node = window.githubfs[user]?.[repo];

    for (const part of parts) {
        if (!node?.children?.[part]) {
            return null;
        }
        node = node.children[part];
    }

    return node;
};

window.populateGithubFS = async function(repoName) {
    const [user, repo] = repoName.split('/');
    const api = `https://api.github.com/repos/${user}/${repo}/git/trees/HEAD?recursive=1`;
    const res = await window.ghfetch(api);

    if (!res.ok) {
        console.error(`Failed to fetch tree for ${repoName}`);
        return;
    }

    const data = await res.json();

    if (!data.tree) {
        return;
    }

    if (!window.githubfs) {
        window.githubfs = {};
    }

    if (!window.githubfs[user]) {
        window.githubfs[user] = {};
    }

    const root = {};

    window.githubfs[user][repo] = root;

    for (const item of data.tree) {
        const parts = item.path.split('/');

        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (!current.children) {
                current.children = {};
            }

            if (!current.children[part]) {
                current.children[part] = {
                    type: i === parts.length - 1
                        ? ( item.type === 'tree' ? 'dir' : item.type === 'blob' ? 'file' : item.type)
                        : 'dir',
                    
                    ...(i === parts.length - 1 ? item : {}),
                };

            }

            current = current.children[part];
        }
    }
};

window.getGithubFSNode = function(path) {
    if (!window.githubfs || !window.repoName) {
        return null;
    }

    const [user, repo] = window.repoName.split('/');
    const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    let node    = window.githubfs?.[user]?.[repo];

    for (const part of parts) {
        if (!node?.children?.[part]) {
            return null;
        }

        node = node.children[part];
    }

    return node;
};

window.getFileFromFS = function(path) {
    const node = window.getGithubFSNode(path);
    return node && node.type === 'file' ? node : null;
};

window.getDirFromFS = function(path) {
    const node = window.getGithubFSNode(path);
    
    if (node && node.type === 'dir') {
        return node;
    }

    return null;
};
