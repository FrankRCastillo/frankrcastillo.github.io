window.ipdata = null;
window.filelist = null;

async function main() {
    window.ipdata   = await getip();
    window.filelist = await fileList();

    let body = document.body;
    let pars = params();
    let cnsl = await newConsole();

    body.appendChild(cnsl);

    await cmdManager('home');
}

async function cmdManager(input) {
    if (input != '') {
        let promptmsg = consoleMessage() + ':~$ '

        print(promptmsg + input, true);

        let cmd = input.toLowerCase();

        document.getElementById('helpPanel').style.visibility = 'hidden';

        try {
            let cmdaddr = window.filelist.filter((x) => x.match('apps\/' +  cmd + '.js'));
            let app = await import('/' + cmdaddr[0]);
            eval('app.' + cmd + '()');
        } catch(e) {
            print(cmd + ': command not found...');
            console.log(e)
        }
    }
}

async function newConsole() {
    let cnsl = document.createElement('div');
    let bffr = consoleBuffer();
    let inpt = consolePrompt();
    let pane = await helpPanel();

    cnsl.setAttribute('id', 'console');

    cnsl.appendChild(bffr);
    cnsl.appendChild(inpt);
    cnsl.appendChild(pane);

    return cnsl;
}

async function helpPanel() {
    let help = await getCmdInfo();
    let tble = arrayToTable(help);
    let pane = document.createElement('div');

    pane.setAttribute('id', 'helpPanel');
    pane.appendChild(tble);

    pane.style.visibility = 'hidden';

    pane.addEventListener('mouseover', (e) => {
        document.getElementById('helpPanel').style.visibility = 'visible';
    });

    return pane;
}

function consoleMessage() {
    return 'visitor@' + ipdata.ip;
}

function consoleBuffer() {
    let bffr = document.createElement('div');

    bffr.setAttribute('id', 'consoleBuffer');

    return bffr;
}

function consolePrompt() {
    let inpt = document.createElement('input');
    let mesg = '\u25B6';

    inpt.setAttribute('id', 'consolePrompt');
    inpt.setAttribute('placeholder', mesg);
    inpt.addEventListener('keydown', (e) => {
        e = e || window.event;
        if (e.keyCode == 13) {
            cmdManager(e.target.value);
            e.target.value = '';
        }
    });

    inpt.addEventListener('click', (e) => {
        let vis = document.getElementById('helpPanel');

        if (vis.style.visibility == 'visible'){
            vis.style.visibility = 'hidden';
        } else {
            vis.style.visibility = 'visible';
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

        try {
            if (typeof(text) === 'string'){
                rgxget = text.match(rgxdom);

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
            }

        } finally {
            if (text.outerHTML) {
                newtxt.innerHTML = text.outerHTML;
            } else {
                newtxt.innerHTML = text.replace(/\n/g, '<br/>');
            }

            bffr.appendChild(newtxt);
        }
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

function arrayToTable(arr) {
    let table = document.createElement('table');

    arr.forEach((row) => {
        let tr = document.createElement('tr');
        row.forEach((cell) => {
            let td = document.createElement('td');
            td.innerText = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    return table;
}

async function getCmdInfo() {
    let list = window.filelist.filter((x) => x.match('apps/.*.js'));

    list.sort()

    let lout = await Promise.all(list.map(async x => {
        let info = x.replace('.js', '').split('/');

        return [info[1], getJsDesc(await read(x))];
    }));

    lout.unshift(['commands', 'description']);

    return lout;
}

function getJsDesc(str) {
    return str.split('\n')
             .filter(x => x.match('^// |.*'))[0]
             .replace('// ', '');
}

main()
