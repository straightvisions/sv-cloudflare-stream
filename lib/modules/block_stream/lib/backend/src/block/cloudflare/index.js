import _load_attachments from './media/models/attachments.js';
import _load_query from './media/models/query.js';
import _load_media_frame from './media/views/media_frame.js';

class svCloudflareStream{
	constructor(){
		const props = js_sv_cloudflare_stream_block_stream_scripts_sv_cloudflare_stream_editor_script;
		this.nonce = props.nonce;
		this.api = props.api;
		this.media = props.media;

		this.media.model.Query          = _load_query(this);
		this.media.model.Attachments    = _load_attachments(this);
		this.media.view.MediaFrame      = _load_media_frame(this);
	}

}

export default new svCloudflareStream();