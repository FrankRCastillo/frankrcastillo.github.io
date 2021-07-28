// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let url = '/apps/maps/map.bmp';
    let rsp = await fetch(url);
    let fbl = await rsp.blob();
    let bmp = await createImageBitmap(fbl);
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

        arr.push(decToUcd(val));

        if ((arr.length - 1) % bmp.width == 0) {
            arr.push('\n');
        }
    }

    return rtn;
}

function decToUcd(n) {
    return String.fromCharCode(10495)
}

function avgRGBA(r,g,b,a) {
    return (r + g + b + a) / 4;

}
