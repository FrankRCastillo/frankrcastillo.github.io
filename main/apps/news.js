export async function news() {
    var url = 'https://news.google.com/rss/search'
            + '?q=when:24h+allinurl:reuters.com'
            + '&ceid=US:en'
            + '&hl=en-US'
            + '&gl=US';

    var rss = await ReadFile(url);

    console.log("news");
}
