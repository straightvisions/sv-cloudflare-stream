=== SV Cloudflare Stream Video ===
Plugin Name: SV Cloudflare Stream Video
Contributors: matthias-reuter, matthiasbathke, dennisheiden, cloudflare, stevenkword
Donate link: https://straightvisions.com
Tags: video, videos, streaming, cloudflare, wpengine, stream, embed, movies, block-enabled, block
Requires PHP: 7.3
Requires at least: 5.3.2
Tested up to: 6.0.0
Stable tag: 1.9.00
License: GPL2
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0-standalone.html

Fork of the official open source Cloudflare Stream Video plugin.
Cloudflare Stream is an easy-to-use, affordable, on-demand video streaming platform. The Stream video plugin for WordPress lets you upload videos to Cloudflare where they are securely stored and encoded for native streaming directly from the WordPress editor.


== Description ==

* Block native player
* Multiple playback options
* Distribute videos with unique URLs or embed code
* Per minute pricing
* Adaptive bitrate streaming
* Video storage included
* Workflow integration with webhooks
* REST API support

= Improvements =

* Direct upload of videos to Cloudflare stream library.
* Direct selection of Cloudflare stream videos in Gutenberg.
* HLS technology support
* HTML5 Video responsive output
* Shortcode Support for HTML5 video and iframe output.

= Developers =

* This plugin lets you easily add block native videos to your WordPress sites

= Marketers =

* Stream videos natively without ads or recommended videos
* Minimal streaming costs based on engagement and views

= Site Owners =

* Easily add videos to your pages with no technical or video expertise needed

= * Please Note * =

This plugin requires an account on Cloudflare.com to upload and stream videos. Existing Cloudflare Stream users will be able to retrieve videos from their Stream library from the WordPress editor. Currently only users with the "administrator" role can leverage some features.

== Installation ==

1. Signup for a free or paid account on Cloudflare.com
2. Change your DNS settings to Cloudflare
3. Enable Stream from the Cloudflare dashboard
4. Install the Stream for WordPress plugin
5. Add API exchange keys

== Team ==

* Fork Developed and maintenanced by [straightvisions GmbH](https://straightvisions.com). [Original Plugin](https://wordpress.org/plugins/cloudflare-stream/)

== Frequently Asked Questions ==

= Why a fork? =

The [original plugin](https://wordpress.org/plugins/cloudflare-stream/) has not been maintained for some time and now has breaking bugs. We have fixed several bugs based on the original code and added additional improvements.

= Do I need a Cloudflare account to use this plugin? =

Yes. Sign up for a free or paid Cloudflare plan that maps to your site’s domain address. Once your account is activated, you can obtain the API key to enable the plugin.

= Is there a cost to use this plugin? =

Stream charges for storage and views based on minutes. Storage costs $5 per thousand minutes worth of video content. As videos get watched, incremental costs of $1 per thousand minutes viewed apply. These costs are in addition to any other Cloudflare free or paid subscription plan you signed up.

= My site is already connected to Cloudflare, can I use this? =

Yes. If you are already a Stream user you only need to activate the plugin using the API key. If you haven’t enabled Stream yet, login to your Cloudflare account and enable the feature to receive an API activation key for the plugin.

= Can I use this plugin to deliver live streams? =

No. Stream only supports on-demand video streaming.

= How is this different from using an embedded YouTube player link? =

Stream lets you own and control the video viewing experience and is ideal for videos that require a paid subscription.

== Screenshots ==

1. Uploading a video
2. Browsing the Cloudflare Stream Library

== Changelog ==

= 1.9.00 =
* Initial Fork Release by straightvisions

= 1.0.3 =
* TUS uploader fix to support large files.

= 1.0.2 =
* Restores Javascript-based uploader client for TUS protocol for users with the administrator role.

= 1.0.1 =
* Security Patch - Removes Javascript-based uploader client for TUS protocol in preparation for PHP-based client.
* Updates Heap Analytics application ID.

= 1.0 =
* First release of Stream Plugin for WordPress

== Upgrade Notice ==

= 1.9.00 =
Initial Fork Release by straightvisions


== Missing a feature? ==

Please use the plugin support forum here on WordPress.org. We will add your wish - if achievable - on our todo list. Please note that we can not give any time estimate for that list or any feature request.

= Paid Services =
Nevertheless, feel free to contact our [WordPress Agency](https://straightvisions.com) if you have any of the following needs:

* get a customization
* get a feature rapidly / on time
* get a custom WordPress plugin or theme developed to exactly fit your needs.