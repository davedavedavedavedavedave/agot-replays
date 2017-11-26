(function (){
	var playbackLog = document.createElement('textarea');
	playbackLog.name = 'playbackLog';
	playbackLog.className = 'hidden';
	document.body.appendChild(playbackLog);

	var stopPlayback = document.createElement('button');
	stopPlayback.name = 'stopPlayback';
	stopPlayback.className = 'hidden';
	document.body.appendChild(stopPlayback);

	var startPlayback = document.createElement('button');
	startPlayback.name = 'startPlayback';
	startPlayback.className = 'hidden';
	document.body.appendChild(startPlayback);

	var leftHidePlotsLabel = document.createElement('label');
	leftHidePlotsLabel.className = 'changeHiddenState';
	$('.leftPlots')[0].prepend(leftHidePlotsLabel);

	var leftHidePlots = document.createElement('input');
	leftHidePlots.name = 'leftHidePlots';
	leftHidePlots.type = 'checkbox';
	leftHidePlots.checked = true;
	leftHidePlots.className = 'synced hidden';
	leftHidePlotsLabel.appendChild(leftHidePlots);

	var rightHidePlotsLabel = document.createElement('label');
	rightHidePlotsLabel.className = 'changeHiddenState';
	$('.rightPlots')[0].prepend(rightHidePlotsLabel);

	var rightHidePlots = document.createElement('input');
	rightHidePlots.name = 'rightHidePlots';
	rightHidePlots.type = 'checkbox';
	rightHidePlots.checked = true;
	rightHidePlots.className = 'synced hidden';
	rightHidePlotsLabel.appendChild(rightHidePlots);

	var audioTracks = [];

	socket.on('init', function (data) {
		playbackLog.value = JSON.stringify(data.playback);
		startPlayback.click();
		// show audio selection
		audioTracks = data.audio;
		var audioSelection = document.createElement('div');
		audioSelection.className = 'audioSelection';
		audioSelection.innerHTML = '<label>Video Sound <input type="range" name="volume-video" min="0" max="1" step="0.05" value=".5"/>';
		for (var i = 0; i < audioTracks.length; i++) {
			audioTracks[i].ctrls = new Audio(audioTracks[i].src);
			audioSelection.innerHTML += '<label>' + data.audio[i].label + ' <input type="range" name="volume-audio-' + i + '" min="0" max="1" step="0.05" value="0"/>';
		}
		audioSelection.innerHTML += '<button type="button" name="volumes" value="done">Done</button>';
		audioSelection.addEventListener('click', function (e) {
			if (e.target.name === 'volumes') {
				audioSelection.className += ' hide';
			}
		});
		document.body.appendChild(audioSelection);
	});

	socket.on('update', function (data) {
		var key = data.key;
		var val = data.val;
		if (key === 'video.playState' && val === 'play') {
			socket.emit('set', {
				key: 'video.volume',
				val: document.querySelector('.audioSelection input[name="volume-video"]').value
			});
			var volumes = document.querySelectorAll('.audioSelection input[name^="volume-audio-"]');
			for (var i = 0; i < volumes.length; i++) {
				if (volumes[i].value !== "0") {
					audioTracks[i].ctrls.volume = volumes[i].value;
					console.log(new Date());
					audioTracks[i].ctrls.addEventListener('playing', () => console.log(new Date()));
					audioTracks[i].ctrls.play();
				} 
			}
		} else {
			if (key === 'video.playState' && val === 'pause') {
				for (var i = 0; i < audioTracks.length; i++) {
					if (audioTracks[i].ctrls) {
						audioTracks[i].ctrls.pause();
					} 
				}
			}
		}
	})
}())