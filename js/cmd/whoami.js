export default async function whoami() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const { ip } = await res.json();

        const res2 = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res2.json();

        return [ `IP: ${data.ip}`
               , `City: ${data.city}`
               , `Region: ${data.region}`
               , `Country: ${data.country_name}`
               , `Latitude: ${data.latitude}`
               , `Longitude: ${data.longitude}`
               , `Org: ${data.org}`
               , `ASN: ${data.asn}`
               , `Timezone: ${data.timezone}`
               ].join(' n');
    } catch (err) {
        return `whoami: failed to retrieve IP info`;
    }
}

