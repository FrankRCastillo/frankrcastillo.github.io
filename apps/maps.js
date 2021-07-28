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
    let url = window.URL.createObjectURL(blb);
    let img = new Image();
    let imd = null;
    
    img.src = url;

    img.onload = () => {
        let cnv = document.createElement('canvas');
        let ctx = cnv.getContext('2d');

        ctx.drawImage(img, 0, 0)

        imd = ctx.getImageData(0, 0, img.width, img.height);
    }


    return rtn;
}
