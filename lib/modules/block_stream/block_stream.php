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
				
				$api_key = current_user_can( 'administrator' ) ? $this->cloudflare->get_setting('api_key')->get_data() : '';
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
							'email'          => $this->cloudflare->get_setting('api_email')->get_data(),
							'key'            => $api_key,
							'account'        => $this->cloudflare->get_setting('api_account_id')->get_data(),
							'posts_per_page' => $api->api_limit,
							'uid'            => md5( $current_user->user_login ),
						),
						'media'   => array(
							'view'  => array(),
							'model' => array(),
						)/*,
						'options' => array(
							'heap' => $this->cloudflare->get_setting('api_account_analytics_heap')->get_data(),
						),*/
					));
				
				$this->get_script('sv_cloudflare_stream_editor_hls_script')
				     ->set_path('lib/backend/cloudflare/js/hls.min.js')
				     ->set_type('js')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_is_enqueued();
				
				// legacy progressbar
				wp_enqueue_script( 'jquery-ui-progressbar' );
				$this->get_script('sv_cloudflare_stream_editor_progressbar_style')
				     ->set_path('lib/backend/css/jquery-ui.css')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_is_enqueued();
				
				$this->get_script('sv_cloudflare_stream_backend_player_css')
				     ->set_path('lib/backend/css/player.css')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_is_enqueued();
				
				$this->get_script('sv_cloudflare_stream_backend_media_library_css')
				     ->set_path('lib/backend/css/media_library.css')
				     ->set_is_gutenberg()
				     ->set_is_backend()
				     ->set_is_enqueued();
			}
			
			return $this;
		}
		
		// getting fatal error without this function, check later why
		public function load_settings(): block_stream{
			return $this;
		}
		
		public function register_block(): block_stream{
			$path = $this->get_path('block.json') ;
			
			if ( is_string( $path ) && file_exists( $path ) ) {
				register_block_type_from_metadata( $path,
					array('render_callback' => array($this, 'render_block'))
					);
			}
			
			return $this;
		}
		
		public function shortcode($settings, $content = null){
			$attr								= shortcode_atts(
				array(
					'uid'			  => '',
					'controls'        => true,
					'preload'         => 'metadata',
					'mute'            => true,
					'mute'            => true,
					'player'          => 'html5',
				),
				$settings,
				$this->get_module_name()
			); //@todo: add block attributes for mute, loop etc.
			
			$attr['player'] = strtolower($attr['player']);
			
			return $this->render_block($attr, $content);
		}
		
		private function load_frontend_scripts($attr): block_stream{
			$this->get_script('sv_cloudflare_stream_frontend_css')
			     ->set_path('lib/frontend/css/player.css')
			     ->set_is_enqueued();
			
			// https://developers.cloudflare.com/stream/viewing-videos/using-the-player-api/
			if($attr['player'] === 'iframe'){
				$this->get_script('sv_cloudflare_stream_frontend_iframe_player_vendor')
				     ->set_path('lib/frontend/js/sdk.latest.js')
				     ->set_type('js')
				     ->set_is_enqueued();
				
				$this->get_script('sv_cloudflare_stream_frontend_iframe_player')
				     ->set_path('lib/frontend/js/player_iframe.js')
				     ->set_type('js')
				     ->set_deps(array('sv_cloudflare_stream_frontend_iframe_player_vendor'))
				     ->set_is_enqueued();
			}
			
			//https://developers.cloudflare.com/stream/viewing-videos/using-own-player/
			if($attr['player'] === 'html5'){
				$this->get_script('sv_cloudflare_stream_frontend_html5_player_vendor')
				     ->set_path('lib/frontend/js/hls.min.js')
				     ->set_type('js')
				     ->set_is_enqueued();
				
				$this->get_script('sv_cloudflare_stream_frontend_html5_player')
				     ->set_path('lib/frontend/js/player_html5.js')
				     ->set_type('js')
					//->set_deps(array('sv_cloudflare_stream_frontend_html5_player_vendor'))
					 ->set_is_enqueued();
			}
			
			return $this;
		}
		
		public function render_block( array $attr, string $content ): string {
			$api = $this->cloudflare->api;
			
			// fallback
			$attr['player'] = isset($attr['player']) === true ? $attr['player'] : 'html5';
			
			$this->load_frontend_scripts($attr);
			
			ob_start();
			if($attr['player'] === 'iframe'){
				require( $this->get_path( 'lib/frontend/tpl/block_iframe.php' ) );
			}
			if($attr['player'] === 'html5'){
				require( $this->get_path( 'lib/frontend/tpl/block_html5.php' ) );
			}
			
			$output = ob_get_clean();
			
			return $output;
		}
		
		public function get_video_dims($video, $default_w = 1920, $default_h = 1080){
			$output = array(
				'width' => $default_w,
				'height' => $default_h,
			);
			
			if(
				empty($video) === false &&
				isset($video->result->input->width) &&
				isset($video->result->input->height)
			){
				$o_width = (int)$video->result->input->width;
				$o_height = (int)$video->result->input->height;
				
				// scale dims
				if($o_width > $o_height)
				{
					$n_width    = $default_w;
					$n_height   = $o_height / $o_width * $default_w;
				}
				
				if($o_width < $o_height)
				{
					$n_height   = $default_h;
					$n_width    = $o_width / $o_height * $default_h;
					
				}
				
				if($o_width == $o_height)
				{
					$n_width    = $default_w;
					$n_height   = $default_h;
				}
				
				$output['width']    = $n_width;
				$output['height']   = $n_height;
				
			}
			
			return $output;
		}
		
	}