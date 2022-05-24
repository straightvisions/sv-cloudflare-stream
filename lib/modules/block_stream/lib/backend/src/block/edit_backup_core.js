import svCloudflareStream from "./cloudflare/svCloudflareStream";
import {video as icon} from "@wordpress/icons/build-types/index";
import classnames from "classnames/index";

function VideoEditX( {
	                     isSelected,
	                     noticeUI,
	                     attributes,
	                     className,
	                     setAttributes,
	                     insertBlocksAfter,
	                     onReplace,
	                     noticeOperations,
                     } ) {
	
	const instanceId = useInstanceId( VideoEdit );
	const videoPlayer = useRef();
	const posterImageButton = useRef();
	const { id, caption, controls, poster, src, autoplay, loop, muted, tracks } = attributes;
	console.log(attributes);
	const isTemporaryVideo = ! id && isBlobURL( src );
	const mediaUpload = useSelect(
		( select ) => select( blockEditorStore ).getSettings().mediaUpload,
		[]
	);
	
	const mediaFrame = new svCloudflareStream.media.view.MediaFrame(onSelectVideo);
	
	useEffect( () => {
		if ( ! id && isBlobURL( src ) ) {
			const file = getBlobByURL( src );
			if ( file ) {
				mediaUpload( {
					filesList: [ file ],
					onFileChange: ( [ media ] ) => onSelectVideo( media ),
					onError: ( message ) => {
						noticeOperations.createErrorNotice( message );
					},
					allowedTypes: ALLOWED_MEDIA_TYPES,
				} );
			}
		}
	}, [] );
	
	useEffect( () => {
		// Placeholder may be rendered.
		console.log(videoPlayer);
		/*if ( videoPlayer.current ) {
			videoPlayer.current.load();
		}*/
	}, [ poster ] );
	
	function onSelectVideo( media ) {
		if ( ! media || ! media.url ) {
			// In this case there was an error
			// previous attributes should be removed
			// because they may be temporary blob urls.
			setAttributes( {
				src: undefined,
				id: undefined,
				poster: undefined,
			} );
			return;
		}
		
		// Sets the block's attribute and updates the edit component from the
		// selected media.
		setAttributes( {
			src: media.id, // src = remote id
			//id: media.id,
			poster:
				media.image?.src !== media.icon ? media.image?.src : undefined,
		} );
	}
	/*
	function onSelectURL( newSrc ) {
		
		if ( newSrc !== src ) {
			// Check if there's an embed block that handles this URL.
			const embedBlock = createUpgradedEmbedBlock( {
				attributes: { url: newSrc },
			} );
			
			const embedBlock = undefined;
			if ( undefined !== embedBlock ) {
				onReplace( embedBlock );
				return;
			}
			console.log(newSrc);
			
			setAttributes( { src: newSrc, id: undefined, poster: undefined } );
		}
	}*/
	
	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}
	
	const classes = classnames( className, {
		'is-transient': isTemporaryVideo,
	} );
	
	const blockProps = useBlockProps( {
		className: classes,
	} );
	
	
	// stream lib functions ----------------------------------------------------------------------
	function openMediaLib(){
		const block = this;
		
		mediaFrame.open();
		
		mediaFrame.on( 'delete', function( attachment ) {
			block.delete( attachment );
		} );
		mediaFrame.on( 'select', function() {
			block.select();
		} );
	}
	
	
	
	
	// stream lib functions ----------------------------------------------------------------------
	function onSelectPoster( image ) {
		setAttributes( { poster: image.url } );
	}
	
	function onRemovePoster() {
		setAttributes( { poster: undefined } );
		
		// Move focus back to the Media Upload button.
		posterImageButton.current.focus();
	}
	
	const videoPosterDescription = `video-block__poster-image-description-${ instanceId }`;
	
	
	if ( ! src ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ <BlockIcon icon={ icon } /> }
					label="Cloudflare Stream"
					instructions="Select a file from your library."
				>
					<MediaUpload
						type="video"
						className={ className }
						value={ attributes }
						render={ () => (
							<Button
								variant="secondary"
								isLarge
								label={ __( 'Stream Library' ) }
								onClick={ openMediaLib }
								className="editor-media-placeholder__browse-button"
							>
								{ __( 'Stream Library' ) }
							</Button>
						) }
					/>
				</Placeholder>
				{/*
				<MediaPlaceholder
					icon={ <BlockIcon icon={ icon } /> }
					onSelect={ onSelectVideo }
					onSelectURL={ onSelectURL }
					accept="video/*"
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					value={ attributes }
					notices={ noticeUI }
					onError={ onUploadError }
				/>
				*/}
			</div>
		);
	}
	
	useEffect(() => {
		var hls = new Hls();
		console.log(src);
		//hls.loadSource('https://videodelivery.net/'+src+'/manifest/video.m3u8');
		//hls.attachMedia(document.getElementById('stream-'+src));
	}, []);
	
	return (
		<>
			<BlockControls group="block">
				<TracksEditor
					tracks={ tracks }
					onChange={ ( newTracks ) => {
						setAttributes( { tracks: newTracks } );
					} }
				/>
			</BlockControls>
			<BlockControls group="other">
				<Button
					variant="secondary"
					isLarge
					label={ __( 'Stream Library' ) }
					onClick={ openMediaLib }
					className="editor-media-placeholder__browse-button"
				>
					{ __( 'Stream Library' ) }
				</Button>
			
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<VideoCommonSettings
						setAttributes={ setAttributes }
						attributes={ attributes }
					/>
					<MediaUploadCheck>
						<BaseControl className="editor-video-poster-control">
							<BaseControl.VisualLabel>
								{ __( 'Poster image' ) }
							</BaseControl.VisualLabel>
							<MediaUpload
								title={ __( 'Select poster image' ) }
								onSelect={ onSelectPoster }
								allowedTypes={
									VIDEO_POSTER_ALLOWED_MEDIA_TYPES
								}
								render={ ( { open } ) => (
									<Button
										variant="primary"
										onClick={ open }
										ref={ posterImageButton }
										aria-describedby={
											videoPosterDescription
										}
									>
										{ ! poster
											? __( 'Select' )
											: __( 'Replace' ) }
									</Button>
								) }
							/>
							<p id={ videoPosterDescription } hidden>
								{ poster
									? sprintf(
										/* translators: %s: poster image URL. */
										__(
											'The current poster image url is %s'
										),
										poster
									)
									: __(
										'There is no poster image currently selected'
									) }
							</p>
							{ !! poster && (
								<Button
									onClick={ onRemovePoster }
									variant="tertiary"
								>
									{ __( 'Remove' ) }
								</Button>
							) }
						</BaseControl>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>
			<figure { ...blockProps }>
				{ /*
					Disable the video tag if the block is not selected
					so the user clicking on it won't play the
					video when the controls are enabled.
				*/ }
				<Disabled isDisabled={ ! isSelected }>
					{/* HTML5 Player - https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ */ }
					<video
						id={'stream-'+src}
						controls={ controls }
						poster={ poster }
						src={ 'https://videodelivery.net/' + src }
						ref={ videoPlayer }
					>
						<Tracks tracks={ tracks } />
					</video>
					
					{/* cloudflare stream player - https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/*/}
					<iframe
						src={ 'https://iframe.videodelivery.net/' + src }
						controls={ controls }
						autoPlay={ autoplay }
						loop={ loop }
						muted={ muted }
						ref={ videoPlayer }
					/>
				</Disabled>
				{ isTemporaryVideo && <Spinner /> }
				{ ( ! RichText.isEmpty( caption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						aria-label={ __( 'Video caption text' ) }
						placeholder={ __( 'Add caption' ) }
						value={ caption }
						onChange={ ( value ) =>
							setAttributes( { caption: value } )
						}
						inlineToolbar
						__unstableOnSplitAtEnd={ () =>
							insertBlocksAfter( createBlock( 'core/paragraph' ) )
						}
					/>
				) }
			</figure>
		</>
	);
}