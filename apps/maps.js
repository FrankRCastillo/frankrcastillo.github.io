// |apps|maps|Map utility

export async function maps() {
    let txt = await bmpToAscii();

    print(txt);
}

async function bmpToAscii() {
    let rtn = '';
    let url = '/apps/maps/map.bmp';
    let ftc = await fetch(url);
    let blb = await ftc.blob();
    let fle = new File([blb], 'map.bmp', { type: 'image/bmp' });
    let ctx = document.createElement('canvas').getContext('2d');
    let img = new Image();
    
    img.addEventListener('load', () => {
       ctx.drawImage(img, 0, 0); 
    }, false);

    img.src = fle.blob();

    return rtn;
}
