// |test|tabs|Testing page for tabs functionality

export async function tabs() {
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
    var page = NewTabLayout(l);
}


