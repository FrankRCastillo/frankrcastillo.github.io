// |test|tabs|Testing page for tabs functionality

export async function tabs() {
    var toprow = [ 'Map', 'Gantt' ];
    var maprow = [ 'M', 'A', 'P' ];
    var gntrow = [ 'G', 'N', 'T' ];

    document.getElementById('outtext').appendChild(NewTabLayout(toprow));
    document.getElementById(    'Map').appendChild(NewTabLayout(maprow));
    document.getElementById(  'Gantt').appendChild(NewTabLayout(gntrow));
    document.getElementById('M').textContent = 'M';
    document.getElementById('A').textContent = 'A';
    document.getElementById('P').textContent = 'P';
    document.getElementById('G').textContent = 'G';
    document.getElementById('N').textContent = 'N';
    document.getElementById('T').textContent = 'T';
}


