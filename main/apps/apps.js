export async function apps() {
    var url  = 'https://frankr.castillo.github.io/';
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await ReadFile(gapi);
    var json = JSON.parse(text);
    var tree = json.tree;
    var list = [];

    for (var i = 0; i < tree.length; i++) {
        var path = tree[i].path;
        if (path.search(/main\/apps\/.*\.js/) > -1) {
            var file = await ReadFile(url + path);
            list.push(getjsdesc(file));
        }
    }

    clear();
    print(list);
    cmdReady();
}

function getjsdesc(str) {
    var lines = str.split('\n');
    var regex = '^// |.*'

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(regex)) {
            return lines[i];
        }
    }
}
