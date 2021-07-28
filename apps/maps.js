// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let bmp = '/apps/maps/map.bmp';
    let img = new Image();
    let cnv = document.createElement('canvas');
    let ctx = cnv.getContext('2d');

    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    };

    img.src = bmp;

    let idt = ctx.getImageData(0, 0, cnv.width, cnv.height);
    let dat = idt.data;

    return rtn;
}
