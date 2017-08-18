var io = (function () {

	var synchedMock = {
		data: null,
		set: (key, val) => {
			let keys = key.split('.');
			let pointer = synchedMock.data;
			for (var i = 0; i < keys.length - 1; i++) {
				pointer[keys[i]] = pointer[keys[i]] || {};
				pointer = pointer[keys[i]];
			}
			pointer[keys[i]] = val;
			for (var i = 0; i < listeners['update'].length; i++) {
				listeners['update'][i]({
					key: key,
					val: val
				})
			}
			return {
				key: key,
				val: val
			};
		},
		// takes a key as string and maps it to an object, returns mapped value
		get: (key) => {
			let keys = key.split('.');
			let pointer = synchedMock.data;
			for (var i = 0; i < keys.length - 1; i++) {
				if (!pointer[keys[i]]) {
					break;
				}
				pointer = pointer[keys[i]];
			}
			return pointer[keys[i]];
		}
	}

	var listeners = { };
	var socketMock = {
		emit: function (type, data, cb) {
			if (type === 'set') {
				synchedMock.set(data.key, data.val);
			} else if (type === 'init') {
				synchedMock.data = data;
				for (var i = 0; i < listeners['init'].length; i++) {
					listeners['init'][i](data)
				}
			} else if (type === 'get') {
				cb(synchedMock.get(data));
			} else {
				console.log('unkown type: ' + type)
			}
		},
		on: function (event, cb) {
			if (!listeners[event]) {
				listeners[event] = [cb];
			} else {
				listeners[event].push(cb);
			}
		}
	};

	return {
		connect: function () {
			if (synchedMock.data) {
				window.setTimeout(function () {
					socketMock.emit('init', synchedMock.data);
				}, 1)
			} else {
				ajax(location.pathname.replace(/\/[^\/]+$/, '/') + 'games/' + new URL(location.href).searchParams.get('game') + '.json', function (data) {
					synced.getCards(function () {
						socketMock.emit('init', JSON.parse(data));
					})
				})
			}
			return socketMock;
		}
	}
}())