async function SetConsole() {
    var console = document.createElement('div');
    var inpelem = document.createElement('div');
    var outelem = document.createElement('div');

    console.setAttribute('id', 'console');
    outelem.setAttribute('id', 'outtext');
    inpelem.setAttribute('id', 'textdiv') 
    inpelem.appendChild(AddCommandLine())
    console.appendChild(inpelem);
    console.appendChild(outelem);

    return console;
}

async function FileList(filter) {
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await ReadFile(gapi);
    var json = JSON.parse(text);
    var tree = json.tree;
    var list = [];

    for (var i = 0; i < tree.length; i++) {
        if (tree[i].path.search(filter) > -1) {
            list.push(tree[i].path);
        }
    }

    return list;
}

function RSSParser(xml) {
    parser   = new DOMParser();
    xmldoc   = parser.parseFromString(xml, 'text/xml');
    var arr  = [];
    var fwdt = Math.floor(screen.width / 8) - 35;  // (screen width / font width) - dtg = pub and title width
    var pwdt = Math.floor(fwdt * 0.15);            // quarter of screen goes to publication
    var awdt = Math.floor(fwdt * 0.85);            // half of screen goes to article title
    var src  = trunc(xmldoc.getElementsByTagName('title')[0].textContent, pwdt);
    var itm  = xmldoc.getElementsByTagName('item');

    for (var i = 0; i < itm.length; i++) {
        title = itm[i].getElementsByTagName('title'  )[0].textContent;
        pubdt = itm[i].getElementsByTagName('pubDate')[0].textContent;
        lnkst = itm[i].getElementsByTagName('link'   )[0].textContent;
        deurl = decodeHtml(title);
        isodt = DateISO(pubdt);

        arr.push([ src, trunc(deurl, awdt), isodt, lnkst ]);
    }
    
    return arr;
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function trunc(str, len) {
    if (str.length <= len) {
        return str;
    } else {
        return str.slice(0, len) + '...';
    }
}

function DateISO(str) {
    var reldtg = Date.parse(str);
    var isodtg = new Date(reldtg).toISOString();

    return isodtg.split('.')[0] + 'Z';
}

function DateUTC(str) {
    var reldtg = Date.parse(str);
    var utcdtg = new Date(reldtg);

    return utcdtg.toUTCString();
}

// if hdrrow is true, function will treat first row in array as table header
// if haslink is true, will treat last element in row as link
function ArrayToTable(arr, hdrrow, haslink) {
    var table = document.createElement('table');
    var golnk = 0;

    if (haslink) { golnk = 1; }

    for (var i = 0; i < arr.length; i++) {
        var tr = document.createElement('tr');

        for (var j = 0; j < arr[i].length - golnk; j++) {
            var elem = '';
            if (i == 0 && hdrrow) {
                elem = 'th';
            } else {
                elem = 'td';
            }

            var cell = document.createElement(elem);

            if (haslink) {
                var link = document.createElement('a');
                var node = document.createTextNode(arr[i][j]);
                link.href = arr[i][arr[i].length - 1];
                link.target = '_blank';
                link.appendChild(node);
                cell.appendChild(link);
            } else {
                cell.innerText = arr[i][j]
            }

            tr.appendChild(cell);
        }

        table.appendChild(tr);
    }

    return table;
}

function clear() {
    var outtext = document.getElementById("outtext");
    outtext.innerHTML = '';
}

function home() {
    read('/main/main.txt');
}

async function read(path) {
    var txt = await ReadFile(path)
    print('\n');
    print(txt);
}

async function ReadFile(url) {
    return (await fetch(url, {headers: {'Access-Control-Request-Headers':'origin'}})).text();
}

async function CommandManager(input) {
    clear();
    setinputval('');

    var cmd = input.toLowerCase();

    switch (cmd) {
        case 'home' : home(); break;
        default:
            cmdWait();

            try {
                let app = await import('/main/apps/' + cmd + '.js');
                eval('app.' + cmd + '()');
            } catch(err) {
                cmdReady();
                print(cmd + ': command not available');
                console.log(err.message);
            }
    }

    clearHelp();
}

function cmdReady() {
    var inputbox = document.getElementById('inputbox');

    inputbox.placeholder = '> "help", or click here, for commands...';

    clearHelp();
    setinputval('');
}

function cmdWait() {
    var inputbox = document.getElementById('inputbox');

    inputbox.placeholder = 'X Loading...';

    clearHelp();
    setinputval('');
}

function print(text) {
    if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            print(text[i]);
        }
    } else {
        var outtext = document.getElementById("outtext");
        var newtext = document.createElement("div");
        var parser  = new DOMParser();
        var rgxexp  = /(http.?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        var rgxdom  = new RegExp(rgxexp);
        var rgxget  = text.match(rgxdom);

        for (var i = 0; i < rgxget.count; i++) {
            var oldurl = rgxget[i];
            var newurl = '<a href="' + rgxget[i] + '">' + rgxget[i] + '</a>';
            text = text.replace(new RegExp(oldurl, 'gi'), newurl);
        }
        
        text = text.replace(/\n/g, '<br/>');
        newtext.innerHTML = text;
        outtext.appendChild(newtext);
    }
}

