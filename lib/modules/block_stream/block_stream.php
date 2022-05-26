<?php
	namespace sv_cloudflare_stream;
	
	class block_stream extends modules {
		private $cloudflare = null;
		
		public function init() {
			
			$this->set_section_title( __( 'Cloudflare API', 'sv_cloudflare_stream' ) )
			     ->set_section_type( 'settings' )
			     ->set_section_desc( '<a href="https://developers.cloudflare.com/api/tokens" target="_blank">'
			                         .__('Cloudflare API Docs', 'sv_cloudflare_stream')
			                         .'</a>' )
			     ->load_settings()
			     ->get_root()->add_section( $this );
			
			add_action( 'init', array($this, 'register_block') );
			add_action( 'init', array($this, 'register_scripts') );
	
			
			require($this->get_path('lib/backend/cloudflare/class-cloudflare-stream-settings.php'));
			require($this->get_path('lib/backend/cloudflare/class-cloudflare-stream-api.php'));
			require( $this->get_path('lib/backend/cloudflare/cloudflare.php'));
			$this->cloudflare = new Cloudflare();
		
			add_action( 'init', array($this, 'register_scripts') );
			add_shortcode('sv_cloudflare_stream', array($this, 'shortcode'));
			
		}
		
		protected function load_settings(): block_stream {
			$this->get_setting( 'api_email' )
			     ->set_title( __( 'Email', 'sv_cloudflare_stream' ) )
			     ->load_type( 'email' );
			
			$this->get_setting( 'api_key' )
			     ->set_title( __( 'Key', 'sv_cloudflare_stream' ) )
			     ->load_type( 'password' );
			
			$this->get_setting( 'api_account_id' )
			     ->set_title( __( 'Account ID', 'sv_cloudflare_stream' ) )
			     ->load_type( 'text' );
			
			$this->get_setting( 'api_account_analytics_heap' )
			     ->set_title( __( 'Activate Heap Analytics', 'sv_cloudflare_stream' ) )
			     ->load_type( 'checkbox' );
			
			return $this;
		}
		
		public function register_scripts(): block_stream {
			// cloudflare API
			if(is_admin()){
			
				$current_user = \wp_get_current_user();
				
				$api_key = current_user_can( 'administrator' ) ? get_option( Cloudflare_Stream_Settings::OPTION_API_KEY ) : '';
				$api = Cloudflare_Stream_API::instance();
				
				$this->get_script('sv_cloudflare_stream_editor_script')
				     ->set_path('lib/backend/dist/block.build.js')
				     ->set_type('js')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_deps(array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'))
				     ->set_is_enqueued()
					 ->set_localized(array(
						'nonce'   => wp_create_nonce( Cloudflare_Stream_Settings::NONCE ),
						'api'     => array(
							'email'          => get_option( Cloudflare_Stream_Settings::OPTION_API_EMAIL ),
							'key'            => $api_key,
							'account'        => get_option( Cloudflare_Stream_Settings::OPTION_API_ACCOUNT ),
							'posts_per_page' => $api->api_limit,
							'uid'            => md5( $current_user->user_login ),
						),
						'media'   => array(
							'view'  => array(),
							'model' => array(),
						),
						'options' => array(
							'heap' => get_option( Cloudflare_Stream_Settings::OPTION_HEAP_ANALYTICS ),
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
			// inject script here
			$output = ob_get_contents();
			ob_end_clean();
			
			return $output;
		}
	}