export async function apps() {
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await ReadFile(gapi);
    var json = JSON.parse(text);

    for (var elem in json) {
        print(elem.path);
    }

    //clear();
    cmdReady();
}
