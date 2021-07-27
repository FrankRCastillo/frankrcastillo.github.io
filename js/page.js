window.ipdata = null;
window.filelist = null;

async function main() {
    let body = document.body;
    let pars = params();

    window.ipdata   = await getip();
    window.filelist = await fileList();

    body.appendChild(newConsole());

    await cmdManager('home');
}

async function cmdManager(input) {
    if (input != '') {
        let promptmsg = consoleMessage() + ':~$ '

        print(promptmsg + input, true);

        let cmd = input.toLowerCase();

        switch (cmd) {
            case 'home'  : await home(); break;
            case 'help'  : await help(); break;
            case 'clear' : clear()     ; break;
            default:
                try {
                    let cmdaddr = window.filelist.filter((x) => x.match('apps\/' +  cmd + '.js'));
                    let app = await import('/' + cmdaddr[0]);

                    eval('app.' + cmd + '()');
                } catch {
                    print(cmd + ': command not found...');
                }
        }
    }
}

async function home() {
    let str = await read('/apps/home/home.txt');

    print(str);
}

async function help() {
    let lst = await getCmdInfo();
    let hdr = ['Category', 'Command', 'Information'];
    let tbl = arrayToTable(lst, hdr);

    print(tbl);
}

function clear() {
    let body = document.getElementById('consoleBuffer');
    if (body != null) { body.innerHTML = ''; }
}

function newConsole() {
    let cnsl = document.createElement('div');
    let bffr = consoleBuffer();
    let inpt = consolePrompt();

    cnsl.setAttribute('id', 'console');
    cnsl.appendChild(bffr);
    cnsl.appendChild(inpt);

    return cnsl;
}

function consoleMessage() {
    return '\u25B6visitor@' + ipdata.ip;
}

function consoleBuffer() {
    let bffr = document.createElement('div');

    bffr.setAttribute('id', 'consoleBuffer');

    return bffr;
}

function consolePrompt() {
    let inpt = document.createElement('input');
    let mesg = consoleMessage() + ', type command here...';

    inpt.setAttribute('id', 'consolePrompt');
    inpt.setAttribute('placeholder', mesg);
    inpt.addEventListener('keydown', (e) => {
        e = e || window.event;
        if (e.keyCode == 13) {
            cmdManager(e.target.value);
            e.target.value = null;
        }
    });

    return inpt;
}


function params() {
    let url = location.href;
    let par = url.split('?');

    if (par.length > 1) {
        return par[1].split('&').map(x => x.split('='));
    } else {
        return null;
    }
}

async function getip() {
    let ipread = await read("https://freegeoip.app/json/");

    return JSON.parse(ipread);
}

async function read(url) {
    return await fetch(url, { headers : {} })
                 .then(response => response.text())
                 .catch(response => "");
}

function print(text, isCmd) {
    let bffr = document.getElementById('consoleBuffer');

    if (Array.isArray(text)) {
        for (let i = 0; i < text.length; i++) {
            print(text[i]);
        }
    } else {
        let newtxt = document.createElement("div");

        if (isCmd) {
            newtxt.setAttribute('class', 'consoleCommand');
        }

        let rgxexp = /(http.?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        let rgxdom = new RegExp(rgxexp);
        let rgxget = null;

        if (text.hasOwnProperty('match')) {
            rgxget = text.match(rgxdom);
        }

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

        if (text.outerHTML) {
            newtxt.innerHTML = text.outerHTML;
        } else {
            newtxt.innerHTML = await text.replace(/\n/g, '<br/>');
        }

        bffr.appendChild(newtxt);
    }
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

async function fileList() {
    let gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    let text = await read(gapi);
    let json = JSON.parse(text);
    let tree = json.tree;
    let list = Array.from(tree)
                    .map(x => x.path)

    return list;
}

function trunc(str, len) {
    if (str.length <= len) {
        return str;
    } else {
        return str.slice(0, len) + '...';
    }
}

// if hdrrow is true, function will treat first row in array as table header
// if haslink is true, will treat last element in row as link
function arrayToTable(arr, hdr) {
    let table = document.createElement('table');
    let hdrin = false;

    arr.forEach((row) => {
        let tr   = null;
        let cell = null;

        if (hdr != null && hdrin == false) {
            let tr = newTableRow(hdr, 'th');
            table.appendChild(tr);
            tr    = null;
            hdrin = true;
        }

        tr = newTableRow(row, 'td');
        table.appendChild(tr);
    });

    return table;
}

function newTableRow(arr, tag){
    let tr = document.createElement('tr');

    arr.forEach((val) => {
        let cell = document.createElement(tag);
        cell.innerText = val;
        tr.appendChild(cell);
    });

    return tr;
}

async function getCmdInfo() {
    let list = window.filelist.filter((x) => x.match('apps/.*.js'));
    let lout = await Promise.all(list.map(async x => getJsDesc(await read(x))));

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

main()
