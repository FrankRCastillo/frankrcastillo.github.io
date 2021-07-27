// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let url = '/apps/maps/map.bmp';
    let ctx = document.createElement('canvas').getContent('2d');
    let img = new Image();
    
    img.addEventListener('load', () => {
       ctx.drawImage(img, 0, 0); 
    }, false);
    img.src = url;

    return rtn;
}
