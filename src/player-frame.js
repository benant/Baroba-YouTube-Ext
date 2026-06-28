const params = new URLSearchParams(location.search);
const youtubeUrl = params.get('url');

if (youtubeUrl) {
	const barobaPlayer = document.getElementById('barobaPlayer');
	const playerUrl = 'https://baroba.benant.net/youtube/player?url='
		+ encodeURIComponent(youtubeUrl)
		+ '&embed=1&cover=0';

	barobaPlayer.src = playerUrl;

	barobaPlayer.addEventListener('load', () => {
		barobaPlayer.contentWindow.postMessage({ action: 'baroba-play' }, 'https://baroba.benant.net');
	});
}
