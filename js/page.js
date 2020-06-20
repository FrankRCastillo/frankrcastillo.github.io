function SetMenu(arr, sel) {
    var offset = 0; 
    for (var i = 0; i < sel.length; i++) {
        arr[0][i + offset] = i + 1;
        arr[0][i + offset + 1] = ')';

        for (var j = 0; j < sel[i].length; j++) {
            switch(sel[i][j]) {
                case ' ':
                    arr[0][i + j + offset + 3] = '\xa0';
                    break;

                default:
                    arr[0][i + j + offset + 3] = sel[i][j];
                    break;
            }
        }
        offset += 8;
    }

    return arr;
}

async function SetMain(screen) {
    var col = 2;  // starting column
    var row = 2;  // starting row
    var k   = 0;  // text string count
    var txt = await ReadFile('https://frankrcastillo.github.io/main/1_Frank_Castillo/main.txt');

    txt = WrapText(txt, screen[0].length - (2 * col));

    for (var i = row; i < screen.length - row; i++) {
        if (k < txt.length) {
            for (var j = col; j < screen[i].length - col; j++) {
                if (txt[k] == '\x0a') {
                    j = col - 1;
                    k++;
                    break;
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

function WriteConsole(arr, h, w) {
    var rtn = '';

    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            switch (i) {
                case 0:
                case arr.length - 1:
                    rtn += '<div style="height:' + h + ';width:' + w + '" class="invert">' + arr[i][j] + '</div>';
                    break;

                default:
                    rtn += '<div  style="height:' + h + ';width:' + w + '" class="normal">' + arr[i][j] + '</div>';
                    break;
            }
        }
        rtn += '<br/>';
    }

    return rtn;
}

async function ReadFile(url) {
    return (await fetch(url)).text();
}

function WrapText(text, limit) {
    var rtn = '';
    var cnt = 0;

    for (var i = 0; i < text.length; i++) {
        switch (true) {
            case (text[i] == '\n' || (text[i] == ' ' && cnt > 0 && text.indexOf(' ', i + 1) - cnt > limit)):
                rtn += '\n';
                cnt = i;
                break;

            default:
                rtn += text[i];
                break;
        }
    }
    return rtn;
}

async function main() {
    window.addEventListener('resize', main);
    var h    = ((window.innerHeight - 10) / 20);
    var w    = ((window.innerWidth  - 10) /  8);
    var r    = Math.floor(h);
    var c    = Math.floor(w);
    var body = document.body;
    var sel  = ['Home'
               ,'Apps'
               ,'News'
               ,'Social'
               ]

    var screen = [];

    for (var i = 0; i <= r; i++) {
        screen[i] = new Array(c).fill('\xa0');
    }

    screen         = SetMenu(screen, sel);
    screen         = await SetMain(screen);
    //screen         = SetScreen(screen);
    body.innerHTML = WriteConsole(screen, h, w);
}

main()
