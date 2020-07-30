async function SetConsole() {
    var news = await import('/apps/news.js');
    var menu = await NewCommandLine();
    var main = document.createElement('div');
    var otxt = document.createElement('div');
    var npnl = document.createElement('div');
    var nhdr = document.createElement('div');
    var ndiv = document.createElement('div');
    var nlnk = document.createElement('a');

    main.setAttribute('id', 'console');
    otxt.setAttribute('id', 'outtext');

    nlnk.textContent = 'Toggle';
    nlnk.addEventListener('click', async function () {
        var news = await import('/apps/news.js');
        news.news();
    });

    nhdr.setAttribute('id', 'newshdr');
    nhdr.appendChild(nlnk);

    ndiv.setAttribute('id', 'newspnl');
    ndiv.appendChild(await news.GetNewsFeed());

    npnl.appendChild(nhdr);
    npnl.appendChild(ndiv);

    main.appendChild(menu);
    main.appendChild(otxt);
    main.appendChild(npnl);

    window.newsinterval = await setInterval(async function () {
        var npnl = document.getElementById('newspnl');
        var nget = await news.GetNewsFeed();
        npnl.innerHTML = ''
        npnl.appendChild(nget);
    }, 120000);

    return main;
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
    var list = Array.from(tree)
                    .map(x => x.path)
                    .filter(x => x.match(filter));

    return list;
}

function RSSParser(xml) {
    parser   = new DOMParser();
    xmldoc   = parser.parseFromString(xml, 'text/xml');
    var arr  = [];
    var wwdt = window.innerWidth;
    var awdt = Math.floor(wwdt / 10) - 32;          // half of screen goes to article title
    var obj  = document.createElement('a');
    obj.href = xmldoc.getElementsByTagName('link')[0].textContent;
    var src  = obj.host
                  .replace('www.', '')
                  .replace('.com', '');
    var itm = xmldoc.getElementsByTagName('item');
    var arr = Array.from(itm).map(function(x){
        return [ src
               , trunc(decodeHtml(x.getElementsByTagName('title')[0].textContent), awdt)
               , DateISO(x.getElementsByTagName('pubDate')[0].textContent)
               , x.getElementsByTagName('link')[0].textContent
               ];
    });
    
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
        var blb = null;
        var hdr = {}
        var currhost = new URL(window.location.href);
        var readhost = new URL(url, currhost);
        var corsurl  = 'https://cors-anywhere.herokuapp.com/';
        var corsprxy = (![ currhost.hostname
                         , 'api.github.com'
                         , 'freegeoip.app'
                         ].includes(readhost.hostname) && isURL(url) ? corsurl : '');
        
        switch (url.slice(-3)) {
            case 'pdf':
                hdr = { headers : { 'Access-Control-Request-Headers' : 'origin'
                                  , 'Content-Type' : 'application/pdf;base64'  }};
                blb = await(await fetch(corsprxy + url, hdr)).blob();
                return blobToBase64(blb);

            default:
                hdr = { headers : { 'Access-Control-Request-Headers' : 'origin' } }
                return (await fetch(corsprxy + url, hdr)).text();
        }
    } catch(err) {
        console.log(err.message);
    }
}

function blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};

// https://gist.github.com/borismus/1032746
function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ';base64,';
    var base64Index   = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64        = dataURI.substring(base64Index);
    var raw           = window.atob(base64);
    var rawLength     = raw.length;
    var array         = new Uint8Array(new ArrayBuffer(rawLength));
    
    return array.map((x, i) => raw.charCodeAt(i));
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
                    let app = await import('/apps/' + cmd + '.js');
                    eval('app.' + cmd + '()');
//                } catch(err) {
//                    print(cmd + ': command not available');
//                    console.log(err.message);
//                }
        }
    }
}

function home() {
    read('/apps/home/home.txt');
}

async function help() {
    var lst = await GetCmdInfo();
    var hdr = ['Category', 'Command', 'Information'];
    lst.unshift(hdr);
    var tbl = ArrayToTable(lst, true, false); 
    document.getElementById('outtext').appendChild(tbl);
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
                var newurl = '<a href="'
                           + rgxget[i]
                           + '" target="_blank">'
                           + rgxget[i]
                           + '</a>';
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
    var list = await FileList(/apps\/.*\.js$/);
    var lout = await Promise.all(list.map(async x => GetJsDesc(await ReadFile(x))));

    lout.sort();
    lout.unshift(['core', 'home', 'Show the home screen']);
    return lout;    
}

function GetJsDesc(str) {
    return str.split('\n')
              .filter(x => x.match('^// |.*'))[0]
              .replace('// |', '')
              .split('|');
}

function TableToArray(txt, delim) {
    return txt.split('\n').map(x => x.split(delim));
}

async function main() {
    var body = document.body;

    body.appendChild(await SetConsole());
    home();
}

main()
