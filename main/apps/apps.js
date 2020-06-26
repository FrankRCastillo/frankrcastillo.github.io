export async function apps() {
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await ReadFile(gapi);
    var json = JSON.parse(text);
    var tree = json.tree;

    for (var i = 0; i < tree.length; i++) {
        print(tree[i].path);
    }

    //clear();
    cmdReady();
}
