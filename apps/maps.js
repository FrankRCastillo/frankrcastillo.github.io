// |apps|maps|Map utility

export async function maps() {
    //let col = Math.round((screen.width - 120) / 24);
    //let txt = await bmpToAscii(col);

    let shp = 'apps/maps/10m_cultural/ne_10m_admin_0_countries.shp';
    let shx = 'apps/maps/10m_cultural/ne_10m_admin_0_countries.shx';
    let xar = await readShx(shx);
    let par = await readShp(shp, xar);

    print('pause');
}

async function getDataView(url) {
    let resp = await fetch(url);
    let blob = await resp.blob();
    let buff = await new Response(blob).arrayBuffer();
    let dtvw = new DataView(buff);

    return dtvw;
}

async function readShx(url) {
    let dv  = await getDataView(url);
    let arr = [];

    for (let i = 100; i < dv.byteLength - 4; i += 8) {
        arr.push([ dv.getInt32(i, false)
                 , dv.getInt32(i + 4, false)
                 ]);
    }
    return arr;
}

function point(dv, idx) {
    return { xValue = dv.getFloat64(idx +  4, true)
           , yValue = dv.getFloat64(idx + 12, true)
           }
}

function box(dv, idx) {
    return [ dv.getFloat64(idx +  4, true)
           , dv.getFloat64(idx + 12, true)
           , dv.getFloat64(idx + 20, true)
           , dv.getFloat64(idx + 28, true)
           ]
}

