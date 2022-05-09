<?php
	namespace sv_cloudflare_stream;

	class iframe extends modules {
		public function init() {
			add_shortcode('sv_iframe', array($this, 'shortcode'));
		}
		public function shortcode($atts, $content = null){
			$atts = shortcode_atts(
				array(
					'width'          	=> '100%',
					'height'			=> '700px',
					'url'				=> ''
				),
				$atts,
				$this->get_prefix()
			);

			return '<iframe src="'.$atts['url'].'" frameborder="0" width="'.$atts['width'].'" height="'.$atts['height'].'"></iframe>';
		}
	}