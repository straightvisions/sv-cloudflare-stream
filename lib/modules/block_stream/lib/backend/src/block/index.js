const {useBlockProps} = wp.blockEditor;
const { registerBlockType } = wp.blocks;
const { __ } = wp.i18n;

import save from './save';
import {default as CloudflareStreamEdit} from './edit';
import transforms from './transforms';





registerBlockType('straightvisions/sv-cloudflare-stream', {
	title: 'SV Cloudflare Stream',
	example: {
		attributes: {
			src:
				'https://upload.wikimedia.org/wikipedia/commons/c/ca/Wood_thrush_in_Central_Park_switch_sides_%2816510%29.webm',
			caption: __( 'Wood thrush singing in Central Park, NYC.' ),
		},
	},
	transforms,
	edit: (props) =>{
		const blockProps = useBlockProps();
	
		return <div {...blockProps}><CloudflareStreamEdit {...props} /></div>;
	},
	save,
});
