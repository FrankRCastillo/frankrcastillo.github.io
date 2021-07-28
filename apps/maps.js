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
    let ctx = canvas.getContext('2d');

    ctx.drawImage(bmp, 0, 0);

    var dat = ctx.getImageData(0, 0, bmp.width, bmp.height);

    return rtn;

}
