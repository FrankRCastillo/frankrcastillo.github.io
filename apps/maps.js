// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let path = '/apps/maps/map.bmp';
    let img  = new Image();
    let cnvs = document.createElement('canvas');

    img.src  = path;
    img.addEventListener('load', )
    cnvs.width  = 1357;
    cnvs.height = 628;

    let cntx = cnvs.getContext('2d');
    let rtn  = '';

    cntx.drawImage(img, 0, 0);

    let imgd = cntx.getImageData(0, 0, cnvs.width, cnvs.height);
    let data = imgd.data;

    for (let i = 0; i < data.length; i++) {
        rtn += data[i];

        if (i + 1 % 1357 == 0) {
            rtn += '\n';
        }
    }

    return rtn;
}
