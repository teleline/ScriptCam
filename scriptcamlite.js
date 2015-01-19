//   _____           _       _   _____
//  /  ___|         (_)     | | /  __ \         L.I.T.E
//  \ `--.  ___ _ __ _ _ __ | |_| /  \/
//   `--. \/ __| '__| | '_ \| __| |    / _` | '_ ` _ \
//  /\__/ / (__| |  | | |_) | |_| \__/\ (_| | | | | | |
//  \____/ \___|_|  |_| .__/ \__|\____/\__,_|_| |_| |_|
//                  | |
//  Version 1.6.0   |_| (c) Tele-Line Videotex Services

// Use jscompress.com to compress this file

;(function($) {
	$.fn.scriptcamlite=function(options) {
		// merge passed options with default values
		var opts=$.extend({}, $.fn.scriptcamlite.defaults, options);
		// off we go
		return this.each(function() {
			data=opts; // pass options to jquery internal data field to make them available to the outside world
			data.path=decodeURIComponent(data.path); // convert URI back to normal string
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				if (data.fileName!='') {
					// check filename
					if (data.fileName != filterCharacters(data.fileName)) {
						data.onError(5,"Illegal filename specified");
						return;
					}
					data.fileName=randomNumber() + "_" + data.fileName;
					data.country=data.country.toLowerCase();
					if (data.country !="europe" && data.country !="usa") {
						data.country="europe";
					}
					if (data.maximumSize < 10) {
						data.maximumSize = 10;
					}
					if (data.maximumSize > 500) {
						data.maximumSize = 500;
					}
					$('body').append('<div style="width: 0; height: 0; overflow: hidden;"><form><input type="file" id="videoupload" accept="video/*" capture></form></div><div id="progressNumber"></div>');
					$('#videoupload').on('change', function(e) {
						e.preventDefault();
						var file = document.getElementById('videoupload').files[0];
						if (file.size > 1000000 * data.maximumSize) {
							data.onError(2,"File too large");
							return;
						}
						var fd = new FormData();
						fd.append("video", file);
						var xhr = new XMLHttpRequest();
						xhr.upload.addEventListener("progress", uploadProgress, false);
						xhr.addEventListener("load", uploadComplete, false);
						xhr.addEventListener("error", uploadFailed, false);
						xhr.addEventListener("abort", uploadCanceled, false);
						xhr.open("POST", "http://"+data.country+".www.scriptcam.com/mobile/upload.cfm?filename=" + data.fileName);
						xhr.send(fd);
					});
					function uploadProgress(evt) {
						if (evt.lengthComputable) {
						  var percentComplete = Math.round(evt.loaded * 100 / evt.total);
						  data.uploadProgress(percentComplete);
						}
						else {
						  data.uploadProgress(0);
						}
					}
					function uploadComplete(evt) {
						data.fileConversionStarted(evt.target.response);
						checkServerForFile(data.country,evt.target.response);
					}
					function uploadFailed(evt) {
						data.onError(3,"Upload failed");
					}
					function uploadCanceled(evt) {
						data.onError(4,"Upload cancelled");
					}
					function randomNumber() {
						var low=1000000;
						var high=9999999;
						return Math.floor(Math.random()* (high-low)) +low;
					}
					function filterCharacters(str) {
						var filter="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_";
						var char_array = new Array ();
						for (var i = 0; i < str.length; i ++) {
							var cc = str.charAt (i);
							if (filter.indexOf (cc) != - 1)	{
								char_array.push (cc);
							}
						}
						return char_array.join ('');
					};					
					function checkServerForFile(country,fileName) {                
					   $.ajax({
							type:"HEAD",
							cache: false,
							url: "http://" + country + ".www.scriptcam.com/dwnld/" + fileName + ".mp4",
							success: function (result) {
								data.fileReady("http://"+country+".www.scriptcam.com/dwnld/"+fileName+".mp4");
							},
							error:function (xhr, ajaxOptions, thrownError){
								setTimeout(function() {
									checkServerForFile(country,fileName);
								}, 2000)
							}
						});
					}
					
				}
				else {
					$('body').append('<div style="width: 0; height: 0; overflow: hidden;"><form><input type="file" id="pictureupload" accept="image/*" capture></form></div>');
					$('#pictureupload').on('change', function(e) {
						 e.preventDefault();
						 if ( this.files && this.files[0] ) {
							var FR= new FileReader();
							FR.onload = function(e) {
							   s=e.target.result;
							   data.onPictureAsBase64(s);
							};       
							FR.readAsDataURL(this.files[0]);
						}
					});
				}
			}
			else {
				data.onError(1,"HTML5 not fully supported");
			}
		});
	};
	
	$.scriptcamlite={};
	
	// outgoing functions
	
	$.scriptcamlite.getFrameAsBase64=function() {
        $('#pictureupload').trigger('click');
	}

	$.scriptcamlite.version=function() {
		return "1.6.0";
	}

	$.scriptcamlite.startRecording=function() {
		$('#videoupload').trigger('click');
	}

	$.scriptcamlite.playMP3=function(value) {
		alert("playMP3 called");
	}

	// set javascript default values
	$.fn.scriptcamlite.defaults={
		maximumSize:500,
		fileName:'',
		country:'europe'
	};
})(jQuery);
