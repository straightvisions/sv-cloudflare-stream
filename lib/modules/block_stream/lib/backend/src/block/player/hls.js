import ReactHlsPlayer from 'react-hls-player';

export default Player(attributes){
	return (
			<ReactHlsPlayer
				src={'https://videodelivery.net/' + attributes.uid + '/manifest/video.m3u8'}
				autoPlay={attributes.autoplay}
				controls={attributes.controls}
				loop={ attributes.loop }
				muted={ attributes.muted }
				width="100%"
				height="auto"
			/>
	);
}
