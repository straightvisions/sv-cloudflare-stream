<?php
	namespace sv_cloudflare_stream;

	class block_stream extends modules {
		public function init() {
			
			$this->load_settings()
			     ->register_scripts()
			     ->register_block();
			
			add_shortcode('sv_cloudflare_stream', array($this, 'shortcode'));
			
		}
		
		protected function load_settings(): block_stream {
			return $this;
		}
		
		public function register_scripts(): block_stream {
			return $this;
		}
		
		public function register_block(): block_stream{
			return $this;
		}
		
		public function shortcode($settings, $content = null){
			$attr = $settings;
			
			return $this->render_block($attr, $content);
		}
		
		protected $block_attr = array();
		
		public function render_block( array $attr, string $content ): string {
			
			ob_start();
			
			require( $this->get_path( 'lib/frontend/tpl/block.php' ) );
			
			$output = ob_get_contents();
			ob_end_clean();
			
			return $output;
		}
	}