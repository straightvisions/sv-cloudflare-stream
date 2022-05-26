<?php
	/**
	 * Created by PhpStorm.
	 * User: Dennis
	 * Date: 09-May-22
	 * Time: 14:17
	 */
	
	if($attr['uid']){
		$video = $api->get_video_details( $attr['uid'] );
		$dims = $this->get_video_dims($video);
		?>
		<div class="sv-cloudflare-stream-wrapper alignfull">
			<iframe
				id="stream-<?php echo $attr['uid']; ?>"
				class="sv-cloudflare-stream-iframe"
				src="https://iframe.videodelivery.net/<?php echo $attr['uid']; ?>"
				allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
				allowfullscreen="true"
				width="<?php echo $dims['width'];?>"
				height="<?php echo $dims['height'];?>"
			></iframe>
		</div>
		
	<?php }?>


