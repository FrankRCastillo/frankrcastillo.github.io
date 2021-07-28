// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let bmp = '/apps/maps/map.bmp';
    let img = new Image();

    img.onload = function() {
        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext('2d');

        ctx.drawImage(img, 0, 0);
    };

    img.src = bmp;

    return rtn;
}
