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
    parser    = new DOMParser();
    xmldoc    = parser.parseFromString(xml, 'text/xml');
    var items = xmldoc.getElementsByTagName('item');
    var table = document.createElement('table');
    var hdrs  = document.createElement('tr');
    table.setAttribute('id', 'newstable');
    hdrs.appendChild(createTextNode('Title'));
    hdrs.appendChild(createTextNode('Author'));
    hdrs.appendChild(createTextNode('Date'));
    
    for (var i = 0; i < items.length; i++) {
        var trow = document.createElement('tr');
        var auth = document.createElement('td');
        var desc = document.createElement('td');
        var date = document.createElement('td');
        var link = document.createElement('a');
        var lurl = items[i].children[0].textContent;        // title
        var ltxt = document.createTextNode(lurl);

        link.href      = items[i].children[1].textContent;  // link
        auth.innerText = items[i].children[3].textContent;  // author
        date.innerText = items[i].children[4].textContent;  // publication date
        link.appendChild(ltxt);
        desc.appendChild(link);
        trow.appendChild(desc);
        trow.appendChild(auth);
        trow.appendChild(date);
        table.appendChild(trow);        
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
            } catch {
                print(cmd + ': command not found');
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
