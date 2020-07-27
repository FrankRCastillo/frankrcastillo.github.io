async function SetConsole() {
    var clne = NewCommandLine();
    var menu = await NewCommandLine();
    var main = document.createElement('div');
    var otxt = document.createElement('div');
    var npnl = await NewNewsPanel();

    main.setAttribute('id', 'console');
    otxt.setAttribute('id', 'outtext');

    main.appendChild(menu);
    main.appendChild(otxt);
    main.appendChild(npnl);

    

    return main;
}

async function NewNewsPanel() {
    var npnl = document.createElement('div');
    var nhdr = document.createElement('div');
    var ndiv = document.createElement('div');
    var nlnk = document.createElement('a');
    var news = await import('/main/news.js');

    nlnk.addEventListener('click', CommandManager("news"));
    nlnk.textContent = "Expand";

    nhdr.setAttribute('id', 'newshdr');
    nhdr.appendChild(nlnk);

    ndiv.setAttribute('id', 'newspnl');
    ndiv.appendChild(await news.GetNewsFeed());

    npnl.appendChild(nhdr);
    npnl.appendChild(ndiv);

    window.newspnlinterval = await setTimeout(async function() {
        var npnl = document.getElementById('newspnl');
        npnl.innerHTML = '';
        npnl.appendChild(await news.GetNewsFeed());
    }, 60000);

    return npnl;
}

function NewTabLayout(elems) {
    var encls = document.createElement('div');
    var tbfrm = document.createElement('div');
    var bdfrm = document.createElement('div');

    encls.setAttribute('class', 'tabencl');
    tbfrm.setAttribute('class', 'tabfrme');
    bdfrm.setAttribute('class', 'bdyfrme');

    for (var i = 0; i < elems.length; i++) {
        var tabbtn = document.createElement('button');
        var tabbdy = document.createElement('div');
 
        tabbtn.addEventListener('click', function() {
            var partabs = this.parentElement.parentElement;
            var bdyelem = partabs.getElementsByClassName('tabbody');
            var tgtelem = document.getElementById(this.textContent);

            for (var j = 0; j < bdyelem.length; j++) {
                bdyelem[j].style.display = 'none';
            }

            tgtelem.style.display = 'block';
        });

        tabbtn.setAttribute('class', 'tabbtns');
        tabbdy.setAttribute('class', 'tabbody');
        tabbdy.setAttribute(   'id',  elems[i]);
        tabbtn.textContent = elems[i];
        
        if (i == 0) {
            tabbdy.style.display = 'block';
        } else {
            tabbdy.style.display = 'none';
        }

        tbfrm.appendChild(tabbtn);
        bdfrm.appendChild(tabbdy);
    }

    encls.appendChild(tbfrm);
    encls.appendChild(bdfrm);

    return encls;
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
    var wwdt = window.innerWidth;
    var fwdt = Math.floor(wwdt / 10) - 18;          // (window width / font width) - dtg = pub and title width
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
              && readhost.hostname != 'freegeoip.app'
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
    if (input != '') {
        clearInterval(window.appinterval);
        clear();

        var cmd = input.toLowerCase();

        switch (cmd) {
            case 'home' : home(); break;
            case 'help' : help(); break;
            default:

//                try {
                    let app = await import('/main/' + cmd + '.js');
                    eval('app.' + cmd + '()');
//                } catch(err) {
//                    print(cmd + ': command not available');
//                    console.log(err.message);
//                }
        }
    }
}

function home() {
    read('/main/home/home.txt');
}

async function help() {
    var lst = await GetCmdInfo();
    var hdr = ['Category', 'Command', 'Information'];
    lst.unshift(hdr);
    var tbl = ArrayToTable(lst, true, false); 
    document.getElementById('outtext').appendChild(tbl);
    ////CmdReady();
}

async function read(path) {
    var txt = await ReadFile(path)
    print('\n');
    print(txt);
}

function clear() {
    var out = document.getElementById('outtext');
    if (out != null) { out.innerHTML = ''; }
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

async function NewCommandLine() {
    var cmdSelect = document.createElement('select');
    var cmmndInfo = await GetCmdInfo();

    cmdSelect.setAttribute('id', 'cmdSelect')

    window.addEventListener('keyup',
        function (e) {
            var cmdSelect = document.getElementById('cmdSelect');
            var selValue  = cmdSelect.options[cmdSelect.selectedIndex].value;

            if (e.keyCode == 13) { CommandManager(selValue); }
        }
    );

    for (var i = -1; i < cmmndInfo.length; i++) {
        var cmdOption = document.createElement('option');

        if (i == -1) {
            cmdOption.textContent = '';
            cmdOption.setAttribute(   'value',   '');
            cmdOption.setAttribute(  'hidden', true);
            cmdOption.setAttribute('selected', true);
        } else {
            var cmdGroup  = cmdSelect.querySelector('#' + cmmndInfo[i][0]);

            if (cmdGroup == null) {
                cmdGroup = document.createElement('optgroup');
                cmdGroup.setAttribute('label', cmmndInfo[i][0]);
                cmdGroup.setAttribute(   'id', cmmndInfo[i][0]);
            }

            cmdOption.setAttribute('value', cmmndInfo[i][1]);
            cmdOption.textContent = cmmndInfo[i][1] + ' : ' + cmmndInfo[i][2];
            cmdGroup.appendChild(cmdOption);
            cmdSelect.appendChild(cmdGroup);
        }
    }

    cmdSelect.addEventListener(
        'click', (e => CommandManager(e.path[0][e.path[0].selectedIndex].value))
    );

    return cmdSelect;
}

async function GetCmdInfo() {
    var host = window.location.href;
    var list = await FileList(/main\/.*\.js$/);
    var lout = [];

    for (var i = 0; i < list.length; i++) {
        var base = list[i].split('\/')[0];
        var file = await ReadFile(host + list[i]);
        var line = GetJsDesc(file);
        lout.push(line);
    }

    lout.sort();
    lout.unshift(['core', 'home', 'Show the home screen']);
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

function csv2arr(txt) {
    return txt.split('\n').map(x => x.split(','));
}

async function main() {
    var body = document.body;

    body.appendChild(await SetConsole());
    home();
    ////CmdReady();
}

main()
