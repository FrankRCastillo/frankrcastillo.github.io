// |wrld|cmap|World map with countries' history (source: CIA WFB)

export async function cmap(consoleName) {
    let year = new Date().getFullYear();
    let cia = await import('/js/cia.js');

    if (window.ctryData == null) {
        window.ctryData = await cia.getData();
        
        window.ctryData.sort((a, b) => a[3].localeCompare(b[3]));
    }

    let out = document.getElementById('outtext_' + consoleName)
    let wmp = document.createElement('WorldMap')
    wmp.appendChild(newCtryPage(consoleName));
    out.appendChild(wmp);
    createMap(consoleName);
}

function createMap(consoleName) {
    let map       = L.map('mapframe_' + consoleName);
    let osmUrl    ='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let osmAttrib ='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    let osm       = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 17, attribution: osmAttrib});		

    map.setView(new L.LatLng(25, 0), 2);
    map.addLayer(osm);
    L.control.scale().addTo(map);

    map.on ('click', function(e) {
        codegrid.CodeGrid()
                .getCode ( e.latlng.lat
                         , e.latlng.lng
                         , function (err, code) {
                             try {
                                 let ncode = window.ctryData[ window.ctryData
                                                                    .map(x => x[2])
                                                                    .indexOf(code.toUpperCase())
                                                            ][0]

                                 document.getElementById('mapselect_' + consoleName)
                                         .querySelector('option[value=' + ncode + ']')
                                         .selected = true;

                                 document.getElementById('mapdata_' + consoleName)
                                         .innerHTML = countryInfo(ncode);
                             } catch (err) {
                                 console.log(err.message);
                             }
                           });
    });
}

function newCtryPage(consoleName) {
    let out = document.createElement('div');
    let frm = document.createElement('div');
    let lst = document.createElement('div');
    let fcs = document.createElement('button');
    let dta = document.createElement('div');
    let sel = document.createElement('select');

    frm.setAttribute('id', 'mapframe_'  + consoleName);
    lst.setAttribute('id', 'maptools_'  + consoleName);
    dta.setAttribute('id', 'mapdata_'   + consoleName);
    sel.setAttribute('id', 'mapselect_' + consoleName);
    
    frm.setAttribute('class', 'mapframe' );
    lst.setAttribute('class', 'maptools' );
    dta.setAttribute('class', 'mapdata'  );
    sel.setAttribute('class', 'mapselect');
    
    sel.addEventListener('change', function() {
        let iso = this.options[this.selectedIndex].value;
        if (iso != '') {
            dta.innerHTML = countryInfo(iso);
        }
    });

    for (let i = -1; i < window.ctryData.length; i++) {
        let opt = document.createElement('option');

        if (i == -1) {
            opt.setAttribute('disabled', true);
            opt.setAttribute('selected', true);
            opt.textContent = 'Select Country...';
            sel.appendChild(opt);
        } else {
            let grp = sel.querySelector('#' + window.ctryData[i][3]);

            if (grp == null) {
                grp = document.createElement('optgroup');
                grp.setAttribute('label', window.ctryData[i][3]);
                grp.setAttribute('id', window.ctryData[i][3]);
            }

            opt.setAttribute('value', window.ctryData[i][0]);
            opt.textContent = window.ctryData[i][4];
            grp.appendChild(opt);
            sel.appendChild(grp);
        }
    }

    lst.appendChild(sel);
    out.appendChild(lst);
    out.appendChild(dta);
    out.appendChild(frm);

    return out;
}

function countryInfo(iso) {
    let idx  = (iso.length == 2 ? 0 : 1);                                               // if iso length is two, set index to retrieve iso2 property. otherwise, for iso3
    let data = window.ctryData[window.ctryData.map(elem => elem[idx]).indexOf(iso)]     // get iso property from window.ctryData global letiable
    let name = data[4];                                                                 // get country name
    let isos = '(' + data[0] + '/' + data[1] + ')';                                     // concatenate iso2 and iso3 values

    return '<strong>'
         + '<span class=ctryTag>'
         + name 
         + '</span>'
         + ' ' + isos + '<br/>'
         + '</strong>'
         + data[5];
}

