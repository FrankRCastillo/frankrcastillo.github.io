// | help : Show list of available commands

export async function help() {
    var url  = 'https://frankrcastillo.github.io/';
    var list = await FileList(/main\/.*\.js/);
    var lout = [];

    for (var i = 0; i < list.length; i++) {
        var base = list[i].split('\/')[1];
        var file = await ReadFile(url + list[i]);
        lout.push(base + ' | ' + getjsdesc(file));
    }

    clear();
    print('\n');
    print(lout);
    cmdReady();
}

function getjsdesc(str) {
    var lines = str.split('\n');
    var regex = '^// |.*'

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(regex)) {
            return lines[i].split('|')[1];
        }
    }
}
