<?php
	namespace sv_cloudflare_stream;

	class block_stream extends modules {
		public function init() {
			
			$this->load_settings()
			     ->register_scripts();
			
			add_shortcode('sv_cloudflare_stream', array($this, 'shortcode'));
			//add_action( 'init', array($this, 'register_block' ));
			add_action( 'init', array($this, 'register_block') );
		}
		
		protected function load_settings(): block_stream {
			return $this;
		}
		
		public function register_scripts(): block_stream {
			
			$this->get_script('sv-cloudflare-stream-editor-script')
			     ->set_path('lib/backend/dist/block.build.js')
			     ->set_type('js')
				->set_is_gutenberg()
			     ->set_is_backend()
				->set_deps(array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'))
				 ->set_is_enqueued();
			
			return $this;
		}
		
		public function register_block(): block_stream{
			$path = $this->get_path('block.json') ;
			
			if ( is_string( $path ) && file_exists( $path ) ) {
				register_block_type_from_metadata( $path );
			}else{
				WP_Block_Type_Registry::get_instance()->register( $path );
			}
			
			
			
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