<?php
	
	if($attr['uid']){
		$video = $api->get_video_details( $attr['uid'] );
		$dims = $this->get_video_dims($video);
		$align = $attr['align'] ? 'align'.$attr['align'] : '';
		
		?>
		<div class="sv-cloudflare-stream-wrapper <?php echo $align;?>">
			<video
				playsinline
				autoplay
				muted
				loop
				id="stream-<?php echo $attr['uid']; ?>"
				class="sv-cloudflare-stream-html5"
				data-source="<?php echo $attr['uid']; ?>"
			/>
		</div>
		
	<?php }?>