function ChangeClass(id, classname) {
    document.getElementById(id).className = classname;
}

function AddCommandLine() {
    txtinput = document.createElement('input');
    txtinput.setAttribute('id', 'inputbox');
    txtinput.setAttribute('type', 'text');
    txtinput.setAttribute('onclick', 'javascript:{setinputval("help"); help()}');

    window.addEventListener('keyup', function(e) {
        help();

        if (e.keyCode == 13) {
            CommandManager(getinputval());
            clearHelp();
        }
    });

    return txtinput;
}

function clearHelp() {
    while (document.getElementsByClassName('cmdlist').length > 0) {
        var elem = document.getElementsByClassName('cmdlist');
        elem[elem.length - 1].remove();
    }
}

function getinputval() {
    var inputbox = document.getElementById('inputbox');
    return inputbox.value.toLowerCase();
}

function setinputval(val) {
    var inputbox = document.getElementById('inputbox');
    inputbox.value = val;
    inputbox.focus();
}

async function help() {
    var lout  = await getcmdinfo();
    var tdiv  = document.getElementById('textdiv');
    var list  = document.createElement('div');
    var value = getinputval();
    var hxst  = '';

    clearHelp();

    if (value != '') {
        list.setAttribute('class', 'cmdlist');
                
        for (var i = 0; i < lout.length; i++) {
            var citm  = document.createElement('div');
            var cinf  = lout[i].split('|');

            if (lout[i].toLowerCase().indexOf(value) > -1) {
                if (hxst != cinf[0]) {
                    hxst = cinf[0];
                    var chdr = document.createElement('div');
                    chdr.setAttribute('class', 'cmdlisthdr');
                    chdr.textContent = cinf[0];
                    list.appendChild(chdr);
                }

                citm.setAttribute('class', 'cmdlistitm');
                citm.setAttribute('onclick', 'javascript:CommandManager("' + cinf[1] + '")');
                citm.textContent = cinf[1] + ' : ' + cinf[2];   // command [tab] description

                list.appendChild(citm);
            }
        }

        if (list.childElementCount == 0) {
            var citm = document.createElement('div');
            citm.textContent = 'match not found...';
            citm.setAttribute('class', 'cmdlistitm');
            list.appendChild(citm);
        }

        tdiv.appendChild(list);
    }
}

async function getcmdinfo() {
    var url  = 'https://frankrcastillo.github.io/';
    var list = await FileList(/main\/.*\.js/);
    var lout = [];

    lout.push('core help|home|Show the home screen');

    for (var i = 0; i < list.length; i++) {
        var base = list[i].split('\/')[1];
        var file = await ReadFile(url + list[i]);
        lout.push(base + ' help|' + getjsdesc(file));
    }

    return lout;    
}

function getjsdesc(str) {
    var lines = str.split('\n');
    var regex = '^// |.*'

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(regex)) {
            return lines[i].replace('// |','');
        }
    }
}
async function main() {
    var body = document.body;

    body.appendChild(await SetConsole());
    home();
    cmdReady();
}

main()
