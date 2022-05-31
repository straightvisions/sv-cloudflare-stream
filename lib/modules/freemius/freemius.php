<?php
namespace sv_cloudflare_stream;

class freemius extends init {
	public function init() {
		global $sv_cloudflare_stream_freemius;

		if ( ! isset( $sv_cloudflare_stream_freemius ) ) {
            $sv_cloudflare_stream_freemius = fs_dynamic_init( array(
                'id'                  => '10439',
                'slug'                => 'sv-cloudflare-stream',
                'type'                => 'plugin',
                'public_key'          => 'pk_717fdb9fb024a4614ebd856cbb954',
                'is_premium'          => false,
                'has_addons'          => false,
                'has_paid_plans'      => false,
                'menu'                => array(
                    'slug'           => 'sv_cloudflare_stream',
                    'parent'         => array(
                        'slug' => 'straightvisions',
                    ),
                ),
            ) );
		}

		do_action( $this->get_root()->get_name().'_freemius_loaded' );
	}
}