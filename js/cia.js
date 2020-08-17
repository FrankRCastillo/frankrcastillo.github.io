// Support functions for querying CIA World Factbook

export async function getData() {
    let rtn = [];
    let cia = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html';
    let txt = await readFile(cia);                                                      // read CIA world factbook history page for all countries
    let doc = new DOMParser().parseFromString(txt, 'text/html');                        // parse CIA world factbook text into HTML
    let lst = doc.getElementById('fieldListing');                                       // get element in factbook that contains the history listings
    let iso = tableToArray(await readFile('/js/iso.tsv'), '\t');                            // read csv file with iso2 to iso3 table and convert to array
    let bdy = lst.getElementsByTagName('tbody');                                        // get tag that contains the table body
    let tag = bdy[0].getElementsByTagName('tr');                                        // get rows from table body; each row = one country listing

    for (let i = 0; i < tag.length; i++) {                                              // iterate through country listing array
        let iso2 = tag[i].id;                                                           // capture iso2 country code
        let iso3 = '';
        try{
            let isom = iso[iso.map(x => x[2]).indexOf(iso2)]
            let name = tag[i].getElementsByClassName('country')[0].innerText.trim();    // get country name, trim whitespaces at the edges
            let hist = tag[i].querySelector('#field-background').innerText.trim();      // get country history listing, trim whitespaces
            rtn.push([iso2, isom[1], isom[3], isom[4], name, hist, isom[5]]);                    // add elements into array
        } catch(err) {
            console.log(err.message);
        }
    }

    let countries = rtn.map(x => x[4]);

    rtn = rtn.map(x => [ x[0], x[1], x[2], x[3], x[4], parseHistory(x[5], x[4], countries), x[6] ]);
    return rtn;
}

function parseHistory(val, country, countries) {
    let rgxexp = [ '([A-Za-z](\\.)){2,} [A-Z]'                                          // acronyms at the end of a sentence; delete all but last period
                 , '([A-Za-z](\\.)){2,} [^A-Z]'                                         // acronyms within a sentece, but not the end; delete all periods
                 , '[A-Z]{1}[a-z]{1,3}(\\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}'  // ranks and titles; excludes the title of King
                 , '(' + countries.filter(e => e != country).join('|') + ')'            // find all countries except for the current country
                 , '([1](?<=1)[0-9]|20)[0-9]{2}'                                        // find year
                 ]
    
    for (let i = 0; i < rgxexp.length; i++)  {
        let rgxobj = new RegExp(rgxexp[i], 'g');
        let rgxold = val.match(rgxobj);

        if(rgxold != null) {
            switch(i) {
                case 0: let rgxarr = val.match(rgxobj);
                        val = val.replace( rgxobj
                                         , rgxarr.slice(0, rgxarr.length - 2)
                                                 .join('')
                                                 + rgxarr[rgxarr.length - 1]
                                         );
                        break;
                case 1:
                case 2: let rgxnew = rgxold.map(x => x.replace('.', ''));
                        for (let j = 0; j < rgxnew.length; j++) {
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

