// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn    = '';
    let path   = 'https://frankrcastillo.github.io/apps/maps/map.bmp';
    let image  = new Image();
    let canvas = document.createElement('canvas');

    image.src  = path;
    canvas.height = image.height;
    canvas.width  = image.width;

    let context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    let imagedata = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imagedata.data;

    for (let i = 0; i < data.length; i++) {
        rtn += data[i];

        if (i + 1 % 1357 == 0) {
            rtn += '\n';
        }
    }

    return rtn;
}
