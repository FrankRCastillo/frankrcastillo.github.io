export const description = "Shows your IP and geolocation info.";

export default async function whoami() {
    try {
        const res  = await fetch('https://ipinfo.io/json');
        const data = await res.json();

        return [ `IP: ${data.ip}`
               , `Hostname: ${data.hostname}`
               , `City: ${data.city}`
               , `Postal: ${data.postal}`
               , `Region: ${data.region}`
               , `Country: ${data.country}`
               , `Location: ${data.loc}`
               , `Org: ${data.org}`
               , `Timezone: ${data.timezone}`
               ].join('\n');

    } catch (err) {
        return `whoami: failed to retrieve IP info`;
    }
}

