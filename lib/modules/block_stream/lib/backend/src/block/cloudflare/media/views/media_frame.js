/* global svCloudflareStream */

const Post = wp.media.view.MediaFrame.Post,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n;
const { __ } = wp.i18n;

/**
 * wp.media.view.MediaFrame.svCloudflareStream
 *
 * The frame for manipulating media on the Edit Post page.
 *
 * @memberOf wp.media.view.MediaFrame
 *
 * @class
 * @augments wp.media.view.MediaFrame.Post
 */

function _load_media_frame(svCloudflareStream){
	return Post.extend( /** @lends @lends svCloudflareStream.media.view.MediaFrame.prototype */{
		initialize: function( options ) {
			this.select = options;
			
			_.defaults( this.options, {
				id: 'cloudflare-stream',
				className: 'cloudflare-stream-media-frame',
				title: 'SV Cloudflare Stream Library',
				multiple: false,
				editing: false,
				state: 'insert',
				metadata: {},
			} );
			
			// Call 'initialize' directly on the parent class.
			Post.prototype.initialize.apply( this, arguments );
		},
		
		/**
		 * Create the default states.
		 */
		createStates: function() {
			const options = this.options;
			
			this.states.add( [
				new Library( {
					id: 'insert',
					title: options.title,
					priority: 20,
					toolbar: 'main-insert',
					menu: false,
					filterable: false,
					searchable: false,
					date: false,
					library: new svCloudflareStream.media.model.Query(null,  _.defaults( {
						type: 'video',
					}, options.library ) ),
					multiple: options.multiple ? 'reset' : false,
					editable: true,
					describe: false,
					
					// If the user isn't allowed to edit fields,
					// can they still edit it locally?
					allowLocalEdits: true,
					
					// Show the attachment display settings.
					displaySettings: false,
					// Update user settings when users adjust the
					// attachment display settings.
					displayUserSettings: false,
					// attachment details
					//display:false,
					
					//AttachmentView: wp.media.view.Attachments.EditSelection,
				} ),
			] );
		},
		
		bindHandlers: function() {
			let handlers, checkCounts;
			
			Post.prototype.bindHandlers.apply( this, arguments );
			//Select.prototype.bindHandlers.apply( this, arguments );
			
			this.on( 'activate', this.activate, this );
			
			// Only bother checking media type counts if one of the counts is zero
			checkCounts = _.find( this.counts, function( type ) {
				return type.count === 0;
			} );
			
			if ( typeof checkCounts !== 'undefined' ) {
				this.listenTo( wp.media.model.Attachments.all, 'change:type', this.mediaTypeCounts );
			}
			
			this.on( 'toolbar:create:main-insert', this.createToolbar, this );
			this.on( 'selection:toggle', this.bindSidebarItems, this );
			
			handlers = {
				toolbar: {
					'main-insert': 'mainInsertToolbar',
				},
			};
			
			_.each( handlers, function( regionHandlers, region ) {
				_.each( regionHandlers, function( callback, handler ) {
					this.on( region + ':render:' + handler, this[ callback ], this );
				}, this );
			}, this );
		},
		
		bindSidebarItems: function() {
			jQuery( '.delete-attachment' ).on( 'click', this, this.deleteAttachment );
			jQuery( 'label[data-setting="title"] input' ).on( 'change', this, this.updateAttachment );
		},
		
		/**
		 * @param {Object} event The Delete Event
		 */
		deleteAttachment: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			
			const controller = event.data;
			
			/* eslint-disable */
			if ( window.confirm( l10n.warnDelete ) ) {
				/* eslint-enable */
				const state = controller.state(),
					selection = state.get( 'selection' ),
					attachment = selection.first().toJSON();
				//controller.model.destroy();
				//this.controller.modal.focusManager.focus();
				
				selection.remove( attachment );
				state.trigger( 'delete', attachment ).reset();
			}
		},
		
		/**
		 * @param {Object} event The Update Event
		 */
		updateAttachment: function( event ) {
			event.preventDefault();
			event.stopPropagation();
			
			const controller = event.data;
			const state = controller.state(),
				selection = state.get( 'selection' ),
				attachment = selection.first().toJSON();
			
			// Update the model
			const newTitle = jQuery( 'label[data-setting="title"] input' ).val();
			const data = {
				uid: attachment.uid,
				meta: {
					name: newTitle,
					upload: attachment.cloudflare.meta.upload,
				},
			};
			
			jQuery( '.media-sidebar .spinner' ).css( 'visibility', 'visible' );
			
			jQuery.ajax( {
				url: 'https://api.cloudflare.com/client/v4/accounts/' + svCloudflareStream.api.account + '/media/' + attachment.uid,
				method: 'POST',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				data: JSON.stringify( data ),
				headers: {
					'X-Auth-Email': svCloudflareStream.api.email,
					'X-Auth-Key': svCloudflareStream.api.key,
				},
				success: function() {
					selection.models[ 0 ].set( 'filename', newTitle );
					jQuery( '.media-sidebar .spinner' ).css( 'visibility', 'hidden' );
				},
				error: function( jqXHR, textStatus ) {
					console.error( 'Error: ' + textStatus );
				},
			} );
		},
		
		/**
		 * Render callback for the router region in the `browse` mode.
		 *
		 * @param {wp.media.view.Router} routerView The Router view.
		 */
		browseRouter: function( routerView ) {
			routerView.set( {
				browse: {
					text: this.options.title,
					priority: 40,
				},
			} );
		},
		
		/**
		 * @param {wp.Backbone.View} view Backbone Toolbar view.
		 */
		mainInsertToolbar: function( view ) {
			const controller = this;
			
			view.set({
				cancel: {
					text:     __('Cancel'),
					priority: 20,
					click:    function() {
						document.body.classList.remove('sv_cloudflare_stream_media_library_is_active');
						controller.close();
					}
				},
				
				insert: {
					style: 'primary',
					priority: 80,
					text: 'Select',
					requires: {selection: true},
					click: function () {
						const state = controller.state(),
							selection = state.get('selection'),
							attachment = selection.first().toJSON();
						controller.select(attachment);
						document.body.classList.remove('sv_cloudflare_stream_media_library_is_active');
						controller.close();
						state.trigger('insert', selection).reset();
					},
				},
				
			});
		},
	} );
}

export default _load_media_frame;