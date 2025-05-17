export const description = "Shows your IP and geolocation info.";

export default async function whoami() {
    const key = 'whoami-cache';

    const cached = sessionStorage.getItem(key);

    if (cached) {
       return cached;
    }

    try {
        const res  = await window.ghfetch('https://ipinfo.io/json');
        const data = await res.json();

        const output = [ `IP       : ${data.ip}`
                       , `Hostname : ${data.hostname}`
                       , `City     : ${data.city}`
                       , `Postal   : ${data.postal}`
                       , `Region   : ${data.region}`
                       , `Country  : ${data.country}`
                       , `Location : ${data.loc}`
                       , `Org      : ${data.org}`
                       , `Timezone : ${data.timezone}`
                       ].join('\n');

        sessionStorage.setItem(key, output);

        return output;

    } catch (err) {
        return `whoami: failed to retrieve IP info`;
        
    }
}
