async function setConsole() {
    let news = await import('/apps/news.js');
    let menu = await newSelector();
    let main = document.createElement('div');
    let otxt = document.createElement('div');
    let npnl = document.createElement('div');
    let nhdr = document.createElement('div');
    let ndiv = document.createElement('div');
    let nlnk = document.createElement('a');

    main.setAttribute('id', 'console');
    otxt.setAttribute('id', 'outtext');

    nlnk.textContent = 'Toggle';
    nlnk.addEventListener('click', async function () {
        let news = await import('/apps/news.js');
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
        let npnl = document.getElementById('newspnl');
        let nget = await news.getNewsFeed();
        npnl.innerHTML = ''
        npnl.appendChild(nget);
    }, 120000);

    return main;
}

function newTabLayout(elems) {
    let encls = document.createElement('div');
    let tbfrm = document.createElement('div');
    let bdfrm = document.createElement('div');

    encls.setAttribute('class', 'tabencl');
    tbfrm.setAttribute('class', 'tabfrme');
    bdfrm.setAttribute('class', 'bdyfrme');

    for (let i = 0; i < elems.length; i++) {
        let tabbtn = document.createElement('button');
        let tabbdy = document.createElement('div');
 
        tabbtn.addEventListener('click', function() {
            let partabs = this.parentElement.parentElement;
            let bdyelem = partabs.getElementsByClassName('tabbody');
            let tgtelem = document.getElementById(this.textContent);

            for (let j = 0; j < bdyelem.length; j++) {
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
    let gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    let text = await readFile(gapi);
    let json = JSON.parse(text);
    let tree = json.tree;
    let list = Array.from(tree)
                    .map(x => x.path)
                    .filter(x => x.match(filter));

    return list;
}

function rssParser(xml) {
    let parser = new DOMParser();
    let xmldoc = parser.parseFromString(xml, 'text/xml');
    let obj    = document.createElement('a');
    obj.href   = xmldoc.getElementsByTagName('link')[0].textContent;
    let src    = obj.host
                  .replace('www.', '')
                  .replace('.com', '');
    let itm = xmldoc.getElementsByTagName('item');
    let arr = Array.from(itm).map(function(x){
        return [ src
               , dateISO(x.getElementsByTagName('pubDate')[0].textContent)
               , decodeHtml(x.getElementsByTagName('title')[0].textContent)
               , x.getElementsByTagName('link')[0].textContent
               ];
    });
    
    return arr;
}

function decodeHtml(html) {
    let txt = document.createElement("textarea");
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
    let reldtg = Date.parse(str);
    let isodtg = new Date(reldtg).toISOString();

    return isodtg.split('.')[0] + 'Z';
}

function dateUTC(str) {
    let reldtg = Date.parse(str);
    let utcdtg = new Date(reldtg);

    return utcdtg.toUTCString();
}

// if hdrrow is true, function will treat first row in array as table header
// if haslink is true, will treat last element in row as link
function arrayToTable(arr, hdrrow, haslink) {
    let table = document.createElement('table');
    let golnk = 0;

    if (haslink) { golnk = 1; }

    for (let i = 0; i < arr.length; i++) {
        let tr = document.createElement('tr');

        for (let j = 0; j < arr[i].length - golnk; j++) {
            let elem = '';
            if (i == 0 && hdrrow) {
                elem = 'th';
            } else {
                elem = 'td';
            }

            let cell = document.createElement(elem);

            if (haslink) {
                let link = document.createElement('a');
                let node = document.createTextNode(arr[i][j]);
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
    let results = false;

    try {
        let urlchk = new URL(url);
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
        let procurl = corsarr[0];
        let header  = corsarr[1];
        
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
    let bin = convertDataURIToBinary(binary);
    let wht = { normalizeWhitespace : true };
    let doc = await pdfjsLib.getDocument(bin).promise;
    let txt = Array.from({length : doc.numPages}, async (x, i) => {
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
    let BASE64_MARKER = ';base64,';
    let base64Index   = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    let base64        = dataURI.substring(base64Index);
    let raw           = window.atob(base64);
    let rawLength     = raw.length;
    let array         = new Uint8Array(new ArrayBuffer(rawLength));
    
    return array.map((x, i) => raw.charCodeAt(i));
}

async function cmdMgr(input) {
    if (input != '') {
        clearInterval(window.appinterval);
        clear();

        let cmd = input.toLowerCase();

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
    let lst = await getCmdInfo();
    let hdr = ['Category', 'Command', 'Information'];
    lst.unshift(hdr);
    let tbl = arrayToTable(lst, true, false); 
    document.getElementById('outtext').appendChild(tbl);
}

async function read(path) {
    let txt = await readFile(path)
    print('\n');
    print(txt);
}

function clear() {
    let out = document.getElementById('outtext');
    if (out != null) { out.innerHTML = ''; }
}

function print(text) {
    if (Array.isArray(text)) {
        for (let i = 0; i < text.length; i++) {
            print(text[i]);
        }
    } else {
        let outtxt = document.getElementById("outtext");
        let newtxt = document.createElement("div");
        let rgxexp = /(http.?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        let rgxdom = new RegExp(rgxexp);
        let rgxget = text.match(rgxdom);
        
        if (rgxget != null) {
            for (let i = 0; i < rgxget.length; i++) {
                let oldurl = rgxget[i];
                let newurl = '<a href="'
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

function newWindow(content) {
    let winDiv = document.createElement('div');
    let winHdr = document.createElement('div');
    let hdrGrp = document.createElement('div');
    let winBdy = document.createElement('div');
    let rszBtn = document.createElement('div');
    let minBtn = document.createElement('div');
    let maxBtn = document.createElement('div');
    let clsBtn = document.createElement('div');

    winDiv.setAttribute('class', 'windowTemplate');
    winHdr.setAttribute('class', 'windowHeader');
    winBdy.setAttribute('class', 'windowBody');
    rszBtn.setAttribute('class', 'windowResize');
    hdrGrp.setAttribute('class', 'windowHdrGrp');
    minBtn.setAttribute('class', 'windowHdrBtn windowMinimize');
    maxBtn.setAttribute('class', 'windowHdrBtn windowMaximize');
    clsBtn.setAttribute('class', 'windowHdrBtn windowClose');

    winHdr.textContent = 'Label';
    rszBtn.textContent = '\u25E2';
    minBtn.textContent = '\u229F';
    maxBtn.textContent = '\u229E';
    clsBtn.textContent = '\u22A0';

    rszBtn.onmousedown = (e) => {
        e = e || window.event;
        e.preventDefault();
        let oldx = e.clientX;
        let oldy = e.clientY;
        let newx = 0;
        let newy = 0;

        document.onmouseup = () => {
            document.onmouseup   = null;
            document.onmousemove = null;
        }
        
        document.onmousemove = (d) => {
            d = d || window.event;
            d.preventDefault();
            newx = oldx - d.clientX;
            newy = oldy - d.clientY;
            oldx = d.clientX;
            oldy = d.clientY;
            d.path[2].style.height = (d.path[2].bottom - newy) + 'px';
            d.path[2].style.width  = (d.path[2].right  - newx) + 'px';
        };
    };

    winHdr.onmousedown = (e) => {
        e = e || window.event;
        e.preventDefault();
        let oldx = e.clientX;
        let oldy = e.clientY;
        let newx = 0;
        let newy = 0;

        document.onmouseup = () => {
            document.onmouseup   = null;
            document.onmousemove = null;
        }

        document.onmousemove = (d) => {
            d = d || window.event;
            d.preventDefault();
            newx = oldx - d.clientX;
            newy = oldy - d.clientY;
            oldx = d.clientX;
            oldy = d.clientY;
            winDiv.style.top  = (winDiv.offsetTop  - newy) + 'px';
            winDiv.style.left = (winDiv.offsetLeft - newx) + 'px';
        };
    };
    
    hdrGrp.appendChild(minBtn);
    hdrGrp.appendChild(maxBtn);
    hdrGrp.appendChild(clsBtn);
    winHdr.appendChild(hdrGrp);
    winBdy.appendChild(rszBtn);
    winDiv.appendChild(winHdr);
    winDiv.appendChild(winBdy);

    return winDiv;
}

function newCmdLine() {
}

async function newSelector() {
    let cmdSelect = document.createElement('select');
    let cmmndInfo = await getCmdInfo();

    cmdSelect.setAttribute('id', 'cmdSelect')

    for (let i = -1; i < cmmndInfo.length; i++) {
        let cmdOption = document.createElement('option');

        if (i == -1) {
            cmdOption.textContent = '';
            cmdOption.setAttribute(   'value',   '');
            cmdOption.setAttribute(  'hidden', true);
            cmdOption.setAttribute('selected', true);
        } else {
            let cmdGroup  = cmdSelect.querySelector('#' + cmmndInfo[i][0]);

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
    let list = await fileList(/apps\/.*\.js$/);
    let lout = await Promise.all(list.map(async x => getJsDesc(await readFile(x))));

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
    return txt.split('\n')
              .map(x => x.split(delim));
}

function scaleResize(id) {
    let elem = document.getElementById(id);
    let csty = getComputedStyle(elem);
    let ofst = 50;

    if (window.innerWidth < window.innerHeight) {
        elem.style.transform = 'scale(calc('
                             + ( window.innerWidth - ofst )
                             + ' / '
                             + csty.width.replace('px', '')
                             + '))';
    } else {
        elem.style.transform = 'scale(calc('
                             + ( window.innerHeight - ofst )
                             + ' / '
                             + csty.height.replace('px', '')
                             + '))';
    }

}

async function main() {
    let body = document.body;

    body.appendChild(await setConsole());
    body.appendChild(newWindow());

    home();
    scaleResize('console');
    window.addEventListener('resize', function() {
        scaleResize('console')
    }, true);
}

main()
