$(document).ready(function () {
	$('#MediumRss').FeedEk({
		FeedUrl: 'https://medium.com/feed/frank-r-castillo',
		MaxCount: 100,
		ShowDesc: false
	});
	$('#TwitterRss').FeedEk({
		FeedUrl: 'https://twitrss.me/twitter_user_to_rss/?user=FrankRCastillo',
		MaxCount: 100,
		ShowDesc: false
	});
});
function scrollTo(value){
	document.querySelector(value).scrollIntoView({ 
		behavior: 'smooth' 
	});
}