async function main() {
    let body = document.body;
    let pars = params();
    let list = await fileList("apps/home.*");

    await home();
    
    print(list);
}

async function home() {
    let str = await read('/apps/home/home.txt');
    await print(str);
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

async function help() {
    let lst = await getCmdInfo();
    let hdr = ['Category', 'Command', 'Information'];
    lst.unshift(hdr);
    let tbl = arrayToTable(lst, true, false); 

    await print(tbl);
}

function clear() {
    let body = document.body;
    if (body != null) { body.innerHTML = ''; }
}

async function read(url) {
    return await fetch(url, { headers : {} })
                 .then(response => response.text())
                 .catch(response => "");
}

async function print(text) {
    let body = document.body;

    if (Array.isArray(text)) {
        for (let i = 0; i < text.length; i++) {
            await print(text[i]);
        }
    } else {
        let newtxt = document.createElement("div");
        let rgxexp = /(http.?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        let rgxdom = new RegExp(rgxexp);
        let rgxget = await text.match(rgxdom);
        
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
        
        newtxt.innerHTML = text.replace(/\n/g, '<br/>');
        body.appendChild(newtxt);
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

async function fileList(filter) {
    let gapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    let text = await read(gapi);
    let json = JSON.parse(text);
    let tree = json.tree;
    let list = Array.from(tree)
                    .map(x => x.path)
                    .filter(x => x.match(filter));

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

async function cmdManager(input) {
    if (input != '') {
        clearInterval(window.appinterval);
        clear();

        let cmd = input.toLowerCase();

        switch (cmd) {
            case 'home' : home(); break;
                B
            case 'help' : help(); break;
            default:

                B
            let app = await import('/apps/' + cmd + '.js');
            eval('app.' + cmd + '")');
        }
    }
}

async function getCmdInfo() {
    let list = await fileList(/apps\/.*\.js$/);
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
