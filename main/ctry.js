// |wrld|ctry|Country information (powered by CIA World Factbook)
window.ctryData = [];

export async function ctry() {
    window.ctryData = await GenerateData();
    
    var l = [ 'WorldMap'
            , 'GanttChart'
            , 'Leaders'
            , 'Government'
            ];

    var t = NewTabLayout(l);
    var h = NewCtryPage(window.ctryData);

    document.getElementById( 'outtext').appendChild(t);
    document.getElementById('WorldMap').appendChild(h);
    CreateMap();
    CmdReady();                                                                         // update page status as ready
}

function CreateMap() {
    var map = L.map('mapframe');

    // create the tile layer with correct attribution
    var osmUrl    ='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm       = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 17, attribution: osmAttrib});		

    map.setView(new L.LatLng(25, 0), 1);
    map.addLayer(osm);
    L.control.scale().addTo(map);

    map.on ('click', function(e) {
        codegrid.CodeGrid()
                .getCode ( e.latlng.lat
                         , e.latlng.lng
                         , function (err, code) {
                               var msg;
                               if (err) {
                                   msg = err;
                               } else {
                                   msg = "You clicked on: " + code;
                               }
                               popup.setLatLng (e.latlng)
                                    .setContent (msg)
                                    .openOn(map);
                           });
    });

    map.on ('mousemove', L.Util.limitExecByInterval(function(e) {
        codegrid.CodeGrid()
                .getCode ( e.latlng.lat
                         , e.latlng.lng
                         , function (err, code) {
                               var msg;
                               if (err) {
                                   msg = err;
                               } else {
                                   msg = "You are on: " + code;
                               }
                               console.log(msg);
                           }
                         );
        },5));
}

async function GenerateData() {
    var rtn = [];
    var cia = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html';
    var txt = await ReadFile(cia);                                                      // read CIA world factbook history page for all countries
    var iso = csv2arr(await ReadFile('/main/ctry/iso.csv'));                            // read csv file with iso2 to iso3 table and convert to array
    var doc = new DOMParser().parseFromString(txt, 'text/html');                        // parse CIA world factbook text into HTML
    var lst = doc.getElementById('fieldListing');                                       // get element in factbook that contains the history listings
    var bdy = lst.getElementsByTagName('tbody');                                        // get tag that contains the table body
    var tag = bdy[0].getElementsByTagName('tr');                                        // get rows from table body; each row = one country listing

    for (var i = 0; i < tag.length; i++) {                                              // iterate through country listing array
        var iso2 = tag[i].id;                                                           // capture iso2 country code
        var iso3 = '';
        try{
            iso3 = iso[iso.map(x => x[1]).indexOf(iso2)][2]                             // convert iso2 to iso3 using csv loaded earlier
            var name = tag[i].getElementsByClassName('country')[0].innerText.trim();    // get country name, trim whitespaces at the edges
            var hist = tag[i].querySelector('#field-background').innerText.trim();      // get country history listing, trim whitespaces
            rtn.push([iso2, iso3, name, hist]);                             // add elements into array
        } catch(err) {
            console.log(err.message);
        }
    }

    var countries = rtn.map(x => x[2]);

    rtn = rtn.map(x => [ x[0]
                       , x[1]
                       , x[2]
                       , x[3].replace( new RegExp('(' + countries.filter(e => e != x[2]).join('|') + ')', 'g')
                                     , '<strong class=ctryTag>$&</strong>')
                             .replace( /([1](?<=1)[0-9]|20)[0-9]{2}/g
                                     , '<strong class=yearTag>$&</strong>')
                       ]);

    return rtn;
}

function ParseHistory(str) {
    var rgxexp = [ "([A-Za-z](\\.)){2,} [A-Z]"                                          // acronyms at the end of a sentence; delete all but last period
                 , "([A-Za-z](\\.)){2,} [^A-Z]"                                         // acronyms within a sentece, but not the end; delete all periods
                 , "[A-Z]{1}[a-z]{1,3}(\\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}"  // ranks and titles; excludes the title of King
                 ]
    
    var tmp = str;

    for (var i = 0; i < rgxexp.length; i++) {                                           // iterate through regular expressions
        var rgxdom = new RegExp(rgxexp[i]);
        var rgxget = tmp.match(rgxdom);
        
        try {
            for (var j = 0; j < rgxget.length; j++) {                                   // iterate through regular expression matches
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

    return tmp.split('. ');
}

function NewCtryPage(arr) {
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
        var dta = document.getElementById('mapdata');
        var sel = document.getElementById('mapselect');
        var iso = sel.options[sel.selectedIndex].value;
        if (iso != '') {
            dta.innerHTML = countryInfo(iso);
        }
    });

    for (var i = -1; i < arr.length; i++) {
        var opt = document.createElement('option');

        if (i == -1) {
            opt.setAttribute('disabled', true);
            opt.setAttribute('selected', true);
            opt.textContent = 'Select Country...';
        } else {
            opt.setAttribute('value', arr[i][0]);
            opt.textContent = arr[i][2];
        }
        sel.appendChild(opt);
    }

    lst.appendChild(sel);
    lst.appendChild(btn);
    out.appendChild(lst);
    out.appendChild(dta);
    out.appendChild(frm);

    return out;
}

function countryInfo(iso) {
    var idx  = (iso.length == 2 ? 0 : 1);                               // if iso length is two, set index to retrieve iso2 property. otherwise, for iso3
    var data = window.ctryData.filter(elem => elem[idx] == iso)[0];     // get iso property from window.ctryData global variable
    var name = data[2];                                                 // get country name
    var isos = '(' + data[0] + '/' + data[1] + ')';                     // concatenate iso2 and iso3 values

    return '<strong>'
         + name + ' '
         + isos + '<br/>'
         + '</strong>'
         + data[3];
}
