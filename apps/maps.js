// |apps|maps|Map utility

export async function maps() {
    let col = Math.round((screen.width - 120) / 12);
    let txt = await bmpToAscii(col);



    print(txt);
}

async function bmpToAscii(col) {
    let url = '/apps/maps/map.bmp';
    let rsp = await fetch(url);
    let fbl = await rsp.blob();
    let w   = 1357;
    let h   = 628;
    let nh  = Math.round((col * h) / 1357);

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
    if (n == 255) {
        return "&nbsp;";
    } else {
        return String.fromCharCode(10495 - val);
    }
}

function avgRGBA(r,g,b,a) {
    return (r + g + b + a) / 4;

}
