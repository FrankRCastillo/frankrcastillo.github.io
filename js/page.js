function NewObject(prnt, attr) {
    for (var i = 0; i < attr.length; i++) {
        var child = document.createElement(attr[i][0]);

        for (var j = 0; j < attr[i][2].length; j++) {
            var atrtype = attr[i][2][j][0];
            var attrval = attr[i][2][j][1];

            switch (atrtype) {
                case 'text':
                    var text = document.createTextNode(attrval);
                    child.appendChild(text);
                    break;

                case 'object':
                    child.appendChild(attrval);
                    break;

                default:
                    child.setAttribute(atrtype, attrval);
                    break;
            }
        }
        
        if (prnt.id == attr[i][1]) {
            prnt.appendChild(child);
        } else {
            prnt.querySelector('#' + attr[i][1]).appendChild(child);
        }
    }

    return prnt;
}

async function SetConsole() {
    var clne = NewCommandLine();
    var icon = NewMenuIcon();
    var menu = await NewMenuDropDown();
    var main = document.createElement('div');
    main.setAttribute('id', 'console');

    var objs = [ [ 'div', 'console', [ [     'id','contain'] ] ]
               , [ 'div', 'console', [ [     'id','outtext'] ] ]
               , [ 'div', 'contain', [ [     'id','menudiv'] ] ]
               , [ 'div', 'menudiv', [ [ 'object',     icon]
                                     , [ 'object',     menu] ] ]
               , [ 'div', 'contain', [ [     'id','textdiv']
                                     , [ 'object',    clne ] ] ]
               ]

    return NewObject(main, objs);
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
    var fwdt = Math.floor(screen.width / 10) - 35;  // (screen width / font width) - dtg = pub and title width
    var pwdt = Math.floor(fwdt * 0.20);             // quarter of screen goes to publication
    var awdt = Math.floor(fwdt * 0.80);             // half of screen goes to article title
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

function isURL(url) {
    var results = false;

    try {
        var urlchk = new URL(url);
        results = urlchk.protocol === 'http:' || urlchk.protocol === 'https:';
    } catch (err) {
        console.log(err.message + '. Returning false.')
    }

    return results;
}

async function ReadFile(url) {
    try{
        var corsprxy = '';

        try {
            var currhost = new URL(window.location.href);
            var readhost = new URL(url);

            if ( readhost.hostname != currhost.hostname
              && readhost.hostname != 'api.github.com'
              && isURL(url)) {
                corsprxy = 'https://cors-anywhere.herokuapp.com/';
            }
        } catch(err) {
            console.log(err.message);
        }

        return (await fetch(corsprxy + url, { headers: { 'Access-Control-Request-Headers' : 'origin' }})).text();
    } catch(err2) {
        console.log(err2.message);
    }
}

async function CommandManager(input) {
    clear();
    SetInputVal('');

    var cmd = input.toLowerCase();

    switch (cmd) {
        case 'home' : home()                 ; break;
        default:
            CmdWait();

            try {
                let app = await import('/main/' + cmd + '.js');
                eval('app.' + cmd + '()');
            } catch(err) {
                CmdReady();
                print(cmd + ': command not available');
                console.log(err.message);
            }
    }
}

function home() {
    read('/main/home/home.txt');
}

async function read(path) {
    var txt = await ReadFile(path)
    print('\n');
    print(txt);
}

function clear() {
    document.getElementById('outtext').innerHTML = '';
}

function print(text) {
    if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            print(text[i]);
        }
    } else {
        var outtxt = document.getElementById("outtext");
        var newtxt = document.createElement("div");
        var rgxexp = /(http.?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        var rgxdom = new RegExp(rgxexp);
        var rgxget = text.match(rgxdom);
        
        if (rgxget != null) {
            for (var i = 0; i < rgxget.length; i++) {
                var oldurl = rgxget[i];
                var newurl = '<a href="' + rgxget[i] + '" target="_blank">' + rgxget[i] + '</a>';
                text = text.replace(new RegExp(oldurl, 'gi'), newurl);
            }
        }
        
        text = text.replace(/\n/g, '<br/>');
        newtxt.innerHTML = text;
        outtxt.appendChild(newtxt);
    }
}

