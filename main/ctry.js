// |wrld|ctry|Country information (powered by CIA World Factbook)
window.ctryData = [];

export async function ctry() {
    window.ctryData = await GetData();
    
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
    var iso = { "AD": "AN", "AG": "AC", "AI": "AV", "AS": "AQ", "AT": "AU", "AU": "AS", "AX": "FI", "AZ": "AJ"
              , "BA": "BK", "BD": "BG", "BF": "UV", "BG": "BU", "BH": "BA", "BI": "BY", "BJ": "BN", "BL": "TB"
              , "BM": "BD", "BN": "BX", "BO": "BL", "BQ": "NL", "BS": "BF", "BW": "BC", "BY": "BO", "BZ": "BH"
              , "CD": "CG", "CF": "CT", "CG": "CF", "CH": "SZ", "CI": "IV", "CK": "CW", "CL": "CI", "CN": "CH"
              , "CR": "CS", "CW": "UC", "CZ": "EZ", "DE": "GM", "DK": "DA", "DM": "DO", "DO": "DR", "DZ": "AG"
              , "EE": "EN", "EH": "WI", "ES": "SP", "GA": "GB", "GB": "UK", "GD": "GJ", "GE": "GG", "GF": "FR"
              , "GG": "GK", "GM": "GA", "GN": "GV", "GP": "FR", "GQ": "EK", "GS": "SX", "GU": "GQ", "GW": "PU"
              , "HN": "HO", "HT": "HA", "IE": "EI", "IL": "IS", "IQ": "IZ", "IS": "IC", "JP": "JA", "KH": "CB"
              , "KI": "KR", "KM": "CN", "KN": "SC", "KP": "KN", "KR": "KS", "KW": "KU", "KY": "CJ", "LB": "LE"
              , "LC": "ST", "LI": "LS", "LK": "CE", "LR": "LI", "LS": "LT", "LT": "LH", "LV": "LG", "MA": "MO"
              , "MC": "MN", "ME": "MJ", "MF": "RN", "MG": "MA", "MH": "RM", "MM": "BM", "MN": "MG", "MP": "CQ"
              , "MQ": "FR", "MS": "MH", "MU": "MP", "MW": "MI", "NA": "WA", "NE": "NG", "NG": "NI", "NI": "NU"
              , "NU": "NE", "OM": "MU", "PA": "PM", "PF": "FP", "PG": "PP", "PH": "RP", "PM": "SB", "PN": "UK"
              , "PR": "RQ", "PS": "GZ", "PT": "PO", "PW": "PS", "PY": "PA", "RE": "FR", "RS": "RI", "RU": "RS"
              , "SB": "BP", "SC": "SE", "SD": "SU", "SE": "SW", "SG": "SN", "SJ": "SV", "SK": "LO", "SN": "SG"
              , "SR": "NS", "SS": "OD", "ST": "TP", "SV": "ES", "SX": "NN", "SZ": "WZ", "TC": "TK", "TD": "CD"
              , "TF": "FR", "TG": "TO", "TJ": "TI", "TK": "TL", "TL": "TT", "TM": "TX", "TN": "TS", "TO": "TN"
              , "TR": "TU", "TT": "TD", "UA": "UP", "UM": "US", "VA": "VT", "VG": "VI", "VN": "VM", "VU": "NH"
              , "YE": "YM", "YT": "FR", "ZA": "SF", "ZM": "ZA", "ZW": "ZI"
              }

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
                                 var ncode = iso[code.toUpperCase()];
                                 
                                 ncode = (ncode === undefined ? code.toUpperCase() : ncode);

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

async function GetData() {
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
            rtn.push([iso2, iso3, name, hist]);                                         // add elements into array
        } catch(err) {
            console.log(err.message);
        }
    }

    var countries = rtn.map(x => x[2]);

    rtn = rtn.map(x => [ x[0], x[1], x[2], ParseHistory(x[3], x[2], countries) ]);

    return rtn;
}

function ParseHistory(str, country, countries) {
    var rgxexp = [ '([A-Za-z](\\.)){2,} [A-Z]'                                          // acronyms at the end of a sentence; delete all but last period
                 , '([A-Za-z](\\.)){2,} [^A-Z]'                                         // acronyms within a sentece, but not the end; delete all periods
                 , '[A-Z]{1}[a-z]{1,3}(\\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}'  // ranks and titles; excludes the title of King
                 , '(' + countries.filter(e => e != country).join('|') + ')'            // find all countries except for the current country
                 , '([1](?<=1)[0-9]|20)[0-9]{2}'                                        // find year
                 ]
    
    var rgxpat = rgxexp.map(x => new RegExp(x, 'g'));
    
    for (var i = 0; i < rgxexp.length; i++)  {
        var rgxobj = new RegExp(rgxexp[i], 'g');
        var rgxstr = str.match(rgxobj);

        if (rgxstr != null) {
            switch(i) {
                case 0: var rgxarr = rgxstr.split('.');
                        str = str.replace(rgxstr, rgxarr.slice(0, rgxarr.length - 2).join('')
                                                + rgxarr[rgxarr.length - 1]
                                         );
                        break;
                case 1:
                case 2: str = str.replace('.', '');
                        break;
                case 3: str = str.replace(rgxstr, '<strong class=ctryTag></strong>');
                        break;
                case 4: str =  str.replace(rgxstr, '<strong class=yearTag></strong>');
                        break;
            }
        }
    };

    return tmp.split('. ')
              .map(x => '<span class=evntTag>' + (x.slice(-1) == '.' ? x : x + '. ') + '</span>')
              .join('. ');
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

function CreateGanttChart(iso) {
}

