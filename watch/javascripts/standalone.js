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

	socket.on('init', function (data) {
		playbackLog.value = JSON.stringify(data.playback);
		startPlayback.click();
	})
}())