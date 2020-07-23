// |wrld|ctry|Country information (powered by CIA World Factbook)
window.ctryData = [];

export async function ctry() {
    window.ctryData = await GetData();
    
    window.ctryData.sort((a, b) => a[3] - b[3]);

    var l = [ 'WorldMap'
            , 'GanttChart'
            , 'Leaders'
            , 'Government'
            ];

    var t = NewTabLayout(l);
    var h = NewCtryPage();
    var g = NewGanttPage();

    document.getElementById(   'outtext').appendChild(t);
    document.getElementById(  'WorldMap').appendChild(h);
    document.getElementById('GanttChart').appendChild(g;
    CreateMap();
    CmdReady();                                                                         // update page status as ready
}

async function GetData() {
    var rtn = [];
    var cia = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html';
    var txt = await ReadFile(cia);                                                      // read CIA world factbook history page for all countries
    var doc = new DOMParser().parseFromString(txt, 'text/html');                        // parse CIA world factbook text into HTML
    var lst = doc.getElementById('fieldListing');                                       // get element in factbook that contains the history listings
    var iso = csv2arr(await ReadFile('/main/ctry/iso.csv'));                            // read csv file with iso2 to iso3 table and convert to array
    var bdy = lst.getElementsByTagName('tbody');                                        // get tag that contains the table body
    var tag = bdy[0].getElementsByTagName('tr');                                        // get rows from table body; each row = one country listing

    for (var i = 0; i < tag.length; i++) {                                              // iterate through country listing array
        var iso2 = tag[i].id;                                                           // capture iso2 country code
        var iso3 = '';
        try{
            var isom = iso[iso.map(x => x[2]).indexOf(iso2)]
            var name = tag[i].getElementsByClassName('country')[0].innerText.trim();    // get country name, trim whitespaces at the edges
            var hist = tag[i].querySelector('#field-background').innerText.trim();      // get country history listing, trim whitespaces
            rtn.push([iso2, isom[1], isom[3], isom[4], name, hist]);                    // add elements into array
        } catch(err) {
            console.log(err.message);
        }
    }

    var countries = rtn.map(x => x[4]);

    rtn = rtn.map(x => [ x[0], x[1], x[2], x[3], x[4], ParseHistory(x[5], x[4], countries) ]);
    return rtn;
}

function CreateMap() {
    var map       = L.map('mapframe');
    var osmUrl    ='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib ='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm       = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 17, attribution: osmAttrib});		

    map.setView(new L.LatLng(25, 0), 2);
    map.addLayer(osm);
    L.control.scale().addTo(map);

    map.on ('click', function(e) {
        codegrid.CodeGrid()
                .getCode ( e.latlng.lat
                         , e.latlng.lng
                         , function (err, code) {
                             try {
                                 var ncode = window.ctryData[window.ctryData.map(x => x[2]).indexOf(code.toUpperCase())][0]

                                 document.getElementById('mapselect')
                                         .querySelector('option[value=' + ncode + ']')
                                         .selected = true;

                                 document.getElementById('mapdata')
                                         .innerHTML = countryInfo(ncode);

                             } catch (err) {
                                 console.log(err.message);
                             }
                           });
    });
}

function ParseHistory(val, country, countries) {
    var rgxexp = [ '([A-Za-z](\\.)){2,} [A-Z]'                                          // acronyms at the end of a sentence; delete all but last period
                 , '([A-Za-z](\\.)){2,} [^A-Z]'                                         // acronyms within a sentece, but not the end; delete all periods
                 , '[A-Z]{1}[a-z]{1,3}(\\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}'  // ranks and titles; excludes the title of King
                 , '(' + countries.filter(e => e != country).join('|') + ')'            // find all countries except for the current country
                 , '([1](?<=1)[0-9]|20)[0-9]{2}'                                        // find year
                 ]
    
    for (var i = 0; i < rgxexp.length; i++)  {
        var rgxobj = new RegExp(rgxexp[i], 'g');
        var rgxold = val.match(rgxobj);

        if(rgxold != null) {
            switch(i) {
                case 0: var rgxarr = val.match(rgxobj);
                        val = val.replace( rgxobj
                                         , rgxarr.slice(0, rgxarr.length - 2)
                                                 .join('')
                                                 + rgxarr[rgxarr.length - 1]
                                         );
                        break;
                case 1:
                case 2: var rgxnew = rgxold.map(x => x.replace('.', ''));
                        for (var j = 0; j < rgxnew.length; j++) {
                            val = val.replace(rgxold[i], rgxnew[i]);
                        }
                        break;
                case 3: val = val.replace(rgxobj, '<strong class=ctryTag>$&</strong>');
                        break;
                case 4: val = val.replace(rgxobj, '<strong class=yearTag>$&</strong>');
                        break;
            }
        }
    };

    return val.split('. ')
              .map(x => '<span class=evntTag>'
                      + (x.slice(-1) == '.' ? x : x + '. ')
                      + '</span>')
              .join('');
}

