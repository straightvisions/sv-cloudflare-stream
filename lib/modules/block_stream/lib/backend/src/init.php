<?php
	function sv_cloudflare_stream_register_block() {
		$block_type = plugin_dir_path( __DIR__ ) ;
	
		if ( is_string( $block_type ) && file_exists( $block_type ) ) {
			return register_block_type_from_metadata( $block_type );
		}
		
		return WP_Block_Type_Registry::get_instance()->register( $block_type );
		
	}
	
	add_action( 'init', 'sv_cloudflare_stream_register_block' );