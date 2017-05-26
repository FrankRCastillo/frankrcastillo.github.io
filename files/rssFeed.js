$(document).ready(function () {
	$('#MediumRss').FeedEk({
		FeedUrl: 'https://medium.com/feed/frank-r-castillo',
		MaxCount: 500
	});
	$('#TwitterRss').FeedEk({
		FeedUrl: 'https://twitrss.me/twitter_user_to_rss/?user=FrankRCastillo',
		MaxCount: 10
	});
	$('#YouTubeRss').FeedYt({
		FeedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2h-iPOAKbCe1eo8aA-Zf4g',
		MaxCount: 500
	});
});