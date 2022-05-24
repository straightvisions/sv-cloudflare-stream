/* global ajaxurl */
/* global cloudflareStream */

function _load_heap(svCloudflareStream){
	class CloudflareStreamHeapAnalytics {
		constructor( ) {
			jQuery( '#submit' ).on( 'click', function() {
				svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Settings Saved' );
			} );
		}
		
		logEvent( event ) {
			// add through backend settings
			/*if ( svCloudflareStream.options.heap ) {
				return;
			}*/
			
			//console.error( 'Event: ' + event );
			/*
			jQuery.ajax( {
				url: ajaxurl + '?action=cloudflare-stream-analytics',
				method: 'POST',
				data: {
					nonce: svCloudflareStream.nonce,
					event: event,
				},
				error: function( jqXHR, textStatus ) {
					console.error( 'Error: ' + textStatus );
				},
			} );*/
		}
	}
	
	return new CloudflareStreamHeapAnalytics();
}


export default _load_heap;
