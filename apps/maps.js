// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let path = '/apps/maps/map.bmp';
    let img  = new Image();
    let cnvs = document.createElement('canvas');
    let cntx = cnvs.getContext('2d');
    let rtn  = '';

    img.src  = path;

    cntx.drawImage(img, 0, 0);

    let data = cntx.getImageData(0, 0, 1357, 628);

    for (let i = 0; i < data.length; i++) {
        rtn += data[i];

        if (i + 1 % 1357 == 0) {
            rtn += '\n';
        }
    }

    return rtn;
}
