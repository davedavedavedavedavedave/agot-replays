(function () {
	// Handling button clicks
	document.body.addEventListener('click', function (e) {
		// Start recording
		if (e.target.name === 'startRecording') {
			controller.record.start();
			e.target.setAttribute('disabled', true);
			$('[name="stopRecording"]')[0].removeAttribute('disabled');
			$('[name="recordingLog"]')[0].setAttribute('readonly', true);
		} else
		// Stop recording
		if (e.target.name === 'stopRecording') {
			$('[name="recordingLog"]')[0].value = JSON.stringify(controller.record.stop());
			e.target.setAttribute('disabled', true);
			$('[name="startRecording"]')[0].removeAttribute('disabled');
			$('[name="recordingLog"]')[0].removeAttribute('readonly');
		} else
		// start playback
		if (e.target.name === 'startPlayback') {
			controller.playback.start(JSON.parse($('[name="playbackLog"]')[0].value));
			e.target.setAttribute('disabled', true);
			$('[name="stopPlayback"]')[0].removeAttribute('disabled');
			$('[name="playbackLog"]')[0].setAttribute('readonly', true);
		} else
		// stop playback
		if (e.target.name === 'stopPlayback') {
			controller.playback.stop();
			e.target.setAttribute('disabled', true);
			$('[name="startPlayback"]')[0].removeAttribute('disabled');
			$('[name="playbackLog"]')[0].removeAttribute('readonly');
		}
	});

	var controller = (function(socket) {
		var startTime, pauseOffset;
		var playStateHandler = function (data) {
			if (data.key === 'video.playState') {
				if (data.val === 'play') {
					if (startTime < 0) {
						startTime = Date.now();
					}
				} else if (data.val === 'pause') {
					if (startTime >= 0) {
						pauseOffset += Date.now() - startTime;
						startTime = -1;
					}
				}
			}
		};
		socket.on('update', playStateHandler);

		return {
			record: (function () {
				var log;
				var handler = function (data) {
					if (data.key.indexOf('video.') !== 0) {
						var timestamp = pauseOffset;
						if (startTime >= 0) {
							timestamp += Date.now() - startTime;
						}
						log.push({
							offset: timestamp,
							data: data
						});
					}
				};
				return {
					start: function () {
						startTime = -1;
						pauseOffset = 0;
						log = [];
						socket.on('update', handler);
					},
					stop: function () {
						socket.off('update', handler);
						return log;
					}
				};
			})(),
			playback: (function () {
				var timeouts = [], playbackLog;
				var createEmitter = function (data) {
					return function () {
						socket.emit('set', data);
					}
				};
				var handler = function (data) {
					if (data.key === 'video.playState') {
						if (data.val === 'play') {
							// start timeouts
							for (var i = 0; i < playbackLog.length; i++) {
								if (playbackLog[i].offset - pauseOffset >= 0) {
									timeouts.push(
										window.setTimeout(createEmitter(playbackLog[i].data), playbackLog[i].offset - pauseOffset)
									);
								}
							}
						} else if (data.val === 'pause') {
							// clear timeouts
							for (var i = 0; i < timeouts.length; i++) {
								window.clearTimeout(timeouts[i]);
							}
							timeouts = [];
						}
					}
				};
				return {
					start: function (log) {
						startTime = -1;
						pauseOffset = 0;
						playbackLog = log;
						for (var i = 0; i < timeouts.length; i++) {
							window.clearTimeout(timeouts[i]);
						}
						timeouts = [];
						socket.on('update', handler);
					},
					stop: function () {
						for (var i = 0; i < timeouts.length; i++) {
							window.clearTimeout(timeouts[i]);
						}
						socket.off('update', handler);
					}
				};
			})()
		}
	})(synced.getSocket());
})();