async function readShp(shp, xar) {
    let dv  = await getDataView(shp);
    let rcrd = {};
    let arr = [];

    // Main File Header:
    let main = { fileCde : dv.getInt32(   0, false)                                      // Byte 0       File Code      9994           Integer    Big
               , unused0 : dv.getInt32(   4, false)                                      // Byte 4       Unused         0              Integer    Big
               , unused1 : dv.getInt32(   8, false)                                      // Byte 8       Unused         0              Integer    Big
               , unused2 : dv.getInt32(  12, false)                                      // Byte 12      Unused         0              Integer    Big
               , unused3 : dv.getInt32(  16, false)                                      // Byte 16      Unused         0              Integer    Big
               , unused4 : dv.getInt32(  20, false)                                      // Byte 20      Unused         0              Integer    Big
               , fileLen : dv.getInt32(  24, false) * 2                                  // Byte 24      File Length    File Length    Integer    Big
               , version : dv.getInt32(  28,  true)                                      // Byte 28      Version        1000           Integer    Little
               , shpType : dv.getInt32(  32,  true)                                      // Byte 32      Shape Type     Shape Type     Integer    Little
               , boxXmin : dv.getFloat64(36,  true)                                      // Byte 36      Bounding Box   Xmin           Double     Little
               , boxYmin : dv.getFloat64(44,  true)                                      // Byte 44      Bounding Box   Ymin           Double     Little
               , boxXmas : dv.getFloat64(52,  true)                                      // Byte 52      Bounding Box   Xmax           Double     Little
               , boxYmax : dv.getFloat64(60,  true)                                      // Byte 60      Bounding Box   Ymax           Double     Little
               , boxZmin : dv.getFloat64(68,  true)                                      // Byte 68*     Bounding Box   Zmin           Double     Little
               , boxZmax : dv.getFloat64(76,  true)                                      // Byte 76*     Bounding Box   Zmax           Double     Little
               , boxMmin : dv.getFloat64(84,  true)                                      // Byte 84*     Bounding Box   Mmin           Double     Little
               , boxMmax : dv.getFloat64(92,  true)                                      // Byte 92*     Bounding Box   Mmax           Double     Little
               }

    for (let i = 0; i < xar.length; i++) {
        let idx = xar[i][0] * 2;

        if (i == 0) {                                                                    // Main File Record Header:
            mhdr = { rcrdNum : dv.getInt32(idx     , false)                              // Byte 0     Record Number   Record Number  Integer                Big
                   , contLen : dv.getInt32(idx  + 4, false)                              // Byte 4     Content Length  Content Length Integer                Big
                   }
        } else {
            switch (main.shpType) {
                case 0 :                                                                 // Null Shape Record Contents:
                    rcrd = { shpType : dv.getInt32(idx, true)                            // Byte 0     Shape Type     0          Integer    1           Little
                           }
                    break;

                case 1 :                                                                 // Point Record Contents:
                    rcrd = { shpType : dv.getInt32(  idx      , true)                    // Byte 0      Shape Type    1          Integer    1           Little
                           , xValue  : dv.getFloat64( idx +  4, true)                    // Byte 4      X             X          Double     1           Little
                           , yValue  : dv.getFloat64( idx + 12, true)                    // Byte 12     Y             Y          Double     1           Little
                           }  
                    break;

                case 3 :                                                                 // PolyLine Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx + 36));                            // X = 44 + 4 * NumParts
                    rcrd = { shpType   : dv.getInt32(idx, true)                          // Byte 0      Shape Type    3          Integer    1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double     4           Little
                           , numParts  : dv.getInt32(idx + 36, true)                     // Byte 36     NumParts      NumParts   Integer    1           Little
                           , numPoints : dv.getInt32(idx + 40, true)                     // Byte 40     NumPoints     NumPoints  Integer    1           Little
                           , parts     : dv.getInt32(idx + 44, true)                     // Byte 44     Parts         Parts      Integer    NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx + x , true))     // Byte X      Points        Points     Point      NumPoints   Little
                           }
                    break;

                case 5 :                                                                 // Polygon Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx+36,true));                         // X = 44 + 4 * NumParts
                    rcrd = { shpType   : dv.getInt32(idx, true)                          // Byte 0      Shape Type    5          Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numParts  : dv.getInt32(idx + 36, true)                     // Byte 36     NumParts      NumParts   Integer     1           Little
                           , numPoints : dv.getInt32(idx + 40, true)                     // Byte 40     NumPoints     NumPoints  Integer     1           Little
                           , parts     : dv.getInt32(idx + 44, true)                     // Byte 44     Parts         Parts      Integer     NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx + x , true))     // Byte X      Points        Points     Point       NumPoints   Little
                           }
                    break;

                case 8 :                                                                 // MultiPoint Record Contents:
                    rcrd = { shpType   : dv.getInt32(idx     , true)                     // Byte 0      Shape Type    8          Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numPoints : dv.getInt32(idx + 36, true)                     // Byte 36     NumPoints     NumPoints  Integer     1           Little
                           , points    : new Int32Array(dv.getInt32(idx + 40, true))     // Byte 40     Points        Points     Point       NumPoints   Little
                           }
                    break;

                case 11 :                                                                // PointZ Record Contents:
                    rcrd = { shpType : dv.getInt32(   idx     , true)                    // Byte 0      Shape Type    11         Integer     1           Little
                           , xValue  : dv.getFloat64( idx +  4, true)                    // Byte 4      X             X          Double      1           Little
                           , yValue  : dv.getFloat64( idx + 12, true)                    // Byte 12     Y             Y          Double      1           Little
                           , zValue  : dv.getFloat64( idx + 20, true)                    // Byte 20     Z             Z          Double      1           Little
                           , mValue  : dv.getFloat64( idx + 28, true)                    // Byte 28     Measure       M          Double      1           Little
                           }
                    break;

                case 13 :                                                                // PolyLineZ Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx + 36, true));                      // X = 44 + (4 * NumParts)
                    let y = x + (16 * dv.getInt32(idx + 40, true));                      // Y = X + (16 * NumPoints)
                    let z = y + 16 + (8 * dv.getInt32(idx + 40, true));                  // Z = Y + 16 + (8 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(idx     , true)                     // Byte 0      Shape Type    13         Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numParts  : dv.getInt32(idx + 36, true)                     // Byte 36     NumParts      NumParts   Integer     1           Little
                           , numPoints : dv.getInt32(idx + 40, true)                     // Byte 40     NumPoints     NumPoints  Integer     1           Little
                           , parts     : dv.getInt32(idx + 44, true)                     // Byte 44     Parts         Parts      Integer     NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx + x , true))     // Byte X      Points        Points     Point       NumPoints   Little
                           , zMin      : dv.getFloat64( idx + y     , true)              // Byte Y      Zmin          Zmin       Double      1           Little
                           , zMax      : dv.getFloat64( idx + y +  8, true)              // Byte Y + 8  Zmax          Zmax       Double      1           Little
                           , zArray    : dv.getFloat64( idx + y + 16, true)              // Byte Y + 16 Zarray        Zarray     Double      NumPoints   Little
                           , mMin      : dv.getFloat64( idx + z     , true)              // Byte Z*     Mmin          Mmin       Double      1           Little
                           , mMax      : dv.getFloat64( idx + z +  8, true)              // Byte Z+8*   Mmax          Mmax       Double      1           Little
                           , mArray    : dv.getFloat64( idx + z + 16, true)              // Byte Z+16*  Marray        Marray     Double      NumPoints   Little
                           }
                    break;

                case 15 :                                                                // PolygonZ Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx+36,true));                         // X = 44 + (4 * NumParts)
                    let y = x + (16 * dv.getInt32(idx+40,true));                         // Y = X + (16 * NumPoints)
                    let z = y + 16 + (8 * dv.getInt32(idx+40,true));                     // Z = Y + 16 + (8 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(idx     , true)                     // Byte 0      Shape Type    15         Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numParts  : dv.getInt32(idx + 36, true)                     // Byte 36     NumParts      NumParts   Integer     1           Little
                           , numPoints : dv.getInt32(idx + 40, true)                     // Byte 40     NumPoints     NumPoints  Integer     1           Little
                           , parts     : dv.getInt32(idx + 44, true)                     // Byte 44     Parts         Parts      Integer     NumParts    Little
                           , points    : new Int32Arr(dv.getInt32(idx + x, true))        // Byte X      Points        Points     Point       NumPoints   Little
                           , zMin      : dv.getFloat64( idx + y     , true)              // Byte Y      Zmin          Zmin       Double      1           Little
                           , zMax      : dv.getFloat64( idx + y +  8, true)              // Byte Y+8    Zmax          Zmax       Double      1           Little
                           , zArray    : dv.getFloat64( idx + y + 16, true)              // Byte Y+16   Zarray        Zarray     Double      NumPoints   Little
                           , mMin      : dv.getFloat64( idx + z     , true)              // Byte Z*     Mmin          Mmin       Double      1           Little
                           , mMax      : dv.getFloat64( idx + z +  8, true)              // Byte Z+8*   Mmax          Mmax       Double      1           Little
                           , mArray    : dv.GetFloat64( idx + z + 16, true)              // Byte Z+16*  Marray        Marray     Double      NumPoints   Little
                           }
                    break;

                case 18:                                                                 // MultiPointZ Record Contents:
                    let x = 40 + (16 * dv.getInt32(idx + 36, true));                     // X = 40 + (16 * NumPoints)
                    let y = x + 16 + (8 * dv.getInt32(idx + 36, true));                  // Y = X + 16 + (8 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(   idx         , true)              // Byte 0      Shape Type    18         Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numPoints : dv.getInt32(   idx + 36    , true)              // Byte 36     NumPoints     NumPoints  Integer     1           Little
                           , points    : new Int32Array(dv.getInt32(idx + 40, true))     // Byte 40     Points        Points     Point       NumPoints   Little
                           , zMin      : dv.getFloat64( idx + x     , true)              // Byte X      Zmin          Zmin       Double      1           Little
                           , zMax      : dv.getFloat64( idx + x +  8, true)              // Byte X+8    Zmax          Zmax       Double      1           Little
                           , zArray    : dv.getFloat64( idx + x + 16, true)              // Byte X+16   Zarray        Zarray     Double      NumPoints   Little
                           , mMin      : dv.getFloat64( idx + y     , true)              // Byte Y*     Mmin          Mmin       Double      1           Little
                           , mMax      : dv.getFloat64( idx + y +  8, true)              // Byte Y+8*   Mmax          Mmax       Double      1           Little
                           , mArray    : dv.getFloat64( idx + y + 16, true)              // Byte Y+16*  Marray        Marray     Double      NumPoints   Little
                           }
                    break;

                case 21 :                                                                // PointM Record Contents:
                    rcrd = { shpType : dv.getInt32(  idx     , true)                     // Byte 0      Shape Type    21         Integer     1           Little
                           , xValue  : dv.getFloat64(idx +  4, true)                     // Byte 4      X             X          Double      1           Little
                           , yValue  : dv.getFloat64(idx + 12, true)                     // Byte 12     Y             Y          Double      1           Little
                           , mValue  : dv.getFloat64(idx + 20, true)                     // Byte 20     M             M          Double      1           Little
                           }
                    break;

                case 23 :                                                                // PolyLineM Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx+36,true));                         // X = 44 + (4 * NumParts)
                    let y = x + (16 * dv.getInt32(idx+40,true));                         // Y = X + (16 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(   idx     , true)                  // Byte 0      Shape Type    23         Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numParts  : dv.getInt32(   idx + 36, true)                  // Byte 36     NumParts      NumParts   Integer     1           Little
                           , numPoints : dv.getInt32(   idx + 40, true)                  // Byte 40     NumPoints     NumPoints  Integer     1           Little
                           , parts     : dv.getInt32(idx+44, true)                       // Byte 44     Parts         Parts      Integer     NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx+x , true))       // Byte X      Points        Points     Point       NumPoints   Little
                           , mMin      : dv.getFloat64( idx + y     , true)              // Byte Y*     Mmin          Mmin       Double      1           Little
                           , mMax      : dv.getFloat64( idx + y +  8, true)              // Byte Y+8*   Mmax          Mmax       Double      1           Little
                           , mArray    : dv.getFloat64( idx + y + 16, true)              // Byte Y+16*  Marray        Marray     Double      NumPoints   Little
                           }
                    break;

                case 25 :                                                                // PolygonM Record Contents:
                    let x = 44 + (4 * dv.getInt32(idx+36,true));                         // X = 44 + (4 * NumParts)
                    let y = x + (16 * dv.getInt32(idx+40,true));                         // Y = X + (16 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(  idx     , true)                   // Byte 0      Shape Type    25         Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box           Box        Double      4           Little
                           , numParts  : dv.getInt32(  idx + 36, true)                   // Byte 36     NumParts      NumParts   Integer     1           Little
                           , numPoints : dv.getInt32(  idx + 40, true)                   // Byte 40     NumPoints     NumPoints  Integer     1           Little
                           , parts     : dv.getInt32(  idx + 44, true)                   // Byte 44     Parts         Parts      Integer     NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx + x, true))      // Byte X      Points        Points     Point       NumPoints   Little
                           , mMin      : dv.getFloat64(idx + y     , true)               // Byte Y*     Mmin          Mmin       Double      1           Little
                           , mMax      : dv.getFloat64(idx + y +  8, true)               // Byte Y+8*   Mmax          Mmax       Double      1           Little
                           , mArray    : dv.getFloat64(idx + y + 16, true)               // Byte Y+16*  Marray        Marray     Double      NumPoints   Little
                           }
                    break;

                case 28 :                                                                // MultiPointM Record Contents:
                    let x = 40 + (16 * dv.getInt32(idx+36, true));                       // X = 40 + (16 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(  idx     , true)                   // Byte 0      Shape Type   28          Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box          Box         Double      4           Little
                           , numPoints : dv.getInt32(  idx + 36, true)                   // Byte 36     NumPoints    NumPoints   Integer     1           Little
                           , points    : new Int32Array(dv.getInt32(idx+40))             // Byte 40     Points       Points      Point       NumPoints   Little
                           , mMin      : dv.getFloat64(idx +  x     , true)              // Byte X*     Mmin         Mmin        Double      1           Little
                           , mMax      : dv.getFloat64(idx +  x +  8, true)              // Byte X+8*   Mmax         Mmax        Double      1           Little
                           , mArray    : dv.getFloat64(idx +  x + 16, true)              // Byte X+16*  Marray       Marray      Double      NumPoints   Little
                           }
                    break;

                // Value Part Type
                // 0     Triangle Strip
                // 1     Triangle Fan
                // 2     Outer Ring
                // 3     Inner Ring
                // 4     First Ring
                // 5     Ring
                case 31 :                                                                // MultiPatch Record Contents:
                    let w = 44 + (4 * dv.getInt32(idx+36,true));                         // W = 44 + (4 * NumParts)
                    let x = w + (4 * dv.getInt32(idx+36,true));                          // X = W + (4 * NumParts)
                    let y = x + (16 * dv.getInt32(idx+40,true));                         // Y = X + (16 * NumPoints)
                    let z = y + 16 + (8 * dv.getInt32(idx+40,true));                     // Z = Y + 16 + (8 * NumPoints)
                    rcrd = { shpType   : dv.getInt32(  idx     , true)                   // Byte 0      Shape Type   31          Integer     1           Little
                           , box       : box(dv, idx)                                    // Byte 4      Box          Box         Double      4           Little
                           , numParts  : dv.getInt32(  idx + 36, true)                   // Byte 36     NumParts     NumParts    Integer     1           Little
                           , numPoints : dv.getInt32(  idx + 40, true)                   // Byte 40     NumPoints    NumPoints   Integer     1           Little
                           , parts     : dv.getInt32(  idx + 44, true)                   // Byte 44     Parts        Parts       Integer     NumParts    Little
                           , partTypes : dv.getInt32(  idx + w , true)                   // Byte W      PartTypes    PartTypes   Integer     NumParts    Little
                           , points    : new Int32Array(dv.getInt32(idx+x, true))        // Byte X      Points       Points      Point       NumPoints   Little
                           , zMin      : dv.getFloat64(idx + y     , true)               // Byte Y      Zmin         Zmin        Double      1           Little
                           , zMax      : dv.getFloat64(idx + y +  8, true)               // Byte Y+8    Zmax         Zmax        Double      1           Little
                           , zArray    : dv.getFloat64(idx + y + 16, true)               // Byte Y+16   Zarray       Zarray      Double      NumPoints   Little
                           , mMin      : dv.getFloat64(idx + z     , true)               // Byte Z*     Mmin         Mmin        Double      1           Little
                           , mMax      : dv.getFloat64(idx + z +  8, true)               // Byte Z+8*   Mmax         Mmax        Double      1           Little
                           , mArray    : dv.getFloat64(idx + z + 16, true)               // Byte Z+16*  Marray       Marray      Double      NumPoints   Little
                           }
                    break;

                default :

            }
        }
    }

    return arr;
}
