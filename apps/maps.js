// |apps|maps|Map utility

export async function maps() {
    let col = Math.round((screen.width - 120) / 12);
    let txt = await bmpToAscii(col);



    print(txt);
}

async function bmpToAscii(col) {
    let url = '/apps/maps/map.bmp';
    let rsp = await fetch(url);
    let fbl = await rsp.blob();
    let w   = 1357;
    let h   = 628;
    let nh  = Math.round((col * h) / 1357);

    let bmp = await createImageBitmap(fbl, { resizeWidth : col, resizeHeight : nh });

    let cnv = new OffscreenCanvas(bmp.width, bmp.height);
    let ctx = cnv.getContext('2d');

    ctx.drawImage(bmp, 0, 0);

    let idt = ctx.getImageData(0, 0, bmp.width, bmp.height);
    let dat = idt.data;
    let arr = [];

    for (let i = 0; i < dat.length; i += 4) {
        let avg = avgRGBA( dat[i]
                         , dat[i + 1]
                         , dat[i + 2]
                         , dat[i + 3]
                         );
        let val = Math.round(avg);

        arr.push(valShade(val));

        if (arr.length % (bmp.width + 1) == 0) {
            arr.push('\n');
        }
    }

    return arr.join('');
}

function valShade(val) {
    let s = ['$','@','B','%','8','&','W','M','#','*','o','a','h','k','b','d','p','q','w','m','Z','O','0','Q','L','C','J','U','Y','X','z','c','v','u','n','x','r','j','f','t','/','\\','|','(',')','1','{','}','[',']','?','-','_','+','~','<','>','i','!','l','I',';',':','\,','\"','^','`','\'','.',' '];
    let w = s.length;
    let x = Math.round((w * val) / 255) - 1;

    if (s[x] == ' ') {
        return '&nbsp;';
    } else {
        return s[x];
    }
}

function avgRGBA(r,g,b,a) {
    return (r + g + b + a) / 4;

}
