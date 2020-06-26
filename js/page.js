async function SetConsole() {
    var console = document.createElement("div");
    var outtext = document.createElement("div");
    var inptext = AddCommandLine();

    console.setAttribute("id", "console");
    outtext.setAttribute("id", "outtext");

    console.appendChild(inptext);
    console.appendChild(outtext);

    return console;
}

function RSSParser(xml) {
    parser   = new DOMParser();
    xmldoc   = parser.parseFromString(xml, 'text/xml');
    var arr  = [];
    var fwdt = Math.floor(screen.width / 9) - 23;  // screen width / font width = character width
    var pwdt = Math.floor(fwdt * 0.25);            // quarter of screen goes to publication
    var awdt = Math.floor(fwdt * 0.75);            // half of screen goes to article title
    var src  = trunc(xmldoc.getElementsByTagName('title')[0].textContent, pwdt);
    var itm  = xmldoc.getElementsByTagName('item');

    for (var i = 0; i < itm.length; i++) {
        arr.push([ src
                 , trunc(itm[i].getElementsByTagName('title'  )[0].textContent, awdt)
                 , dateUtc(itm[i].getElementsByTagName('pubDate')[0].textContent)
                 , itm[i].getElementsByTagName('link'   )[0].textContent
                 ]);
    }
    
    return arr;
}

function trunc(str, len) {
    if (str.length <= len) {
        return str;
    } else {
        return str.slice(0, len) + '...';
    }
}

function dateUtc(str) {
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

async function home() {
    var txt = await ReadFile('../main/home/main.txt');
    print('\n');
    print(txt);
}

async function ReadFile(url) {
    return (await fetch(url)).text();
}

async function CommandManager(cmd) {
    clear();

    switch (cmd) {
        case 'clear': clear()        ; break;
        case 'help' : help()         ; break;
        case 'home' : home()         ; break;
        default:
            try {
                let app = await import('../main/apps/' + cmd + '.js');
                eval('app.' + cmd + '()');
            } catch(err) {
                print(cmd + ': command not found');
                console.log(err.message);
            }
    }
}

function print(text) {
    var outtext  = document.getElementById("outtext");
    var newtext  = document.createElement("div");
    var inputbox = document.getElementById("inputbox");

    newtext.innerText = text;

    outtext.appendChild(newtext);

    inputbox.focus();
}

function AddCommandIcons() {
    var linkdiv = document.createElement("div");
    var textdiv = document.getElementById("textdiv");
    var textlbl = document.getElementById("inputlabel");
    var linkcat = [ 'home', 'apps', 'news', 'talk' ];

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
    txtlabel = document.createElement("label");
    txtlabel.setAttribute("name", "inputbox");
    txtlabel.setAttribute("id", "inputlabel");
    txtlabel.innerText = "\$";

    txtinput = document.createElement("input");
    txtinput.setAttribute("id", "inputbox");
    txtinput.setAttribute("name", "inputbox");
    txtinput.setAttribute("type", "text");

    txtdiv   = document.createElement("div");
    txtdiv.setAttribute("id", "textdiv");
    txtdiv.appendChild(txtlabel);
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
    
    var textdiv = document.getElementById("textdiv");
    var inlabel = document.getElementById('inputlabel');
    textdiv.insertBefore(AddCommandIcons(), inlabel);
}

main()