function CmdReady() {
    document.getElementById('inputbox').placeholder = '\u25B6 "help", or click menu button, for commands...';

    SetInputVal('');
}

function CmdWait() {
    document.getElementById('inputbox').placeholder = '\u25A0 Loading...';

    ShowCmdList(false);
    SetInputVal('');
}

function NewCommandLine() {
    txtinput = document.createElement('input');
    txtinput.setAttribute('id', 'inputbox');
    txtinput.setAttribute('type', 'text');

    window.addEventListener('keyup', function(e) {
        switch (e.keyCode) {
            case 13:
                CommandManager(GetInputVal());
                break;

            case 27:
                ShowCmdList(false);
                break;

            case 38: 
            case 40:
                SetInputVal(GetSelCmd());
                break;
                     
            default:
        }
    });

    return txtinput;
}

function NewMenuIcon() {
    var div  = document.createElement('div');
    var node = document.createTextNode('\u2630');
    
    div.setAttribute('id', 'menuico');
    div.appendChild(node);
    div.style.cursor = 'pointer';

    div.addEventListener('click', function() {
        if (document.getElementById('menusel').style.display == 'inline') {
            ShowCmdList(false);
        } else {
            ShowCmdList(true);
        }
    });

    return div; 
}

function ShowCmdList(showlst) {
    var elem = document.getElementById('menusel');

    if (showlst) {
        elem.options.selectedIndex = 1;
        elem.focus();
        SetInputVal(elem.options[elem.selectedIndex].value); 
        elem.style.display = 'inline';
    } else {
        SetInputVal('');
        elem.options.selectedIndex = 0;
        elem.style.display = 'none';
    }
}

async function NewMenuDropDown() {
    var menu = document.createElement('select');
    var blnk = document.createElement('option');
    var lout = await GetCmdInfo();

    menu.setAttribute(      'id', 'menusel');
    menu.setAttribute(   'class', 'menubtn');
    menu.setAttribute('multiple',      true);
    blnk.setAttribute('disabled',      true);
    blnk.setAttribute('selected',      true);
    blnk.setAttribute(  'hidden',      true);

    menu.appendChild(blnk);
    
    for (var i = 0; i < lout.length; i++) {
        var grp = menu.querySelector('#' + lout[i][0]);
        var opt = document.createElement('option');

        if (grp == null) {
            grp = document.createElement('optgroup');
            grp.setAttribute('label', lout[i][0]);
            grp.setAttribute('id'   , lout[i][0]);
        }

        opt.setAttribute('value', lout[i][1]);
        opt.textContent = lout[i][1] + ' : ' + lout[i][2];
        grp.appendChild(opt);
        menu.appendChild(grp);
    }

    return menu;
}

function GetSelCmd() {
    var sel = document.getElementById('menusel');
    return sel.options[sel.selectedIndex].value;
}

function GetInputVal() {
    return document.getElementById('inputbox').value.toLowerCase();
}

function SetInputVal(val) {
    var inputbox = document.getElementById('inputbox');
    inputbox.value = val;
}

async function GetCmdInfo() {
    var host = window.location.href;
    var list = await FileList(/main\/.*\.js/);
    var lout = [];

    lout.push(['core', 'home', 'Show the home screen']);

    for (var i = 0; i < list.length; i++) {
        var base = list[i].split('\/')[0];
        var file = await ReadFile(host + list[i]);
        var line = GetJsDesc(file);
        lout.push(line);
    }

    lout.sort();

    return lout;    
}

function GetJsDesc(str) {
    var lines = str.split('\n');
    var regex = '^// |.*'

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(regex)) {
            var line = lines[i].replace('// |', '');
            return line.split('|');
        }
    }
}
async function main() {
    var body = document.body;

    body.appendChild(await SetConsole());
    home();
    CmdReady();
}

main()
