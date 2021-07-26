// |apps|maps|Map utility

export async function maps() {
    let path = '/apps/maps/map.png';
    let resp = await fetch(path);
    let blob = await resp.blob()
    let file = new File([blob], 'map.png', { type: 'image/png' });
}
