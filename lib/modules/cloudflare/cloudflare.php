<?php
	namespace sv_cloudflare_stream;
	
	class cloudflare extends modules {
		public $api = null;
		
		public function init() {
			
			$this->set_section_title( __( 'Cloudflare API', 'sv_cloudflare_stream' ) )
			     ->set_section_type( 'settings' )
			     ->set_section_desc( '<a href="https://developers.cloudflare.com/api/tokens" target="_blank">'
			                         .__('Cloudflare API Docs', 'sv_cloudflare_stream')
			                         .'</a>' )
			     ->load_settings()
			     ->get_root()->add_section( $this );
			
			//add_action( 'init', array($this, 'register_block') );
			//add_action( 'init', array($this, 'register_scripts') );
	
			// load api
			require($this->get_path('lib/backend/class-cloudflare-stream-api.php'));

			$this->api = new Cloudflare_Stream_API($this->get_settings_list());
		
			// ajax
			add_action( 'wp_ajax_sv-query-cloudflare-stream-attachments', array($this, 'ajax_sv_cloudflare_stream_attachments') );
			add_action( 'wp_ajax_sv-cloudflare-stream-check-upload',  array($this,'ajax_sv_cloudflare_stream_check_upload') );
			add_action( 'wp_ajax_sv-query-cloudflare-stream-upload',  array($this,'ajax_sv_cloudflare_stream_upload') );
			add_action( 'wp_ajax_sv-cloudflare-stream-delete',  array($this,'ajax_sv_cloudflare_stream_delete') );
			add_action( 'wp_ajax_sv-cloudflare-stream-update',  array($this,'ajax_sv_cloudflare_stream_update') );
			add_action( 'wp_ajax_sv-cloudflare-stream-analytics',  array($this,'ajax_sv_cloudflare_stream_analytics') );
		}
		
		protected function load_settings(): cloudflare {
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
		
		protected function get_settings_list(){
			$list = array();
			
			foreach($this->get_settings() as $key => $val){
				$list[$key] = $val->get_data();
			}
			
			return $list;
		}
		
		public function get_nonce(){
			return $this->get_name();
		}
		
		public function ajax_sv_cloudflare_stream_attachments() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$api            = $this->api;
			$args['query']  = isset( $_REQUEST['query'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['query'] ) ) : '';
			$args['query'] .= '&limit=' . $api->api_limit;
			
			$data   = array();
			$videos = $api->get_videos( $args );
			
			foreach ( $videos->result as $video ) {
				$datetime = new \DateTime( $video->created );
				// phpcs:ignore
				$embedcode = '<stream src="' . $video->uid . '" controls></stream><script data-cfasync="false" defer type="text/javascript" src="https://embed.videodelivery.net/embed/r4xu.fla9.latest.js?video=' . $video->uid . '"></script>';
				$shortcode = '[cloudflare_stream uid="' . $video->uid . '"]';
				$data[]    = array(
					'uid'                   => $video->uid,
					'id'                    => $video->uid,
					'title'                 => $video->meta->name,
					'filename'              => $video->meta->name,
					'url'                   => 'https://watch.cloudflarestream.com/' . $video->uid,
					'link'                  => 'https://watch.cloudflarestream.com/' . $video->uid,
					'description'           => $embedcode,
					'caption'               => $shortcode,
					'status'                => 'inherit',
					'uploadedTo'            => 0,
					'date'                  => $video->created,
					'modified'              => $video->created,
					'menuOrder'             => 0,
					'mime'                  => 'video/mp4',
					'type'                  => 'video',
					'subtype'               => 'mp4',
					'icon'                  => $video->thumbnail,
					'dateFormatted'         => $datetime->format( 'F j, Y' ),
					'nonces'                =>
						array(
							'delete' => $this->get_nonce(),
						),
					'filesizeInBytes'       => $video->size,
					'filesizeHumanReadable' => size_format( $video->size ),
					'image'                 => array(
						'src'    => $video->thumbnail,
						'width'  => 64,
						'height' => 48,
					),
					'thumb'                 => array(
						'src'    => $video->thumbnail,
						'width'  => 64,
						'height' => 48,
					),
					'compat'                => array(
						'item' => '',
						'meta' => '',
					),
					'cloudflare'            => $video,
				);
			}//end foreach
			
			$response = array( 'success' => true );
			
			if ( isset( $data ) ) {
				$response['args']    = $args;
				$response['data']    = $data;
				$response['success'] = true;
			};
			wp_send_json( $response, 200 );
		}
		
		function ajax_sv_cloudflare_stream_check_upload() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$uid  = isset( $_REQUEST['uid'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['uid'] ) ) : '';
			$data = array();
			
			$api  = $this->api;
			$data = $api->get_video_details( $uid );
			
			if ( isset( $data->success ) && $data->success ) {
				wp_send_json_success( $data->result );
			} else {
				wp_send_json_error( $data->errors[0]->code . ' - ' . $data->errors[0]->message );
			}
		}
	
		
		/**
		 * AJAX method for initializing a video upload.
		 *
		 * @since 1.0.0
		 */
		function ajax_query_sv_cloudflare_stream_upload() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$api  = $this->api;
			$data = $api->init_video();
			wp_send_json_success( $data );
		}
	
		
		/**
		 * AJAX method for deleting a video.
		 *
		 * @since 1.0.0
		 */
		function ajax_sv_cloudflare_stream_delete() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$uid  = isset( $_REQUEST['uid'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['uid'] ) ) : '';
			$data = array();
			$api  = $this->api;
			
			$data = $api->delete_video( $uid );
			wp_send_json_success( $data );
		}

		
		/**
		 * AJAX method for updating a video.
		 *
		 * @since 1.0.0
		 */
		function ajax_sv_cloudflare_stream_update() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$uid    = isset( $_REQUEST['uid'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['uid'] ) ) : '';
			$title  = isset( $_REQUEST['title'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['title'] ) ) : '';
			$upload = isset( $_REQUEST['upload'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['upload'] ) ) : '';
			$data   = array();
			$args   = array(
				'uid'  => $uid,
				'meta' => array(
					'name'   => $title,
					'upload' => $upload,
				),
			);
			$api    = $this->api;
			$data   = $api->update_video_details( $uid, $args );
			wp_send_json_success( $data );
		}
	
		
		/**
		 * AJAX method for logging a HEAP analytics event.
		 *
		 * @since 1.0.0
		 */
		function ajax_sv_cloudflare_stream_analytics() {
			check_ajax_referer( $this->get_nonce(), 'nonce' );
			$event = isset( $_REQUEST['event'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['event'] ) ) : '';
			$data  = array();
			$api   = $this->api;
			$data  = $api->log_event( $event );
			wp_send_json_success( $data );
		}

		
	}