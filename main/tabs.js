// |test|tabs|Testing page for tabs functionality

export async function tabs() {
    var o = document.getElementById('outtext');

    var l = [ { 'History'    : [ 'Map'
                               , 'Gantt'
                               ]
              }
            ];
    o.appendChild(NewTabLayout(l));
    
    console.log("pause");
}


