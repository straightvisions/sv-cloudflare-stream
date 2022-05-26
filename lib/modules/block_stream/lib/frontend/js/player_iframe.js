window.addEventListener('load', function(){
	const sv_cloudflare_stream_videos_iframes = document.querySelectorAll('.sv-cloudflare-stream-iframe');
	let i = 0;
	while(i < sv_cloudflare_stream_videos_iframes.length){
		
		const player = Stream(sv_cloudflare_stream_videos_iframes[i]);
		player.addEventListener('play', () => {
			//console.log('playing!');
		});
		player.play().catch(() => {
			//console.log('playback failed, muting to try again');
			player.muted = true;
			player.play();
		});
		
		i++;
	}
});