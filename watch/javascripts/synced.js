function onYouTubeIframeAPIReady() {synced.YTReady()}
// init websocket
var socket = io.connect('http://localhost:8081');
var synced = (function () {
	var cards = [
			{"name": "none", "faction_code": "none", "type_code": "faction", "code": "none"},
			{"name": "Baratheon", "faction_code": "baratheon", "localsrc": "/baratheon.jpg", "type_code": "faction", "code": "faction-baratheon"},
			{"name": "Greyjoy", "faction_code": "greyjoy", "localsrc": "/greyjoy.jpg", "type_code": "faction", "code": "faction-greyjoy"},
			{"name": "Lannister", "faction_code": "lannister", "localsrc": "/lannister.jpg", "type_code": "faction", "code": "faction-lannister"},
			{"name": "Martell", "faction_code": "martell", "localsrc": "/martell.jpg", "type_code": "faction", "code": "faction-martell"},
			{"name": "Night\'s Watch", "faction_code": "thenightswatch", "localsrc": "/thenightswatch.jpg", "type_code": "faction", "code": "faction-thenightswatch"},
			{"name": "Stark", "faction_code": "stark", "localsrc": "/stark.jpg", "type_code": "faction", "code": "faction-stark"},
			{"name": "Targaryen", "faction_code": "targaryen", "localsrc": "/targaryen.jpg", "type_code": "faction", "code": "faction-targaryen"},
			{"name": "Tyrell", "faction_code": "tyrell", "localsrc": "/tyrell.jpg", "type_code": "faction", "code": "faction-tyrell"}
		],
		hls
		cardCBs = [],
		ret = {
			getCards: function (cb) {
				cardCBs.push(cb);
			},
			getSocket: function () {
				return socket;
			},
			YTReady: function () {
				for (var i = 0; i < YTReadyListeners.length; i++) {
					YTReadyListeners[i]();
				}
				afterYTReady = function (cb) { cb(); };
			}
		},
		YTReadyListeners = [],
		afterYTReady = function (cb) {
			YTReadyListeners.push(cb);
		};

	// load cards
	ajax('cards.json', function (data) {
		cards = cards.concat(JSON.parse(data));

		ret.getCards = function (cb) {
			cb(cards);
		}
		for (var i = 0; i < cardCBs.length; i++) {
			cardCBs[i](cards);
		}
	})

	// handle clicks on "synced" elements
	document.body.addEventListener('click', function (e) {
		if (hasClass(e.target, 'synced')) {
			// Play or Pause button clicked
			if (e.target.name === 'playState') {
				socket.emit('set', {
					key: 'video.playState',
					val: e.target.value
				});
			} else
			// move card from list to list
			if (e.target.name === 'moveCard') {
				if (e.target.getAttribute('data-listName').length > 0) {
					socket.emit('set', {
						key: 'cards.' + e.target.getAttribute('data-listName') + '.' + findParent(e.target, '[data-cardIdx]').getAttribute('data-cardIdx'),
						val: null
					});
				}
				var moveTarget = e.target.nextSibling;
				if (moveTarget && moveTarget.value.length > 0) {
					socket.emit('set', {
						key: 'cards.' + moveTarget.value + '.' + cards.find(item => item.code === '01065').label.toLowerCase().replace(/[^a-z()]/g, '-') + Date.now(),
						val: e.target.value
					});
				}
			} else
			// Remove card from list
			if (e.target.name === 'expandCard') {
				socket.emit('set', {
					key: 'cards.' + e.target.getAttribute('data-listName') + '.' + e.target.value + '.expanded',
					val: true
				});
			} else
			// Remove card from list
			if (e.target.name === 'collapseCard') {
				socket.emit('set', {
					key: 'cards.' + e.target.getAttribute('data-listName') + '.' + e.target.value + '.expanded',
					val: false
				});
			} else
			// Reset all data
			if (e.target.name === 'reset') {
				socket.emit('reset');
			}
		}
	});
	// handle changes on "synced" elements
	document.body.addEventListener('change', function (e) {
		if (hasClass(e.target, 'synced')) {
			// Change video volume
			if (e.target.name === 'videoVolume') {
				socket.emit('set', {
					key: 'video.volume',
					val: e.target.value
				});
			} else
			// change left player score
			if (e.target.name === 'scoreLeft') {
				socket.emit('set', {
					key: 'score.left',
					val: e.target.value
				})
			} else
			// change right player score
			if (e.target.name === 'scoreRight') {
				socket.emit('set', {
					key: 'score.right',
					val: e.target.value
				})
			} else
			// change firstplayer
			if (e.target.name === 'firstplayer') {
				socket.emit('set', {
					key: 'firstplayer',
					val: e.target.value
				})
			} else
			// change left player faction
			if (e.target.name === 'factionLeft') {
				socket.emit('set', {
					key: 'cards.leftMisc.faction',
					val: e.target.value
				})
			} else
			// change right player faction
			if (e.target.name === 'factionRight') {
				socket.emit('set', {
					key: 'cards.rightMisc.faction',
					val: e.target.value
				})
			} else
			// change left player agenda
			if (e.target.name === 'agendaLeft') {
				socket.emit('set', {
					key: 'cards.leftMisc.agenda',
					val: e.target.value
				})
			} else
			// change right player agenda
			if (e.target.name === 'agendaRight') {
				socket.emit('set', {
					key: 'cards.rightMisc.agenda',
					val: e.target.value
				})
			} else
			// change challenge icon
			if (e.target.name === 'challenge') {
				socket.emit('set', {
					key: 'challenge',
					val: e.target.value
				})
			} else
			// hide/show left player used and unused plot piles
			if (e.target.name === 'leftHidePlots') {
				socket.emit('set', {
					key: 'leftHidePlots',
					val: e.target.checked
				})
			} else
			// hide/show right player used and unused plot piles
			if (e.target.name === 'rightHidePlots') {
				socket.emit('set', {
					key: 'rightHidePlots',
					val: e.target.checked
				})
			}
		}
	});

	// handle initial data
	socket.on('init', function (data) {
		for (var listName in data.cards) {
			controller.clearList(listName);
			for (var idx in data.cards[listName]) {
				if (data.cards[listName][idx] !== null) {
					controller.addCard(idx, listName, data.cards[listName][idx]);
				}
			}
		}
		controller.changeVideoSourceAndType();
		controller.setScore(data.score.left, 'left');
		controller.setScore(data.score.right, 'right');
		controller.setFP(data.firstplayer);
		controller.setChallengeIcon(data.challenge);
		controller.setPlotpileVisibility(data.leftHidePlots, 'left');
		controller.setPlotpileVisibility(data.rightHidePlots, 'right');
	});

	// handle updates sent from server and decide which controller function to call
	socket.on('update', function (data) {
		var key = data.key;
		var val = data.val;

		// A card list got updated
		if (key.indexOf('cards.') === 0) {
			var listName = key.substr(6, key.indexOf('.', 6) - 6);
			var cardIdx = key.substr(key.indexOf('.', 6) + 1);
			if (cardIdx.indexOf('.') > -1) {
				cardIdx = cardIdx.substr(0, cardIdx.indexOf('.'));
			}
			// remove card from list
			if (val === null) {
				controller.removeCard(cardIdx, listName);
			} else
			// Expand/Collapse specified card
			if (key.indexOf('expanded') > -1) {
				if (val === true) {
					controller.expandCard(cardIdx, listName);
				} else {
					controller.collapseCard(cardIdx, listName);
				}
			} else
			// if card with specified IDX already exists, replace it
			if ($('.' + listName + ' [data-cardIdx="' + cardIdx + '"]').length > 0) {
				controller.changeCard(cardIdx, listName, val);
			} else
			// Add card to list
			{
				controller.addCard(cardIdx, listName, val);
			}
		} else
		// change video source
		if (key === 'video') {
			controller.changeVideoSourceAndType();
		} else
		// change video play state (e.g. start playing or pause video)
		if (key === 'video.playState') {
			controller.changeVideoPlayState(val);
		} else
		// change video volume
		if (key === 'video.volume') {
			controller.changeVideoVolume(val);
		} else
		// change left player score
		if (key === 'score.left') {
			controller.setScore(val, 'left');
		} else
		// change right player score
		if (key === 'score.right') {
			controller.setScore(val, 'right');
		} else
		// change firstplayer
		if (key === 'firstplayer') {
			controller.setFP(val);
		} else
		// change challenge icon
		if (key === 'challenge') {
			controller.setChallengeIcon(val);
		} else
		// change left player plot pile visibility
		if (key === 'leftHidePlots') {
			controller.setPlotpileVisibility(val, 'left');
		} else
		// change left player plot pile visibility
		if (key === 'rightHidePlots') {
			controller.setPlotpileVisibility(val, 'right');
		}
	});

	var controller = {
		clearList: function (listName) {
			var cards = $('.' + listName + ' [data-cardIdx]');
			for (var i = 0; i < cards.length; i++) {
				controller.removeCard(cards[i].getAttribute('data-cardIdx'), listName, true);
			}
		},
		addCard: function (cardIdx, listName, cardCode) {
			var targetLists = $('.' + listName);
			var cardData = cards.find(item => item.code === cardCode);
			cardData.idx = cardIdx;
			for (var i = 0; i < targetLists.length; i++) {
				var el = buildCardElement(cardData, listName);
				targetLists[i].appendChild(el);
			}
		},
		removeCard: function (cardIdx, listName) {
			var targetCards = $('.' + listName + ' [data-cardIdx="' + cardIdx + '"]');
			// Only setting removed class to give some time for animations/transitions
			for (var i = 0; i < targetCards.length; i++) {
				addClass(targetCards[i], 'removed');
			}
			// After a few seconds we should be fine with actually removing the dom element
			window.setTimeout(function () {
				for (var i = 0; i < targetCards.length; i++) {
					targetCards[i].parentNode.removeChild(targetCards[i]);
				}
			}, 2000);
		},
		changeCard: function (cardIdx, listName, cardCode) {
			var targetCards = $('.' + listName + ' [data-cardIdx="' + cardIdx + '"]');
			var cardData = cards.find(item => item.code === cardCode);
			cardData.idx = cardIdx;
			for (var i = 0; i < targetCards.length; i++) {
				var el = buildCardElement(cardData, listName);
				targetCards[i].parentNode.replaceChild(el, targetCards[i]);
			}
		},
		expandCard: function (cardIdx, listName) {
			var targetCards = $('.' + listName + ' .panel[data-cardIdx="' + cardIdx + '"]');
			for (var i = 0; i < targetCards.length; i++) {
				removeClass(targetCards[i], 'collapsed');
			}
		},
		collapseCard: function (cardIdx, listName) {
			var targetCards = $('.' + listName + ' .panel[data-cardIdx="' + cardIdx + '"]');
			for (var i = 0; i < targetCards.length; i++) {
				addClass(targetCards[i], 'collapsed');
			}
		},
		changeVideoSourceAndType: function () {
			var oldVideoElements = $('.video');
			socket.emit('get', 'video.type', function (type) {
				socket.emit('get', 'video.src', function (src) {
					for (var i = 0; i < oldVideoElements.length; i++) {
						var newVideoElement;

						if (hls) {
							hls.destroy();
						}

						if (type === 'Video') {
							newVideoElement = document.createElement('video');
							newVideoElement.src = src;
						} else if (type === 'MJPEG') {
							newVideoElement = document.createElement('img');
							newVideoElement.src = src;
						} else if (type === 'M3U8') {
							newVideoElement = document.createElement('video')
							hls = new Hls();
							hls.attachMedia(newVideoElement);
							hls.on(Hls.Events.MEDIA_ATTACHED, function () {
								hls.loadSource(src);
							});
						} else if (type === 'Youtube') {
							var videoInit = false;
							newVideoElement = document.createElement('div');
							var YTContainer = document.createElement('div');
							YTContainer.id = 'ytplayer';
							newVideoElement.appendChild(YTContainer);

							oldVideoElements[i].parentNode.replaceChild(newVideoElement, oldVideoElements[i]);
							afterYTReady(function () {
								player = new YT.Player('ytplayer', {
									height: document.body.offsetHeight,
									width: document.body.offsetWidth,
									videoId: src,
									playerVars: {
										controls: 0,
										disablekb: 1,
										enablejsapi: 1,
										showinfo: 0,
										rel: 0,
										modestbranding: 1
									},
									events: {
										onReady: function () { },
										onStateChange: function (event) {
											if (event.data === 1) {
												if (!videoInit) {
													videoInit = true;
													player.seekTo(0, true);
												} else {
													socket.emit('set', {
														key: 'video.playState',
														val: 'play'
													});
												}
											} else if (event.data === 2) {
												socket.emit('set', {
													key: 'video.playState',
													val: 'pause'
												});
											}
										}
									}
								});

							})
							newVideoElement.play = function () {
							}
							newVideoElement.pause = function () {
							}
						}

						newVideoElement.className = 'video';

						if (oldVideoElements[i].parentNode) {
							oldVideoElements[i].parentNode.replaceChild(newVideoElement, oldVideoElements[i]);
						}
					}
					socket.emit('get', 'video.playState', function (playState) {
						controller.changeVideoPlayState(playState);
					})
				});
			});
		},
		changeVideoPlayState: function (newPlayState) {
			var videos = $('.video');
			for (var i = 0; i < videos.length; i++) {
				videos[i][newPlayState]();
			}
		},
		changeVideoVolume: function (newVolume) {
			var videos = $('.video');
			for (var i = 0; i < videos.length; i++) {
				videos[i].volume = newVolume;
			}
		},
		setScore: function (newScore, whichPlayer) {
			var scoreEls = $('.' + whichPlayer + 'Score');
			for (var i = scoreEls.length - 1; i >= 0; i--) {
				scoreEls[i].setAttribute('data-score', newScore);
			}
		},
		setFP: function (newFP) {
			var allTokens = $('.firstplayerToken');
			for (var i = 0; i < allTokens.length; i++) {
				if (hasClass(allTokens[i], newFP + 'IsFP')) {
					removeClass(allTokens[i], 'hidden');
				} else if (!hasClass(allTokens[i], 'hidden')) {
					addClass(allTokens[i], 'hidden');
				}
			}
		},
		setChallengeIcon: function (newChallenge) {
			var els = $('.challengeIcon');
			for (var i = els.length - 1; i >= 0; i--) {
				els[i].setAttribute('data-challenge', newChallenge);
			}
		},
		setPlotpileVisibility: function (hidden, whichPlayer) {
			var els = $('.' + whichPlayer + 'Plots');
			for (var i = els.length - 1; i >= 0; i--) {
				if (!hidden) {
					removeClass(els[i], 'hidePiles');
				} else if (!hasClass(els[i], 'hidePiles')) {
					addClass(els[i], 'hidePiles');
				}
			}
		}
	}
	
	return ret;
})();