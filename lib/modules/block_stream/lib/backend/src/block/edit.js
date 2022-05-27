/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
const { getBlobByURL, isBlobURL } = wp.blob;
const {
	BaseControl,
	Button,
	Disabled,
	PanelBody,
	Spinner,
	withNotices,
	Placeholder,
	FormFileUpload,
	Toolbar,
	ToggleControl,
} = wp.components;
const {
	BlockControls,
	BlockIcon,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
	MediaReplaceFlow,
	RichText,
	useBlockProps,
	store,
} = wp.blockEditor;
const blockEditorStore = store;

const { useRef, Fragment, Component, createRef, useEffect } = wp.element;
const { __, sprintf } = wp.i18n;
const { useInstanceId } = wp.compose;
const { useSelect } = wp.data;

import { video as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */

/* Necessary to use TUS protocol for uploads */
import * as tus from 'tus-js-client';

//import { createUpgradedEmbedBlock } from '../embed/util';
import VideoCommonSettings from './edit-common-settings';
import TracksEditor from './tracks-editor';
import Tracks from './tracks';

const ALLOWED_MEDIA_TYPES = [ 'video' ];
const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = [ 'image' ];

import svCloudflareStream from './cloudflare/svCloudflareStream.js';
// https://www.npmjs.com/package/react-hls-player
import Player from './player/hls.js';


class CloudflareStreamEdit extends Component {
	constructor( instanceId ) {
		super( ...arguments );
	
		this.state = {
			editing: ! this.props.attributes.uid,
			uploading: false,
			encoding: this.props.attributes.uid && ! this.props.attributes.thumbnail,
			resume: true,
		};
		
		this.instanceId = instanceId.clientId;
		this.controller = this;
		this.streamPlayer = createRef();
		this.toggleAttribute = this.toggleAttribute.bind( this );
		this.open = this.open.bind( this );
		this.select = this.select.bind( this );
		//this.mediaFrame = new cloudflareStream.media.view.MediaFrame( this.select );
		this.mediaFrame = new svCloudflareStream.media.view.MediaFrame(this.select);
		this.encodingPoller = false;
	}
	
	componentDidMount() {
		const { attributes } = this.props;
		
		if ( attributes.uid !== false && attributes.thumbnail === false ) {
			this.switchToEncoding();
		} else {
			this.reload();
		}
	}
	
	componentDidUpdate() {
		// obsolete?
		/*
		const { attributes } = this.props;
		const streamPlayer = this.streamPlayer.current;
		
		if ( streamPlayer !== null && streamPlayer.play !== null ) {
			streamPlayer.autoPlay = attributes.autoplay;
			streamPlayer.controls = attributes.controls;
			streamPlayer.mute = attributes.mute;
			streamPlayer.loop = attributes.loop;
			streamPlayer.controls = attributes.controls;
			
			if ( attributes.autoplay && typeof streamPlayer.play === 'function' ) {
				streamPlayer.play();
			} else if ( typeof streamPlayer.pause === 'function' ) {
				streamPlayer.pause();
			}
		}
		
		if ( false !== attributes.uid ) {
			jQuery( '#block-' + this.instanceId + ' .editor-media-placeholder__cancel-button' ).show();
			this.reload();
		}
		*/
	}
	
	toggleAttribute( attribute ) {
		const { setAttributes } = this.props;
		return ( newValue ) => {
			setAttributes( { [ attribute ]: newValue } );
		};
	}
	
	open() {
		const block = this;
		
		this.mediaFrame.open();
		
		this.mediaFrame.on( 'delete', function( attachment ) {
			block.delete( attachment );
		} );
		this.mediaFrame.on( 'select', function() {
			block.select();
		} );
	}
	
	select( attachment ) {
		const { setAttributes } = this.props;
		setAttributes( { uid: attachment.uid, thumbnail: attachment.thumb.src } );
		this.setState( { editing: false, uploading: false, encoding: false } );
		svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Added to blog post' );
		this.reload();
	}
	
	delete( attachment ) {
		jQuery.ajax( {
			url: ajaxurl + '?action=sv-cloudflare-stream-delete',
			data: {
				nonce: svCloudflareStream.nonce,
				uid: attachment.uid,
			},
			success: function() {
				jQuery( 'li[data-id="' + attachment.id + '"]' ).hide();
			},
			error: function( jqXHR, textStatus ) {
				console.error( 'Error: ' + textStatus );
				svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Error' );
			},
		} );
	}
	
	update( attachment ) {
		jQuery( '.settings-save-status .media-frame .spinner' ).css( 'visibility', 'visible' );
		jQuery.ajax( {
			url: ajaxurl + '?action=sv-cloudflare-stream-update',
			method: 'POST',
			data: {
				nonce: svCloudflareStream.nonce,
				uid: attachment.uid,
				title: attachment.title,
			},
			success: function() {
				jQuery( 'li[data-id="' + attachment.id + '"]' ).hide();
			},
			error: function( jqXHR, textStatus ) {
				console.error( 'Error: ' + textStatus );
				svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Error' );
			},
		} );
	}
	
	reload() {
		const { attributes } = this.props;
		const link = 'https://embed.videodelivery.net/embed/r4xu.fla9.latest.js?video=' + attributes.uid;
		
		jQuery.getScript( link ).fail( function( jqxhr, settings, exception ) {
			console.error( 'Exception:' + exception );
		} );
	}
	
	uploadFromFiles( file ) {
		const block = this;
		const { setAttributes } = this.props;
		
		const progressBar = jQuery( '#progressbar-' + this.instanceId );
		const progressLabel = jQuery( '.progress-label-' + this.instanceId );
		const val = progressBar.progressbar( 'value' ) || 0;
		
		progressBar.progressbar( 'value', val );
		
		const baseUrl = 'https://api.cloudflare.com/client/v4/accounts/' + svCloudflareStream.api.account + '/media';
		
		svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Started uploading a video' );
		const upload = new tus.Upload( file, {
			resume: block.state.resume,
			removeFingerprintOnSuccess: true,
			endpoint: baseUrl,
			retryDelays: [ 0, 1000, 3000, 5000 ],
			headers: {
				'X-Auth-Email': svCloudflareStream.api.email,
				'X-Auth-Key': svCloudflareStream.api.key,
			},
			metadata: {
				name: file.name,
				type: file.type,
			},
			onError: function( error ) {
				console.error( 'Error: ' + error );
				progressBar.hide();
				jQuery( '.editor-media-placeholder .components-placeholder__instructions' ).html( 'Upload Error: See the console for details.' );
				jQuery( '.editor-media-placeholder__retry-button' ).show();
				svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Error' );
			},
			onProgress: function( bytesUploaded, bytesTotal ) {
				const percentage = parseInt( bytesUploaded / bytesTotal * 100 );
				
				progressLabel.text( percentage + '%' );
				progressBar.progressbar( 'option', 'value', percentage );
			},
			onSuccess: function() {
				const urlArray = upload.url.split( '/' );
				const mediaId = urlArray[ urlArray.length - 1 ];
				
				setAttributes( { uid: mediaId, fingerprint: upload.options.fingerprint( upload.file, upload.options ) } );
				svCloudflareStream.analytics.logEvent( 'Stream WP Plugin - Finished uploading a video' );
				block.switchToEncoding();
			},
		} );
		//Start the upload
		upload.start();
	}
	
	switchToEncoding() {
		const block = this;
		block.setState(
			{ editing: true, uploading: false, encoding: true },
			() => {
				const progressBar = jQuery( '#progressbar-' + this.instanceId );
				const progressLabel = jQuery( '.progress-label-' + this.instanceId );
				jQuery( '.editor-media-placeholder .components-placeholder__instructions' ).html( 'Upload Complete. Processing video.' );
				
				progressLabel.text( '' );
				progressBar.progressbar( {
					value: false,
				} );
				block.encode();
			}
		);
	}
	
	encode() {
		const { attributes, setAttributes } = this.props;
		const block = this;
		const progressBar = jQuery( '#progressbar-' + this.instanceId );
		const progressLabel = jQuery( '.progress-label-' + this.instanceId );
		
		const { file } = this.props.attributes;
		
		jQuery.ajax( {
			url: ajaxurl + '?action=sv-cloudflare-stream-check-upload',
			data: {
				nonce: svCloudflareStream.nonce,
				uid: attributes.uid,
			},
			success: function( data ) {
				if ( ! data.success ) {
					console.error( 'Error: ' + data.data );
					if ( block.state.resume === true ) {
						block.setState(
							{ resume: false },
						);
						jQuery( '.editor-media-placeholder .components-placeholder__instructions' ).html( 'Uploading your video.' );
						block.uploadFromFiles( file );
					} else {
						progressBar.hide();
						jQuery( '.editor-media-placeholder .components-placeholder__instructions' ).html( 'Processing Error: ' + data.data );
						jQuery( '.editor-media-placeholder__retry-button' ).show();
					}
				} else if ( typeof data.data !== 'undefined' ) {
					if ( data.data.readyToStream === true && typeof data.data.thumbnail !== 'undefined' ) {
						clearTimeout( block.encodingPoller );
						setAttributes( { thumbnail: data.data.thumbnail } );
						block.setState( { editing: false, uploading: false, encoding: false } );
					} else {
						// Poll at a 5 second interval
						block.encodingPoller = setTimeout( function() {
							block.encode();
						}, 5000 );
					}
					if ( data.data.status.state === 'queued' ) {
						progressLabel.text( '' );
						progressBar.progressbar( {
							value: false,
						} );
					} else if ( data.data.status.state === 'inprogress' ) {
						const progress = Math.round( data.data.status.pctComplete );
						progressLabel.text( progress + '%' );
						
						progressBar.progressbar( {
							value: progress,
						} );
					}
					block.reload();
				}
			},
			error: function( jqXHR, textStatus ) {
				console.error( 'Error: ' + textStatus );
			},
		} );
	}
	
	render() {
		const {
			uid,
			autoplay,
			controls,
			loop,
			muted,
			playsInline
		} = this.props.attributes;
		
		let { setAttributes } = this.props;
		
		const { className,isSelected } = this.props;
		const { editing, uploading, encoding } = this.state;
		
		const switchToEditing = () => {
			this.setState( { editing: true } );
			this.setState( { uploading: false } );
			this.setState( { encoding: false } );
		};
		
		const switchFromEditing = () => {
			this.setState( { editing: false } );
			this.setState( { uploading: false } );
			this.setState( { encoding: false } );
		};
		
		const switchToUploading = () => {
			let { setAttributes } = this.props;
			
			jQuery( '.editor-media-placeholder .components-placeholder__instructions' ).html( 'Processing your video' );
			
			const file = jQuery( '.components-form-file-upload :input[type=\'file\']' )[ 0 ].files[ 0 ];
			setAttributes( { file: file } );
			
			const block = this;
			block.setState(
				{ editing: true, uploading: true, encoding: false },
				() => {
					const progressBar = jQuery( '#progressbar-' + this.instanceId );
					
					progressBar.progressbar( {
						value: false,
					} );
					block.uploadFromFiles( file );
				}
			);
		};
		
		if ( editing ) {
			if ( uploading ) {
				const progressBarStyle = {
					width: '100%',
				};
				return (
					<Placeholder
						icon={ svCloudflareStream.icon }
						label="Cloudflare Stream"
						instructions="Uploading your video."
						className="editor-media-placeholder"
					>
						<div id={ 'progressbar-' + this.instanceId } style={ progressBarStyle }>
							<div className={ 'progress-label progress-label-' + this.instanceId }>Connecting...</div>
						</div>
						<Button
							variant="tertiary"
							isDefault
							isLarge
							icon="update"
							label={ __( 'Retry' ) }
							onClick={ switchToEditing }
							style={ { display: 'none' } }
							className="editor-media-placeholder__retry-button"
						>
							{ __( 'Retry' ) }
						</Button>
					</Placeholder>
				);
			} else if ( encoding ) {
				const progressBarStyle = {
					width: '100%',
				};
				return (
					<Placeholder
						icon={ svCloudflareStream.icon }
						label="Cloudflare Stream"
						instructions="Processing your video."
						className="editor-media-placeholder"
					>
						<div id={ 'progressbar-' + this.instanceId } style={ progressBarStyle }>
							<div className={ 'progress-label progress-label-' + this.instanceId }>Connecting...</div>
						</div>
						<Button
							variant="tertiary"
							isDefault
							isLarge
							icon="update"
							label={ __( 'Retry' ) }
							onClick={ switchToEditing }
							style={ { display: 'none' } }
							className="editor-media-placeholder__retry-button"
						>
							{ __( 'Retry' ) }
						</Button>
					</Placeholder>
				);
			}
			
			if ( ! svCloudflareStream.api.key || '' === svCloudflareStream.api.key ) {
				return (
					<Placeholder
						icon={ svCloudflareStream.icon }
						label="Cloudflare Stream"
						instructions="Select a file from your library."
					>
						<MediaUpload
							type="video"
							className={ className }
							value={ this.props.attributes }
							render={ () => (
								<Button
									isLarge
									variant="secondary"
									label={ __( 'Stream Library' ) }
									onClick={ this.open }
									className="editor-media-placeholder__browse-button"
								>
									{ __( 'Stream Library' ) }
								</Button>
							) }
						/>
						<Button
							isDefault
							isLarge
							variant="tertiary"
							label={ __( 'Cancel' ) }
							onClick={ switchFromEditing }
							style={ { display: 'none' } }
							className="editor-media-placeholder__cancel-button"
						>
							{ __( 'Cancel' ) }
						</Button>
					</Placeholder>
				);
			}
			
			return (
				<Placeholder
					icon={ svCloudflareStream.icon }
					label="Cloudflare Stream"
					instructions="Select a file from your library."
				>
					<FormFileUpload
						isLarge
						variant="primary"
						multiple
						className="editor-media-placeholder__upload-button"
						onChange={ switchToUploading }
						accept="video/*"
					>
						{ __( 'Upload' ) }
					</FormFileUpload>
					<MediaUpload
						type="video"
						className={ className }
						value={ this.props.attributes }
						render={ () => (
							<Button
								variant="secondary"
								isLarge
								label={ __( 'Stream Library' ) }
								onClick={ this.open }
								className="editor-media-placeholder__browse-button"
							>
								{ __( 'Stream Library' ) }
							</Button>
						) }
					/>
					<Button
						variant="tertiary"
						isDefault
						isLarge
						label={ __( 'Cancel' ) }
						onClick={ switchFromEditing }
						style={ { display: 'none' } }
						className="editor-media-placeholder__cancel-button"
					>
						{ __( 'Cancel' ) }
					</Button>
				</Placeholder>
			);
		}
		
		return (
			<Fragment>
				<BlockControls>
					<Toolbar label="Options">
						<Button
							className="components-icon-button components-toolbar__control"
							label={ __( 'Edit video' ) }
							onClick={ switchToEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Video Settings' ) }>
						<ToggleControl
							label={ __( 'Autoplay' ) }
							onChange={ (val) => { setAttributes({autoplay:val}) } }
							checked={ autoplay }
						/>
						<ToggleControl
							label={ __( 'Loop' ) }
							onChange={ (val) => { setAttributes({loop:val}) } }
							checked={ loop }
						/>
						<ToggleControl
							label={ __( 'Muted' ) }
							onChange={ (val) => { setAttributes({muted:val}) } }
							checked={ muted }
						/>
						<ToggleControl
							label={ __( 'Playback controls' ) }
							onChange={ (val) => { setAttributes({controls:val}) } }
							checked={ controls }
						/>
						<ToggleControl
							label={ __( 'Play inline' ) }
							onChange={ (val) => { setAttributes({playsInline:val}) } }
							checked={ playsInline }
						/>
						
					</PanelBody>
				</InspectorControls>
				<figure className={ 'sv-cloudflare-stream-wrapper ' + className }>
					<Disabled isDisabled={ ! isSelected }>
						{
							<Player src={'https://videodelivery.net/' + uid + '/manifest/video.m3u8'} />
						}
					</Disabled>
					
				</figure>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default withNotices( CloudflareStreamEdit );
