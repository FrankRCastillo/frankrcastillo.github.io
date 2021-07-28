// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let bmp = '/apps/maps/map.bmp';
    let fch = await fetch(bmp);
    let blb = await fch.blob();
    let img = new Image();
    let cnv = document.createElement('canvas');
    let ctx = cnv.getContext('2d');

    img.src = blb;
    ctx.drawImage(img, 0, 0);
    cnv.width = 1357;
    cnv.height = 628;

    let imd = ctx.getImageData(0, 0, cnv.height, cnv. width);

    return rtn;
}
