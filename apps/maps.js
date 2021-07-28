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
    let fch = await fetch(bmp);
    let blb = await fch.blob();

    img.src = blb;
    cnv.width = img.width;
    cnv.height = img.height;
    ctx.drawImage(img, 0, 0, img.height, img.width);

    let dat = ctx.getImageData(0, 0, img.height, img.width).data;


    return rtn;
}
