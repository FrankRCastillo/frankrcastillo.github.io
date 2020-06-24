export async function news() {
    var url = 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/world/rss.xml'

    var rss = await ReadFile(url);

    console.log("news");
}
