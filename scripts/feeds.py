import feedparser, os, csv, json

# Load feed list from CSV
with open('pages/feeds.csv') as f:
    feeds = list(csv.reader(f))

os.makedirs('pages/feeds/generated', exist_ok = True)

for name, url in feeds:
    name   = name.strip('"')
    url    = url.strip('"')
    parsed = feedparser.parse(url)

    items = []
    for entry in parsed.entries:
        items.append({
            'title'     : entry.get('title', ''),
            'link'      : entry.get('link', ''),
            'published' : entry.get('published', '')
        })

    with open(f'pages/feeds/generated/{name}.json', 'w') as out:
        json.dump( { 'name' : name
                   , 'items': items
                   }
                 , out
                 , indent = 2
                 )

