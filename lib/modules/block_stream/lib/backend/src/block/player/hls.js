import Hls from "hls.js";

export default class Player extends React.Component {
	state = {
		url:'',
	};
	
	componentDidUpdate() {
	
		
	}
	
	componentDidMount() {
		const video = this.player;
		const url = this.props.src;
		const hls = new Hls({ enableWorker: false });
		
		hls.loadSource(url);
		hls.attachMedia(video);
		//hls.on(Hls.Events.MANIFEST_PARSED, function() { video.play(); });
	}
	
	render() {
		return (
			<video
				className="sv-cloudflare-stream-html5"
				ref={player => (this.player = player)}
				autoPlay={false}
				muted={true}
				controls={true}
				loop={this.props.loop}
			/>
		);
	}
}