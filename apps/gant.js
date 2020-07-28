// |wrld|gant|Gantt chart of countries' history

export async function gant() {
    var year = new Date().getFullYear();
    var cia  = await import('/js/cia.js');

    if (window.ctryData.length == 0) {
        window.ctryData = await cia.GetData();
        window.ctryData.sort((a, b) => a[3].localeCompare(b[3]));
    }

    var out = document.getElementById('outtext')
    var gnt = document.createElement('div');
    gnt.setAttribute('id', 'GanttChart');
    gnt.appendChild(NewGanttToolbar());
    gnt.appendChild(NewGanttPage(year, 1));
    out.appendChild(gnt);
}

function NewGanttToolbar() {
    var dte = new Date().getFullYear();             // present year
    var bar = document.createElement('div');        // toolbar div
    var yin = document.createElement('input');      // ending year input
    var sel = document.createElement('select');     // time interval selector
    var prs = document.createElement('button');     // move interval to the present
    var nxt = document.createElement('button');     // move interval later
    var prv = document.createElement('button');     // move interval earlier
    var per = [ [   '1 year',  1 ]                  // periods of time
              , [  '5 years',  5 ]
              , [ '10 years', 10 ]
              , [ '25 years', 25 ]
              , [ '50 years', 50 ]
              , ['100 years',100 ]
              ]   

    for (var i = 0; i < per.length; i++) {
        var opt = document.createElement('option');

        opt.setAttribute('value', per[i][1]);
        opt.textContent = per[i][0];
        sel.appendChild(opt);
    }

    yin.setAttribute('readonly', true);
    yin.setAttribute('id', 'GanttEndYear');

    sel.setAttribute('id', 'GanttInterval');
    sel.addEventListener('change', function() {
        var eyr = document.getElementById('GanttEndYear');
        var sel = document.getElementById('GanttInterval');
        var nsl = sel.options[sel.selectedIndex];
        var ysl = parseInt(nsl.value);
        var gnt = document.getElementById('GanttChart');
        var tbl = document.getElementById('GanttTable');

        nsl.setAttribute('selected', true);

        tbl.remove();
        gnt.appendChild(NewGanttPage(parseInt(eyr.value), ysl));
    });

    prs.textContent = 'Pres';
    prs.addEventListener('click', function() {
        GanttTimeShift(0);
    });

    nxt.textContent = 'Next';
    nxt.addEventListener('click', function() {
        GanttTimeShift(1);
    });

    prv.textContent = 'Prev';
    prv.addEventListener('click', function() {
        GanttTimeShift(-1)
    });

    bar.setAttribute('id', 'GanttToolbar');
    bar.appendChild(prs);
    bar.appendChild(nxt);
    bar.appendChild(prv);
    bar.appendChild(yin);
    bar.appendChild(sel);

    return bar;
}

function GanttTimeShift(dir) {
    var year   = new Date().getFullYear();
    var sel    = document.getElementById('GanttInterval');
    var eyr    = document.getElementById('GanttEndYear');
    var scale  = parseInt(sel.options[sel.selectedIndex].value);
    var nscale = (20 * dir * scale);
    var oendyr = parseInt(eyr.value);
    var nendyr = (dir == 0 ? year : oendyr + (dir * scale));
    
    if (year >= nendyr && nendyr + nscale > 0) {
        var gnt = document.getElementById('GanttChart');
        var tbl = document.getElementById('GanttTable');

        eyr.value = nendyr + nscale;

        tbl.remove();
        gnt.appendChild(NewGanttPage(eyr.value, scale));
    }
}

function NewGanttPage(year, scale) {
    var tble = document.createElement('table');
    var tbar = document.getElementById('GanttEndYear');
    var cont = '';

    tbar.value = year;

    tble.setAttribute('id', 'GanttTable');

    for (var i = 0; i < window.ctryData.length; i++) {
        var tr = document.createElement('tr');

        if (cont != window.ctryData[i][3]) {
            cont  = window.ctryData[i][3];
            for (var j = year; j >= year - (20 * scale); j -= scale) {
                var th  = document.createElement('th');
                var div = document.createElement('div');

                if (j == year){
                    var contTd = document.createElement('th');
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
            for (var j = year; j >= year - (20 * scale) && j > 0; j -= scale) {
                var td = document.createElement('td');
                var histobj = document.createElement('span');

                histobj.innerHTML = window.ctryData[i][5];

                var histyrs = histobj.getElementsByClassName('yearTag');
                var histtmp = Array.from(histyrs).map(x => parseInt(x.innerText));
                
                histtmp.sort((a, b) => b - a);

                var histarr = Array.from(new Set(histtmp));
                var histrng = histarr.filter(x => j >= x && x > j - scale);

                if (year == j) {
                    var ctryTd   = document.createElement('td');
                    var ctryFlag = document.createElement('img');
                    var ctryName = document.createElement('span');

                    ctryFlag.setAttribute('class', 'ctryFlag');
                    ctryFlag.setAttribute('src', window.ctryData[i][6]);
                    ctryName.textContent = window.ctryData[i][4];

                    ctryTd.style.textIndent = '30px';
                    ctryTd.appendChild(ctryFlag);
                    ctryTd.appendChild(ctryName);
                    ctryTd.setAttribute('class', 'ctryLabel');
                    tr.appendChild(ctryTd);
                }

                if (histrng.length > 0){
                    td.style.textAlign = 'center';

                    var ico = document.createElement('div');

                    ico.innerText = '\u26AB';
                    ico.setAttribute(     'id',       'ctryEvent');
                    ico.setAttribute(  'class',         'tooltip');
                    ico.setAttribute('ctryidx',                 i);
                    ico.setAttribute('yearidx', histrng.join(','));
                    ico.setAttribute(  'scale',             scale);
                    ico.addEventListener('mouseover', function() {
                        var ctryidx = parseInt(this.getAttribute('ctryidx'));
                        var yearidx = this.getAttribute('yearidx').split(',').map(x => parseInt(x));
                        var scale   = parseInt(this.getAttribute('scale'));
                        var hist    = document.createElement('span');
                        
                        hist.innerHTML = window.ctryData[ctryidx][5];

                        var evntTags = hist.getElementsByClassName('evntTag');
                        
                        var histEvnt = Array.from(evntTags).map(function(x) {
                            var yearTag = x.getElementsByClassName('yearTag');
                            var yearArr = Array.from(yearTag).map(x => parseInt(x.innerText));
                            var yearMrg = yearArr.filter(x => yearidx.includes(x));

                            if (yearMrg.length > 0) {
                                return x.innerHTML;
                            }
                        });
                        
                        var span = document.createElement('span');
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

