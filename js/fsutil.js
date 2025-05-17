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

window.getGithubTree = async function() {
    const [user, repo] = window.repoName.split('/');
    const api = `https://api.github.com/repos/${user}/${repo}/git/trees/HEAD?recursive=1`;
    const res = await window.ghfetch(api);

    if (!res.ok) {
        console.error(`Failed to fetch tree for ${repoName}`);
        return;
    }

    const data = await res.json();

    if (!data.tree) { return; }

    for (let node of data.tree) {
        node.type = { 'tree' : 'dir'
                    , 'blob' : 'file'
                    }[node.type];
    }

    return data.tree;
}

window.getGithubFS = function(tree, fs) {
    for (const node of tree) {
        const parts = node.path.split('/');
        let current = fs;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (!current.children) {
                current.children = {};
            }

            if (!current.children[part]) {
                current.children[part] = { type: i === parts.length - 1 ? node.type : 'dir'
                                         , ...(i === parts.length - 1 ? node : {})
                                         , children: i === parts.length - 1 ? undefined : {}
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

window.resolvePath = function(path) {
    if (!window.pathStack) {
        window.pathStack = [];
    }

    const parts = path.split('/').filter(Boolean);
    const stack = path.startsWith('/') ? [] : [...window.pathStack];

    for (const part of parts) {
        if (part === '..') {
            stack.pop();
        } else if (part !== '.' && part !== '') {
            stack.push(part);
        }
    }

    return stack.join('/');
};

