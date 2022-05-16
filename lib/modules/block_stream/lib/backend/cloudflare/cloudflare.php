<?php
	
	namespace sv_cloudflare_stream;

	class Cloudflare{
		
		public function init(){
			add_action( 'wp_ajax_query-cloudflare-stream-attachments', array($this, 'action_wp_ajax_query_cloudflare_stream_attachments') );
		}
		
		function action_wp_ajax_query_cloudflare_stream_attachments() {
			check_ajax_referer( Cloudflare_Stream_Settings::NONCE, 'nonce' );
			$api            = Cloudflare_Stream_API::instance();
			$args['query']  = isset( $_REQUEST['query'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['query'] ) ) : '';
			$args['query'] .= '&limit=' . $api->api_limit;
			
			$data   = array();
			$videos = $api->get_videos( $args );
			
			foreach ( $videos->result as $video ) {
				$datetime = new DateTime( $video->created );
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
							'delete' => Cloudflare_Stream_Settings::NONCE,
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
	}