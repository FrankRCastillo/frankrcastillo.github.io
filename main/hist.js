// |govt|hist|World history infographic (powered by CIA World Factbook)

export async function hist() {
    var txt = await ReadFile('https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html');
    var iso = await ReadFile('/main/hist/iso.csv');
    var doc = new DOMParser().parseFromString(txt, 'text/html');
    var lst = doc.getElementById('fieldListing');
    var bdy = lst.getElementsByTagName('tbody');
    var tag = bdy[0].getElementsByTagName('tr');
    var arr = [];

    for (var i = 0; i < tag.length; i++) {
        var id   = tag[i].id;
        var name = tag[i].getElementsByClassName('country')[0].innerText.trim();
        var hist = tag[i].querySelector('#field-background').innerText.trim();
        var harr = parseHistory(hist);
        arr.push([id, name, harr]);
    }

    historychart(arr);

    CmdReady();
}

function parseHistory(str) {
    var rgxexp = [ "([A-Za-z](\\.)){2,} [A-Z]"                                         // acronyms at the end of a sentence; delete all but last period
                 , "([A-Za-z](\\.)){2,} [^A-Z]"                                        // acronyms within a sentece, but not the end; delete all periods
                 , "[A-Z]{1}[a-z]{1,3}(\\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}" // ranks and titles; excludes the title of King
                 ]
    
    var tmp = str;

    for (var i = 0; i < rgxexp.length; i++) {
        var rgxdom = new RegExp(rgxexp[i]);
        var rgxget = tmp.match(rgxdom);
        
        try {
            for (var j = 0; j < rgxget.length; j++) {
                var rgxmod = '';

                // first regex requires that all but last periods be removed
                if (i == 0) {
                    var rgxarr = rgxget[j].split('.');
                    var penult = rgxarr.slice(0, rgxarr.length - 2).join('');
                    var ultima = rgxarr[rgxarr.length - 1];
                    rgxmod = penult + '.' + ultima;

                } else {
                    rgxmod = rgxget[j].replace('.', '');
                }

                tmp = tmp.replace(rgxget[j], rgxmod);
            }
        } catch(err) {
            console.log(err.message);
        }
    }

    var arr = tmp.split('. ');

    var rtn = arr.map(function(elem, i, orig) {
        var yrgx = elem.match(/([1](?<=1)[0-9]|20)[0-9]{2}/)
        var info = Math.max.apply(null, yrgx);

        if (Number.isFinite(info) == false && i > 0) {
            yrgx = orig[i - 1].match(/([1](?<=1)[0-9]|20)[0-9]{2}/)
            info = Math.max.apply(null, yrgx);
        }
        
        return [info, elem + '.'];
    });

    return rtn;
}

function historychart(arr) {
    var out = document.getElementById('outtext');
    var frm = document.createElement('div');
    var lst = document.createElement('div');
    var sel = document.createElement('select');
    var btn = [ [     '+',  'mapzoomin']
              , [     '-', 'mapzoomout']
              , [   '1:1', 'maprestore']
              , ['\u21E6', 'mappanleft']
              , ['\u21E7',   'mappanup']
              , ['\u21E8','mappanright']
              , ['\u21E9', 'mappandown']
              ];

    frm.setAttribute('id', 'mapframe' );
    lst.setAttribute('id', 'maptools' );
    sel.setAttribute('id', 'mapselect');

    for (var i = 0; i < btn.length; i++) {
        var ico = document.createElement('button');
        ico.textContent = btn[i][0];
        ico.setAttribute('class', 'zoombtn');
        ico.setAttribute('id', btn[i][1]);
        ico.addEventListener('click', function() {
            mapmove(this.textContent);
        });
        frm.appendChild(ico);
    }

    for (var i = -1; i < arr.length; i++) {
        var opt = document.createElement('option');

        if (i == -1) {
            opt.setAttribute('disabled', true);
            opt.setAttribute('selected', true);
            opt.textContent = 'Select Country...';
        } else {
            opt.setAttribute('value', arr[i][0]);
            opt.textContent = arr[i][1];
        }
        sel.appendChild(opt);
    }

    lst.appendChild(sel);
    out.appendChild(lst);
    out.appendChild(frm);
    
    var map = new Datamap({ element         : document.getElementById('mapframe')
                          , scope           : 'world'
                          , projection      : 'mercator'
                          , responsive      : false
                          , fills           : { defaultFill          : '#000000' }
                          , geographyConfig : { highlightOnHover     : true
                                              , popupOnHover         : true
                                              , borderWidth          : 1
                                              , borderColor          : '#303030'
                                              , highlightBorderColor : '#ffa500'
                                              , highlightFillColor   : '#000000'
                                              , popupTemplate        : function(geography, data) {
                                                                           return '<div class=hoverinfo><strong>'
                                                                                + geography.properties.name
                                                                                + '</strong></div>';
                                                                       }
                                              }
    });

    map.labels({ labelColor : '#ffa500'
               , fontSize   : 12
               , fontFamily : 'MS PGothic'
    });
}

function mapmove(action) {
    var map = document.getElementsByClassName('datamap')[0];
    var scl = map.currentScale;
    switch(action) {
        case      '+': map.currentScale += 0.5                         ; break;
        case      '-': if (scl - 0.5 >= 1) { map.currentScale -= 0.5; }; break;
        case    '1:1': map.currentScale = 1                            ; break;
        case '\u21E6': map.currentTranslate.x += -scl * 100            ; break; // left
        case '\u21E7': map.currentTranslate.y +=  scl * 100            ; break; // up
        case '\u21E8': map.currentTranslate.x +=  scl * 100            ; break; // right
        case '\u21E9': map.currentTranslate.y += -scl * 100            ; break; // down
    }
}
