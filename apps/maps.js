// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn  = '';
    let bmp  = '/apps/maps/map.bmp';
    let read = new FileReader();
    let cnv  = document.createElement('canvas');
    let ctx  = cnv.getContext('2d');

    read.onload = e => {
        let img = new Image();

        img.onload = () => {
            cnv.width = img.width;
            cnv.height = img.height;

            ctx.drawImage(img, 0, 0);
        };

        img.src = e.target.result;
    };

    read.readAsDataURL(bmp);

    return rtn;
}
