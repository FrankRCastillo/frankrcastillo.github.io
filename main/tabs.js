// |test|tabs|Testing page for tabs functionality

export async function tabs() {
    var toprow = [ 'Map', 'Gantt' ];
    var maprow = [ 'M', 'A', 'P' ];
    var gntrow = [ 'G', 'A', 'N', 'T', 'T' ];

    document.getElementById('outtext').appendChild(NewTabLayout(toprow));
    document.getElementById(    'Map').appendChild(NewTabLayout(maprow));
    document.getElementById(  'Gantt').appendChild(NewTabLayout(gntrow));
}


