<?php
	namespace sv_cloudflare_stream;
	
	class modules extends init {
		public function init() {
			$this->load_module('cloudflare');
			$this->load_module('block_stream');
		}
	}