// |apps|maps|Map utility

export async function maps() {
    //let col = Math.round((screen.width - 120) / 24);
    //let txt = await bmpToAscii(col);
    
    let path = 'apps/maps/10m_cultural/ne_10m_admin_0_countries.shp';
    let iarr = await getIntArr(path); 
    let shpe = getShape(iarr);

    //print(txt);
}

async function getIntArr(url) {
    let resp = await fetch(url);
    let blob = await resp.blob();
    let buff = await new Response(blob).arrayBuffer();
    let dtvw = new DataView(buff);
    let lght = buff.length;
    let arr  = [];

    for (let i = 0; i < lght; i++) {
        arr.push(buff.getInt32(i));
    }

    return arr;
}

async function getShape(arr) {
    let rtn = '';


    return rtn;
}

async function bmpToAscii(col) {
    let url = '/apps/maps/map0.bmp';
    let rsp = await fetch(url);
    let fbl = await rsp.blob();
    let w   = 800;
    let h   = 370;
    let nh  = Math.round((col * h) / w);

    let bmp = await createImageBitmap(fbl, { resizeWidth : col, resizeHeight : nh });
    let cnv = new OffscreenCanvas(bmp.width, bmp.height);
    let ctx = cnv.getContext('2d');

    ctx.drawImage(bmp, 0, 0);

    let idt = ctx.getImageData(0, 0, bmp.width, bmp.height);
    let dat = idt.data;
    let arr = [];

    for (let i = 0; i < dat.length; i += 4) {
        let avg = avgRGBA( dat[i]
                         , dat[i + 1]
                         , dat[i + 2]
                         , dat[i + 3]
                         );
        let val = Math.round(avg);

        arr.push(valShade(val));

        if (arr.length % (bmp.width + 1) == 0) {
            arr.push('\n');
        }
    }

    return arr.join('');
}

function valShade(val) {
    if (val == 255) {
        return "&nbsp;";
    } else {
        return String.fromCharCode(10495 - val);
    }
}

function avgRGBA(r,g,b,a) {
    return (r + g + b + a) / 4;

}
