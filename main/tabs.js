// |test|tabs|Testing page for tabs functionality

export async function tabs() {
    var o = document.getElementById('outtext');

    var l = [ { 'History'    : [ 'Map'
                               , 'Gantt'
                               ]
              }
            , { 'Government' : [ 'Leaders'
                               , 'Structure'
                               ]
              }
            , { 'Economy'    : [ 'General'
                               , 'Industry'
                               , { 'Trade' : [ 'Import'
                                             , 'Export'
                                             ]
                                 }
                               ]
              }
            , { 'Sources'    : 'Sources' }
        ];
    o.appendChild(NewTabLayout(l));
    
    console.log("pause");
}