function NewCtryPage() {
    var out = document.createElement('div');
    var frm = document.createElement('div');
    var lst = document.createElement('div');
    var btn = document.createElement('button');
    var fcs = document.createElement('button');
    var dta = document.createElement('div');
    var sel = document.createElement('select');

    frm.setAttribute('id', 'mapframe' );
    lst.setAttribute('id', 'maptools' );
    dta.setAttribute('id', 'mapdata'  );
    sel.setAttribute('id', 'mapselect');
    btn.setAttribute('class', 'mapbtn');
    btn.textContent = 'Find';

    btn.addEventListener('click', function() {
        var sel = document.getElementById('mapselect');
        var iso = sel.options[sel.selectedIndex].value;
        if (iso != '') {
            dta.innerHTML = countryInfo(iso);
        }
    });

    for (var i = -1; i < window.ctryData.length; i++) {
        var opt = document.createElement('option');

        if (i == -1) {
            opt.setAttribute('disabled', true);
            opt.setAttribute('selected', true);
            opt.textContent = 'Select Country...';
            sel.appendChild(opt);
        } else {
            var grp = sel.querySelector('#' + window.ctryData[i][3]);
            if (grp == null) {
                grp = document.createElement('optgroup');
                grp.setAttribute('label', window.ctryData[i][3]);
                grp.setAttribute('id'   , window.ctryData[i][3]);
            }

            opt.setAttribute('value', window.ctryData[i][0]);
            opt.textContent = window.ctryData[i][4];
            grp.appendChild(opt);
            sel.appendChild(grp);
        }
    }

    lst.appendChild(sel);
    lst.appendChild(btn);
    out.appendChild(lst);
    out.appendChild(dta);
    out.appendChild(frm);

    return out;
}

function countryInfo(iso) {
    var idx  = (iso.length == 2 ? 2 : 1);                                               // if iso length is two, set index to retrieve iso2 property. otherwise, for iso3
    var data = window.ctryData[window.ctryData.map(elem => elem[idx]).indexOf(iso)]     // get iso property from window.ctryData global variable
    var name = data[4];                                                                 // get country name
    var isos = '(' + data[0] + '/' + data[1] + ')';                                     // concatenate iso2 and iso3 values

    return '<strong>'
         + name + ' '
         + isos + '<br/>'
         + '</strong>'
         + data[5];
}

function NewGanttPage() {
    var page = document.createElement('div');
    var tble = document.createElement('table');
    var year = new Date().getFullYear();
    var yhdr = new Array(year).fill(1).map((x, i) => i + 1);

    yhdr.sort((a,b) => b - a);
    yhdr.unshift('');

    tble.setAttribute('id', 'GanttTable');
    

    for (var i = 0; i < window.ctryData.length; i++) {
        var tr = document.createElement('tr');

        for (var j = 0; j < yhdr.length; j++) {
            if (yhdr[0] != window.ctryData[i][3]) {
                yhdr[0] = window.ctryData[i][3];
                var th = document.createElement('th');
                th.textContent = yhdr[j];
                tr.appendChild(th);
            } else {
                var td = document.createElement('td');
                if (j = 0) {
                    td.textContent = window.ctryData[i][4];
                } else {
                    td.textContent = '';
                }
                tr.appendChild(td);
            }
        }

        tble.appendChild(tr);
    }

    page.appendChild(tble);

    return page;
}

