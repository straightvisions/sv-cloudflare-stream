<?php
/*
Version: 1.9.00
Plugin Name: SV Cloudflare Stream
Text Domain: sv_cloudflare_stream
Description: Adds a Gutenberg video block to add Cloudflare streamed videos
Plugin URI: https://straightvisions.com/
Author: straightvisions GmbH, Cloudflare, WP Engine
Author URI: https://straightvisions.com
Domain Path: /languages
License: GPL-3.0-or-later
License URI: https://www.gnu.org/licenses/gpl-3.0-standalone.html
*/
namespace sv_cloudflare_stream;

if(!class_exists('\sv_dependencies\init')){
	require_once( 'lib/core_plugin/dependencies/sv_dependencies.php' );
}

if ( $GLOBALS['sv_dependencies']->set_instance_name( 'SV Cloudflare Stream' )->check_php_version() ) {
	require_once( dirname(__FILE__) . '/init.php' );
} else {
	$GLOBALS['sv_dependencies']->php_update_notification()->prevent_plugin_activation();
}