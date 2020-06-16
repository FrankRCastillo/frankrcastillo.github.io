function SetScreen(arr) {

    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            switch(i) {
                // Spaces
                case 0:
                case arr.length - 1:
                    arr[i][j] = '<div class="invert">' + arr[i][j] + '</div>';
                    break;

                default:
                    arr[i][j] = '<div class="normal">' + arr[i][j] + '</div>';
                    break;
            }
        }
    }

    return arr;
}

function SetMenu(arr, sel) {
    var cell = '';
    var type = '';

    for (var i = 0; i < sel.length; i++) {
        arr[i][0] = i + 1;
        arr[i][1] = ')';

        for (var j = 0; j < sel[i].length; j++) {
            switch(sel[i][j]) {
                case ' ':
                    arr[i][j + 3] = '\xa0';
                    break;

                default:
                    arr[i][j + 3] = sel[i][j];
                    break;
            }
        }
    }

    return arr;
}

function WriteConsole(arr, h, w) {
    var rtn = '';

    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            rtn += arr[i][j];
        }
        rtn += '<br/>';
    }

    rtn = rtn.replace(/<div /g, '<div style="height:' + h + ';width:' + w + '"');
    return rtn;
}

async function ReadFile(url) {
    return (await fetch(url)).text();
}

async function SetMain(screen) {
    var txt = await ReadFile('https://frankrcastillo.github.io/main/1_Frank_Castillo/main.txt');
    var bgn = 20;
    var k   = 0;

    txt.replace('\r', '\n');

    for (var i = 1; i < screen.length; i++) {
        for (var j = bgn; j < screen[i].length; j++) {
            if (k < txt.length) {
                if (txt[k] == '\n') {
                    i++;
                    j = bgn;
                } else 
                if (txt[k] == ' ') {
                    // do nothing
                } else {
                    screen[i][j] = txt[k];
                }
                k++;
            }
        }
    }
    return screen; 
}

async function main() {
    window.addEventListener('resize', main);
    var h    = ((window.innerHeight - 10) / 20);
    var w    = ((window.innerWidth  - 10) /  8);
    var r    = Math.floor(h);
    var c    = Math.floor(w);
    var body = document.body;
    var sel  = ['Frank Castillo'
               ,'Projects'
               ,'News'
               ,'Social Media'
               ]

    var screen = [];

    for (var i = 0; i <= r; i++) {
        screen[i] = new Array(c).fill('\xa0');
    }

    screen         = SetMenu(screen, sel);
    screen         = await SetMain(screen);
    screen         = SetScreen(screen);
    body.innerHTML = WriteConsole(screen, h, w);
}

main()
