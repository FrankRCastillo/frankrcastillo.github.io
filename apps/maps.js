// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let path = '/apps/maps/map.bmp';
    let resp = await fetch(path);
    let blob = await resp.blob()
    let file = new File([blob], 'map.png', { type: 'image/png' });
    let cnvs = document.createElement('canvas');
    let cntx = cnvs.getContext('2d');
    let img  = cntx.getImageData(0, 0, 1357, 628);
    let rtn  = '';

    img.src  = await file.text();

    for (let i = 0; i < img.data.length; i++) {
        rtn += img.data[i];

        if (i + 1 % 1357 == 0) {
            rtn += '\n';
        }
    }

    return rtn;
}
