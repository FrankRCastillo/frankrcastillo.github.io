async function SetConsole() {
    var console = document.createElement("div");
    var inpelem = document.createElement("div");
    var outelem = document.createElement("div");

    console.setAttribute("id", "console");
    outelem.setAttribute("id", "outtext");
    
    inpelem.appendChild(AddCommandIcons());
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

function soci() {
    read('/main/social.txt')
}

async function read(path) {
    var txt = await ReadFile(path)
    print('\n');
    print(txt);
}

async function ReadFile(url) {
    return (await fetch( url
                       , { headers : { 'Access-Control-Request-Headers' : 'origin, x-requested-with' }
                       )
           ).text();
}

async function CommandManager(input) {
    clear();
    
    var cmd = input.toLowerCase();

    switch (cmd) {
        case 'clear': clear() ; break;
        case 'home' : home()  ; break;
        case 'soci' : soci()  ; break;
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
}

function cmdReady() {
    var inputbox = document.getElementById('inputbox');

    inputbox.placeholder = ' > type "help" for available commands...';
}

function cmdWait() {
    var inputbox = document.getElementById('inputbox');

    inputbox.placeholder = ' Loading...';
}

function print(text) {
    var outtext  = document.getElementById("outtext");
    var newtext  = document.createElement("div");

    if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            print(text[i]);
        }
    } else {
        newtext.innerText = text;
        outtext.appendChild(newtext);
    }

    inputbox.focus();
}

function AddCommandIcons() {
    var linkdiv = document.createElement("div");
    var textdiv = document.getElementById("textdiv");
    var linkcat = [ 'home', 'blog', 'soci' ];

    linkdiv.setAttribute('id', 'linkdiv');

    for (var i = 0; i < linkcat.length; i++) {
        var child = document.createElement('div');
        var id    = linkcat[i] + 'btn'
        child.innerText = linkcat[i];
        child.setAttribute('id', id);
        child.setAttribute('class', 'invert');
        child.setAttribute('onclick', 'CommandManager("' + linkcat[i] + '")');
        child.setAttribute('onmouseover', 'ChangeClass("' + id + '", "normal")');
        child.setAttribute('onmouseout' , 'ChangeClass("' + id + '", "invert")');
        linkdiv.appendChild(child);
    }

    return linkdiv;
}

function ChangeClass(id, classname) {
    document.getElementById(id).className = classname;
}

function AddCommandLine() {
    txtinput = document.createElement('input');
    txtinput.setAttribute('id', 'inputbox');
    txtinput.setAttribute('type', 'text');

    txtdiv = document.createElement("div");
    txtdiv.setAttribute("id", "textdiv");
    txtdiv.appendChild(txtinput);

    window.addEventListener('keydown', function(e) {
        var inputbox = document.getElementById("inputbox");
        
        if (e.keyCode == 13) {
            CommandManager(inputbox.value);
            inputbox.value = '';

        } else {
            inputbox.focus();

        }
    });

    return txtdiv;
}

async function main() {
    var body = document.body;

    body.appendChild(await SetConsole());
    home();
    cmdReady();
}

main()
