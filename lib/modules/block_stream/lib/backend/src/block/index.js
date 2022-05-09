

const { registerBlockType } = wp.blocks;
//import save from './save';
import {default as edit} from './edit';
import transforms from './transforms';
const { __ } = wp.i18n;

// debug
console.log(wp);

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
	edit,
	save: ()=>{
		return <p></p>;
	},
});
