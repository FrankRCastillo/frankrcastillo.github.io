function SetScreen(r, c) {
    var arr = [];

    for (var i = 0; i <= r; i++) {
        arr[i] = new Array(c);
    }

    for (var i = 0; i <= r; i++) {
        for (var j = 0; j <= c; j++) {
            switch(i) {
                // Spaces
                case 0:
                case r:
                    arr[i][j] = '<div class="invert">\xa0</div>';
                    break;

                default:
                    arr[i][j] = '<div class="normal">\xa0</div>';
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
        if ( i == 0 ) {
            type = 'invert';
        } else {
            type = 'normal';
        }

        arr[i][0] = '<div class="' + type + '">' + (i + 1) + '</div>';
        arr[i][1] = '<div class="' + type + '">)</div>';

        for (var j = 0; j < sel[i].length; j++) {
            switch(sel[i][j]) {
                case ' ':
                    cell = '\xa0';
                    break;

                default:
                    cell = sel[i][j];
                    break;
            }

            arr[i][j + 3] = '<div class="' + type + '">' + cell + '</div>';
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

function ReadFile(path) {
    fetch(path)
        .then(response => response.text())
        .then((data) => {
            return data;
        });
}

function SetMain(screen) {
    var txt = ReadFile('main/1_Frank_Castillo/main.txt');
    window.alert(txt);
    var arr = txt.split('\n');
    var bgn = 18;

    for (var i = 0; i < screen.Length; i++) {
        for (var j = bgn; j < screen[i].Length; j++) {
            for (var k = 0; k < arr.Length; k++) {
                for (var m = 0; m < arr[k].Length; m++) {
                    val = arr[k][m];

                    if (val == '\n') {
                        j++;
                    } else {
                        screen[i][j] = val;
                    }
                }
            }
        }
    }

    return screen; 
}

function main() {
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

    var screen     = SetScreen(r, c);
    screen         = SetMenu(screen, sel);
    screen         = SetMain(screen);
    body.innerHTML = WriteConsole(screen, h, w);
}

main()
