export async function apps() {
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await ReadFile(gitapi);
    var json = JSON.parse(gittxt);

    for (var ele in json) {
        print(ele.path);
    }

    clear();
    cmdReady();
}
