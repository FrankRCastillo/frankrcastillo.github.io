// |wrld|gant|Gantt chart of countries' history (source: CIA WFB)

export async function gant(consoleName) {
    let year = new Date().getFullYear();
    let cia  = await import('/js/cia.js');

    if (window.ctryData == null) {
        window.ctryData = await cia.getData();
        window.ctryData.sort((a, b) => a[3].localeCompare(b[3]));
    }

    let out = document.getElementById('outtext_' + consoleName)
    let gnt = document.createElement('div');
    gnt.setAttribute('id', 'GanttChart_' + consoleName);
    gnt.setAttribute('class', 'GanttChart');
    out.appendChild(gnt);
    gnt.appendChild(newGanttToolbar(consoleName));
    gnt.appendChild(newGanttPage(year, 1));
}

function newGanttToolbar(consoleName) {
    let dte = new Date().getFullYear();             // present year
    let bar = document.createElement('div');        // toolbar div
    let yin = document.createElement('input');      // ending year input
    let sel = document.createElement('select');     // time interval selector
    let prs = document.createElement('button');     // move interval to the present
    let nxt = document.createElement('button');     // move interval later
    let prv = document.createElement('button');     // move interval earlier
    let per = [ [   '1 year',  1 ]                  // periods of time
              , [  '5 years',  5 ]
              , [ '10 years', 10 ]
              , [ '25 years', 25 ]
              , [ '50 years', 50 ]
              , ['100 years',100 ]
              ]   

    for (let i = 0; i < per.length; i++) {
        let opt = document.createElement('option');

        opt.setAttribute('value', per[i][1]);
        opt.textContent = per[i][0];
        sel.appendChild(opt);
    }

    yin.setAttribute('readonly', true);
    yin.setAttribute('id', 'GanttEndYear_' + consoleName);
    sel.setAttribute('id', 'GanttInterval_' + consoleName);
    yin.setAttribute('class', 'GanttEndYear');
    sel.setAttribute('class', 'GanttInterval');
    sel.addEventListener('change', function() {
        let eyr = document.getElementById('GanttEndYear_' + consoleName);
        let sel = document.getElementById('GanttInterval_' + consoleName);
        let gnt = document.getElementById('GanttChart_' + consoleName);
        let tbl = document.getElementById('GanttTable_' + consoleName);
        let nsl = sel.options[sel.selectedIndex];
        let ysl = parseInt(nsl.value);

        nsl.setAttribute('selected', true);
        tbl.remove();
        gnt.appendChild(newGanttPage(parseInt(eyr.value), ysl));
    });

    prs.textContent = 'Pres';
    prs.addEventListener('click', function() {
        ganttTimeShift(0);
    });

    nxt.textContent = 'Next';
    nxt.addEventListener('click', function() {
        ganttTimeShift(1);
    });

    prv.textContent = 'Prev';
    prv.addEventListener('click', function() {
        ganttTimeShift(-1)
    });

    bar.setAttribute('id', 'GanttToolbar');
    bar.appendChild(prs);
    bar.appendChild(nxt);
    bar.appendChild(prv);
    bar.appendChild(yin);
    bar.appendChild(sel);

    return bar;
}

function ganttTimeShift(dir, consoleName) {
    let year   = new Date().getFullYear();
    let sel    = document.getElementById('GanttInterval_' + consoleName);
    let eyr    = document.getElementById('GanttEndYear_' + consoleName);
    let scale  = parseInt(sel.options[sel.selectedIndex].value);
    let nscale = (20 * dir * scale);
    let oendyr = parseInt(eyr.value);
    let nendyr = (dir == 0 ? year : oendyr + (dir * scale));
    
    if (year >= nendyr && nendyr + nscale > 0) {
        let gnt = document.getElementById('GanttChart');
        let tbl = document.getElementById('GanttTable');

        eyr.value = nendyr + nscale;

        tbl.remove();
        gnt.appendChild(newGanttPage(eyr.value, scale));
    }
}

function newGanttPage(year, scale) {
    let tble = document.createElement('table');
    let tbar = document.getElementById('GanttEndYear');
    let cont = '';

    tbar.value = year;

    tble.setAttribute('id', 'GanttTable');

    for (let i = 0; i < window.ctryData.length; i++) {
        let tr = document.createElement('tr');

        if (cont != window.ctryData[i][3]) {
            cont  = window.ctryData[i][3];
            for (let j = year; j >= year - (20 * scale); j -= scale) {
                let th  = document.createElement('th');
                let div = document.createElement('div');

                if (j == year){
                    let contTd = document.createElement('th');
                    contTd.style.textAlign = 'left';
                    contTd.textContent = cont;
                    tr.appendChild(contTd);
                }
                
                div.textContent = j;
                th.setAttribute('class', 'GanttHeader');
                th.appendChild(div);
                tr.appendChild(th);
            }
        } else {
            for (let j = year; j >= year - (20 * scale) && j > 0; j -= scale) {
                let td = document.createElement('td');
                let histobj = document.createElement('span');

                histobj.innerHTML = window.ctryData[i][5];

                let histyrs = histobj.getElementsByClassName('yearTag');
                let histtmp = Array.from(histyrs).map(x => parseInt(x.innerText));
                
                histtmp.sort((a, b) => b - a);

                let histarr = Array.from(new Set(histtmp));
                let histrng = histarr.filter(x => j >= x && x > j - scale);

                if (year == j) {
                    let ctryTd   = document.createElement('td');
                    let ctryFlag = document.createElement('img');
                    let ctryName = document.createElement('span');

                    ctryFlag.setAttribute('class', 'ctryFlag');
                    ctryFlag.setAttribute('src', window.ctryData[i][6]);
                    ctryName.textContent = window.ctryData[i][1];

                    ctryTd.style.textIndent = '30px';
                    ctryTd.appendChild(ctryFlag);
                    ctryTd.appendChild(ctryName);
                    ctryTd.setAttribute('class', 'ctryLabel');
                    tr.appendChild(ctryTd);
                }

                if (histrng.length > 0){
                    td.style.textAlign = 'center';

                    let ico = document.createElement('div');

                    ico.innerText = '\u26AB';
                    ico.setAttribute(     'id',       'ctryEvent');
                    ico.setAttribute(  'class',         'tooltip');
                    ico.setAttribute('ctryidx',                 i);
                    ico.setAttribute('yearidx', histrng.join(','));
                    ico.setAttribute(  'scale',             scale);
                    ico.addEventListener('mouseover', function() {
                        let ctryidx = parseInt(this.getAttribute('ctryidx'));
                        let yearidx = this.getAttribute('yearidx').split(',').map(x => parseInt(x));
                        let scale   = parseInt(this.getAttribute('scale'));
                        let hist    = document.createElement('span');
                        
                        hist.innerHTML = window.ctryData[ctryidx][5];

                        let evntTags = hist.getElementsByClassName('evntTag');
                        
                        let histEvnt = Array.from(evntTags).map(function(x) {
                            let yearTag = x.getElementsByClassName('yearTag');
                            let yearArr = Array.from(yearTag).map(x => parseInt(x.innerText));
                            let yearMrg = yearArr.filter(x => yearidx.includes(x));

                            if (yearMrg.length > 0) {
                                return x.innerHTML;
                            }
                        });
                        
                        let span = document.createElement('span');
                        span.setAttribute('class', 'tooltiptext');
                        span.innerHTML = histEvnt.join('');
                        this.appendChild(span);
                    });

                    td.appendChild(ico);
                }

                tr.appendChild(td);
            }
        }
        tble.appendChild(tr);
    }

    return tble;
}

