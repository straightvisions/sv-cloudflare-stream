<?php
/**
 * Plugin Name: SV Cloudflare Stream
 * Plugin URI: https://github.com/straightvisions/sv-cloudflare-stream
 * Description: Cloudflare Stream Video is an easy-to-use, affordable, on-demand video streaming platform. Stream seamlessly integrates video storage, encoding, and a customizable player with Cloudflare’s fast, secure, and reliable global network, so that you can spend less time managing video delivery and more time building and promoting your product.
 * Author: Cloudflare, straightvisions GmbH
 * Author URI: https://www.cloudflare.com/products/cloudflare-stream/
 * Version: 1.0.6f
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package cloudflare-stream
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cloudflare Stream Settings Page
 */
require_once plugin_dir_path( __FILE__ ) . 'src/inc/class-cloudflare-stream-settings.php';

/**
 * Cloudflare Stream API
 */
require_once plugin_dir_path( __FILE__ ) . 'src/inc/class-cloudflare-stream-api.php';

/**
 * Cloudflare Stream Shortcode
 */
require_once plugin_dir_path( __FILE__ ) . 'src/inc/class-cloudflare-stream-shortcode.php';

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
	
	
	<?php
/*
Version: 1.8.00
Plugin Name: SV Econos Custom
Text Domain: sv_econos_custom
Description: Customer specific features which are too small and specific to worth an own plugin.
Plugin URI: https://straightvisions.com/
Author: straightvisions GmbH
Author URI: https://straightvisions.com
Domain Path: /languages
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0-standalone.html
*/

namespace sv_econos_custom;

if(!class_exists('\sv_dependencies\init')){
	require_once( 'lib/core_plugin/dependencies/sv_dependencies.php' );
}

if ( $GLOBALS['sv_dependencies']->set_instance_name( 'SV Econos Custom' )->check_php_version() ) {
	require_once( dirname(__FILE__) . '/init.php' );
} else {
	$GLOBALS['sv_dependencies']->php_update_notification()->prevent_plugin_activation();
}