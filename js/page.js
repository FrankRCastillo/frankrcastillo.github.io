async function setConsole() {
    var news = await import('/apps/news.js');
    var menu = await newSelector();
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

    npnl.setAttribute('id', 'newspnl');
    npnl.appendChild(await news.getNewsFeed());

    ndiv.setAttribute('id', 'newsdiv');
    ndiv.appendChild(nhdr);
    ndiv.appendChild(npnl);

    main.appendChild(menu);
    main.appendChild(otxt);
    main.appendChild(ndiv);

    window.newsinterval = await setInterval(async function () {
        var npnl = document.getElementById('newspnl');
        var nget = await news.getNewsFeed();
        npnl.innerHTML = ''
        npnl.appendChild(nget);
    }, 120000);

    return main;
}

function newTabLayout(elems) {
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

async function fileList(filter) {
    var gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var text = await readFile(gapi);
    var json = JSON.parse(text);
    var tree = json.tree;
    var list = Array.from(tree)
                    .map(x => x.path)
                    .filter(x => x.match(filter));

    return list;
}

function rssParser(xml) {
    var arr    = [];
    var parser = new DOMParser();
    var xmldoc = parser.parseFromString(xml, 'text/xml');
    var obj    = document.createElement('a');
    obj.href   = xmldoc.getElementsByTagName('link')[0].textContent;
    var src    = obj.host
                  .replace('www.', '')
                  .replace('.com', '');
    var itm = xmldoc.getElementsByTagName('item');
    var arr = Array.from(itm).map(function(x){
        return [ src
               , dateISO(x.getElementsByTagName('pubDate')[0].textContent)
               , decodeHtml(x.getElementsByTagName('title')[0].textContent)
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

function dateISO(str) {
    var reldtg = Date.parse(str);
    var isodtg = new Date(reldtg).toISOString();

    return isodtg.split('.')[0] + 'Z';
}

function dateUTC(str) {
    var reldtg = Date.parse(str);
    var utcdtg = new Date(reldtg);

    return utcdtg.toUTCString();
}

// if hdrrow is true, function will treat first row in array as table header
// if haslink is true, will treat last element in row as link
function arrayToTable(arr, hdrrow, haslink) {
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function readFile(url) {
    try{
        let corsarr = corsProxy(url);
        var procurl = corsarr[0];
        var header  = corsarr[1];
        
        switch (url.slice(-3)) {
            case 'pdf':
                header['headers']['Content-Type'] = 'application/pdf;base64';
                return await fetch(procurl, header)
                             .then(response => response.blob())
                             .then(response => blobToBase64(response))
                             .catch(() => console.log('Error getting ' + procurl));

            default:
                return await fetch(procurl, header)
                             .then(response => response.text())
                             .catch(() => console.log('Error getting ' + procurl));
        }
    } catch(err) {
        console.log(err.message);
    }
}

function corsProxy(url) {
    let   header   = { headers : {} };
    const currhost = new URL(window.location.href);
    const readhost = new URL(url, currhost);
    const homeurls = [ currhost.hostname
                     , 'api.github.com'
                     , 'freegeoip.app'
                     ];
    
    if (homeurls.includes(readhost.hostname)){
        return [ readhost.href, header ];
    } else{
        const corsarr  = [ [ 'https://cors-anywhere.herokuapp.com/' , true  ]
                         , [ 'https://api.allorigins.win/raw?url='  , false ]
                         ];
        const randidx  = getRandomInt(0, corsarr.length - 1);

        if(corsarr[randidx][1]) {
            header['headers']['Access-Control-Request-Headers'] = 'origin';
            header['headers']['Access-Control-Allow-Origin']    = '*';
        }

        return [ corsarr[randidx][0] + url, header ];
    }
}

async function readPdf(binary) {
    var bin = convertDataURIToBinary(binary);
    var wht = { normalizeWhitespace : true };
    var doc = await pdfjsLib.getDocument(bin).promise;
    var txt = Array.from({length : doc.numPages}, async (x, i) => {
        return (await (await doc.getPage(i + 1))
                                .getTextContent())
                                .items
                                .map(token =>  token.str)
    });

    return (await Promise.all(txt));
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

async function cmdMgr(input) {
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
    var lst = await getCmdInfo();
    var hdr = ['Category', 'Command', 'Information'];
    lst.unshift(hdr);
    var tbl = arrayToTable(lst, true, false); 
    document.getElementById('outtext').appendChild(tbl);
}

async function read(path) {
    var txt = await readFile(path)
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

function newCmdLine() {
}

async function newSelector() {
    var cmdSelect = document.createElement('select');
    var cmmndInfo = await getCmdInfo();

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
        'click', (e => cmdMgr(e.path[0][e.path[0].selectedIndex].value))
    );

    return cmdSelect;
}

async function getCmdInfo() {
    var list = await fileList(/apps\/.*\.js$/);
    var lout = await Promise.all(list.map(async x => getJsDesc(await readFile(x))));

    lout.sort();
    lout.unshift(['core', 'home', 'Show the home screen']);
    return lout;    
}

function getJsDesc(str) {
    return str.split('\n')
              .filter(x => x.match('^// |.*'))[0]
              .replace('// |', '')
              .split('|');
}

function tableToArray(txt, delim) {
    return txt.split('\n').map(x => x.split(delim));
}

function scaleResize(id) {
    var elem = document.getElementById(id);
    var csty = getComputedStyle(elem);
    var fact = 1.05;

    if (window.outerWidth < window.outerHeight) {
        elem.style.transform = 'scale(calc('
                             + window.innerWidth
                             + ' / '
                             + csty.width.replace('px', '') * fact
                             + '))';
    } else {
        elem.style.transform = 'scale(calc('
                             + window.innerHeight
                             + ' / '
                             + csty.height.replace('px', '') * fact
                             + '))';
    }

}

async function main() {
    var body = document.body;

    body.appendChild(await setConsole());
    home();
    scaleResize('console');
    window.addEventListener('resize', function() {
        scaleResize('console')
    }, true);
}

main()
