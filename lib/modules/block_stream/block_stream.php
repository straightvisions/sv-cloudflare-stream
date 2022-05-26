<?php
	namespace sv_cloudflare_stream;
	
	class block_stream extends modules {
		private $cloudflare = null;
		
		public function init() {
			
			add_action( 'init', array($this, 'register_block') );
			add_action( 'init', array($this, 'register_scripts') );
			
			$this->cloudflare = $this->get_module('cloudflare');
			
			add_shortcode('sv_cloudflare_stream', array($this, 'shortcode'));
			
		}
		
		public function register_scripts(): block_stream {
			// cloudflare API
			if(is_admin()){
			
				$current_user = wp_get_current_user();
				
				$api_key = current_user_can( 'administrator' ) ? $this->cloudflare->get_setting('api_key') : '';
				$api = $this->cloudflare->api;
				
				$this->get_script('sv_cloudflare_stream_editor_script')
				     ->set_path('lib/backend/dist/block.build.js')
				     ->set_type('js')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_deps(array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'))
				     ->set_is_enqueued()
					 ->set_localized(array(
						'nonce'   => wp_create_nonce( $this->cloudflare->get_nonce() ),
						'api'     => array(
							'email'          => $this->cloudflare->get_setting('api_email'),
							'key'            => $api_key,
							'account'        => $this->cloudflare->get_setting('api_account_id') ,
							'posts_per_page' => $api->api_limit,
							'uid'            => md5( $current_user->user_login ),
						),
						'media'   => array(
							'view'  => array(),
							'model' => array(),
						),
						'options' => array(
							'heap' => $this->cloudflare->get_setting('api_account_analytics_heap') ,
						),
					));
				
				$this->get_script('sv_cloudflare_stream_editor_hls_script')
				     ->set_path('lib/backend/cloudflare/js/hls.min.js')
				     ->set_type('js')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_is_enqueued()
				     ;
				
			}
			
			
			return $this;
		}
		
		public function register_block(): block_stream{
			$path = $this->get_path('block.json') ;
			
			if ( is_string( $path ) && file_exists( $path ) ) {
				register_block_type_from_metadata( $path );
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
			// inject script here
			$output = ob_get_contents();
			ob_end_clean();
			
			return $output;
		}
	}