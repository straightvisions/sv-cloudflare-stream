<?php
	namespace sv_cloudflare_stream;

	class block_stream extends modules {
		public function init() {
			add_shortcode('sv_cloudflare_stream', array($this, 'shortcode'));
		}
		public function shortcode($atts, $content = null){
			

			return '';
		}
	}