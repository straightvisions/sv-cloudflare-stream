/* global svCloudflareStream */

/**
 * svCloudflareStream.media.model.Attachments
 *
 * A collection of Cloudflare Stream attachments.
 *
 * This collection has no persistence with the server without supplying
 * 'options.props.query = true', which will mirror the collection
 * to an Stream Attachments Query collection - @see wp.media.model.Attachments.mirror().
 *
 */
 function _load_attachments(svCloudflareStream){
	return wp.media.model.Attachments.extend( {
		initialize: function() {
			// _.defaults( this.options, {
			// 	orderby: 'date',
			// 	query: true,
			// });
			wp.media.model.Attachments.prototype.initialize.apply( this, arguments );
		},
		
		/**x
		 * If the collection is a query, create and mirror an StreamAttachments StreamQuery collection.
		 *
		 * @access private
		 * @param {bool} refresh Whether or not we should refresh the results.
		 */
		_requery: function( refresh ) {
			let props;
			if ( this.props.get( 'query' ) ) {
				props = this.props.toJSON();
				props.cache = ( true !== refresh );
				this.mirror( svCloudflareStream.media.model.Query.get( this.props.toJSON() ) );
			}
		},
	} );
}

export default _load_attachments;