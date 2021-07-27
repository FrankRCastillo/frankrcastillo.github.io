// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let bmp = '/apps/maps/map.bmp';
    let url = window.URL.createObjectURL(bmp);
    let img = new Image();

    img.src = url;
    img.onload = () => {
        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext('2d');

        ctx.drawImage(img, 0, 0)
    }

    return rtn;
}
