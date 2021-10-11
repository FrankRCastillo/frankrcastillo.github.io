// Visitor information

export function vstr() {
    let worldmap = new Array(3);

    for (let i = 0; i < 19; i++) {
        worldmap[i] = new Array(3);
        for (let j = 0; j < 81; j++) {
            worldmap[i][j] = "&nbsp";
        }
    }

    let maparea = [[ 2,18],[ 2,19],[ 2,20],[ 2,21],[ 2,22],[ 2,23],[ 2,24],[ 2,25],[ 2,28],[ 3,29]
                  ,[ 2,30],[ 2,31],[ 2,32],[ 2,33],[ 2,34],[ 3,12],[ 3,13],[ 3,14],[ 3,15],[ 3,16]
                  ,[ 3,17],[ 3,18],[ 3,19],[ 3,20],[ 3,21],[ 3,22],[ 3,23],[ 3,27],[ 3,28],[ 3,29]
                  ,[ 3,30],[ 3,31],[ 3,32],[ 3,33],[ 3,41],[ 3,42],[ 3,43],[ 3,44],[ 3,49],[ 3,50]
                  ,[ 3,53],[ 3,54],[ 3,55],[ 3,56],[ 3,57],[ 3,58],[ 3,59],[ 3,60],[ 3,61],[ 3,62]
                  ,[ 3,65],[ 3,68],[ 3,69],[ 3,70],[ 4, 3],[ 4, 4],[ 4, 5],[ 4, 6],[ 4, 8],[ 4, 9]
                  ,[ 4,10],[ 4,11],[ 4,12],[ 4,13],[ 4,14],[ 4,15],[ 4,16],[ 4,17],[ 4,18],[ 4,22]
                  ,[ 4,23],[ 4,24],[ 4,28],[ 4,29],[ 4,40],[ 4,41],[ 4,42],[ 4,43],[ 4,44],[ 4,45]
                  ,[ 4,46],[ 4,47],[ 4,48],[ 4,49],[ 4,50],[ 4,51],[ 4,52],[ 4,53],[ 4,54],[ 4,55]
                  ,[ 4,56],[ 4,57],[ 4,58],[ 4,59],[ 4,60],[ 4,61],[ 4,62],[ 4,63],[ 4,64],[ 4,65]
                  ,[ 4,66],[ 4,67],[ 4,68],[ 4,69],[ 4,71],[ 4,72],[ 4,73],[ 4,74],[ 5,10],[ 5,11]
                  ,[ 5,12],[ 5,13],[ 5,14],[ 5,15],[ 5,16],[ 5,17],[ 5,18],[ 5,19],[ 5,21],[ 5,22]
                  ,[ 5,23],[ 5,24],[ 5,25],[ 5,26],[ 5,37],[ 5,38],[ 5,40],[ 5,41],[ 5,42],[ 5,43]
                  ,[ 5,44],[ 5,45],[ 5,46],[ 5,47],[ 5,48],[ 5,49],[ 5,50],[ 5,51],[ 5,52],[ 5,53]
                  ,[ 5,54],[ 5,55],[ 5,56],[ 5,57],[ 5,58],[ 5,59],[ 5,60],[ 5,61],[ 5,62],[ 5,63]
                  ,[ 5,64],[ 5,65],[ 5,66],[ 5,67],[ 5,68],[ 5,69],[ 6,12],[ 6,13],[ 6,14],[ 6,15]
                  ,[ 6,16],[ 6,17],[ 6,18],[ 6,19],[ 6,20],[ 6,21],[ 6,22],[ 6,23],[ 6,24],[ 6,38]
                  ,[ 6,39],[ 6,40],[ 6,41],[ 6,42],[ 6,43],[ 6,44],[ 6,45],[ 6,46],[ 6,47],[ 6,48]
                  ,[ 6,49],[ 6,50],[ 6,51],[ 6,52],[ 6,53],[ 6,54],[ 6,55],[ 6,56],[ 6,57],[ 6,58]
                  ,[ 6,59],[ 6,60],[ 6,61],[ 6,62],[ 6,63],[ 6,64],[ 6,65],[ 6,66],[ 7,13],[ 7,14]
                  ,[ 7,15],[ 7,16],[ 7,17],[ 7,18],[ 7,19],[ 7,20],[ 7,21],[ 7,37],[ 7,38],[ 7,40]
                  ,[ 7,41],[ 7,44],[ 7,46],[ 7,47],[ 7,48],[ 7,49],[ 7,50],[ 7,51],[ 7,52],[ 7,53]
                  ,[ 7,54],[ 7,55],[ 7,56],[ 7,57],[ 7,58],[ 7,59],[ 7,60],[ 7,61],[ 7,62],[ 7,63]
                  ,[ 7,64],[ 8,16],[ 8,17],[ 8,36],[ 8,37],[ 8,38],[ 8,39],[ 8,40],[ 8,41],[ 8,42]
                  ,[ 8,43],[ 8,44],[ 8,45],[ 8,46],[ 8,47],[ 8,48],[ 8,49],[ 8,50],[ 8,51],[ 8,52]
                  ,[ 8,54],[ 8,55],[ 8,56],[ 8,57],[ 8,58],[ 8,59],[ 8,60],[ 8,61],[ 8,62],[ 8,63]
                  ,[ 8,64],[ 9,19],[ 9,35],[ 9,36],[ 9,37],[ 9,38],[ 9,39],[ 9,40],[ 9,41],[ 9,42]
                  ,[ 9,43],[ 9,44],[ 9,45],[ 9,46],[ 9,47],[ 9,48],[ 9,49],[ 9,55],[ 9,60],[ 9,61]
                  ,[ 9,62],[ 9,65],[10,22],[10,23],[10,24],[10,25],[10,36],[10,37],[10,38],[10,39]
                  ,[10,40],[10,41],[10,42],[10,43],[10,44],[10,45],[10,46],[10,47],[10,48],[10,49]
                  ,[10,60],[11,21],[11,22],[11,23],[11,24],[11,25],[11,26],[11,27],[11,28],[11,41]
                  ,[11,42],[11,43],[11,44],[11,45],[11,46],[11,47],[11,61],[11,63],[11,65],[12,22]
                  ,[12,23],[12,24],[12,25],[12,26],[12,27],[12,28],[12,29],[12,30],[12,42],[12,43]
                  ,[12,44],[12,45],[12,46],[12,47],[13,24],[13,25],[13,26],[13,27],[13,28],[13,29]
                  ,[13,42],[13,43],[13,44],[13,45],[13,46],[13,65],[13,66],[13,67],[13,68],[13,69]
                  ,[13,70],[14,23],[14,24],[14,25],[14,26],[14,27],[14,43],[14,44],[14,45],[14,64]
                  ,[14,65],[14,68],[14,69],[14,70],[14,71],[15,23],[15,24],[16,22],[16,23],[17,23]
                  ];

    for (let i = 0; i < 370; i++) {
        worldmap[maparea[i][0]][maparea[i][1]] = ".";
    }

    let data     = window.ipdata;
    let visitDiv = document.createElement('div'); 
    let coordx   = parseInt((-0.1 * data.latitude) + 11);
    let coordy   = parseInt((0.222 * data.longitude) + 39);

    worldmap[coordx][coordy] = "<b class='xmark'>X</b>";

    for (let i = 0; i < worldmap.length; i++) {
        let ipInfo = "";

        for (let j = 0; j < worldmap[i].length; j++) {
            visitDiv.innerHTML += worldmap[i][j];
        }

        switch (true) {
            case i == 1: ipInfo = "IP Address: "   + data.ip                                           ; break;
            case i == 2: ipInfo = "City: "         + data.city                                         ; break;
            case i == 3: ipInfo = "State/Region: " + data.region_name  + " (" + data.region_code  + ")"; break;
            case i == 4: ipInfo = "Zip Code: "     + data.zip_code                                     ; break;
            case i == 5: ipInfo = "Country: "      + data.country_name + " (" + data.country_code + ")"; break;
            case i == 6: ipInfo = "Lat/Long: "     + data.latitude + ", " + data.longitude             ; break;
            case i == 7: ipInfo = "Time Zone: "    + data.time_zone                                    ; break;
            case i == 8: ipInfo = "Display: "      + screen.width + "x" + screen.height                ; break;
            case i == 9: ipInfo = "Platform: "     + navigator.platform                                ; break;
        }

        visitDiv.innerHTML += ipInfo + "<br/>";
    }

    print(visitDiv);
}
