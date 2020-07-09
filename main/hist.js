// |govt|hist|World history infographic (powered by CIA World Factbook)

export async function hist() {
    var url = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html'
    var txt = await ReadFile(url);
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
    frm.setAttribute('id', 'mapframe');
    frm.style.overflow = 'hidden';
    out.appendChild(frm);

    var map = new Datamap({ element         : document.getElementById('mapframe')
                          , scope           : 'world'
                          , fills           : { defaultFill      : '#13131c' }
                          , geographyConfig : { highlightOnHover : false
                                              , popupOnHover     : false
                                              , borderColor      : '#ffffff'
                                              , borderWidth      : 1
                                              }
    });

    console.log('pause');
}
