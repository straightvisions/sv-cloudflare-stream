window.addEventListener('load', function() {
	const sv_cloudflare_stream_videos_html5 = document.querySelectorAll('.sv-cloudflare-stream-html5');
	let i = 0;
	
	
	while (i < sv_cloudflare_stream_videos_html5.length) {
		const hls = new Hls(); // new HLS for every video needed (multi video support)
		const src = sv_cloudflare_stream_videos_html5[i].getAttribute('data-source');
		hls.loadSource('https://videodelivery.net/' + src + '/manifest/video.m3u8');
		hls.attachMedia(sv_cloudflare_stream_videos_html5[i]);
		
		i++;
	}
});
