/**
 * This script contains a few small helper functions to avoid having to use jQuery (which would be overkill)
 */
// writing document.querySelectorAll is waaaayyyyy too much effort ;-)
// also, need second argument to be able to define context
var $ = function (selector, context) {
	if (context) {
		return context.querySelectorAll(selector);
	} else {
		return document.querySelectorAll(selector);
	}
}
// get first parent node which matches passed CSS selector
var findParent = function (el, selector) {
	var parent = el.parentNode;
	if (parent.matches(selector)) {
		return parent;
	} else if (parent.parentNode) {
		return findParent(parent, selector);
	} else {
		return null;
	}
}
// remove css class from element
var removeClass = function (el, className) {
	var re = new RegExp('( |^)' + className + '( |$)','g');
	el.className = el.className.replace(re, ' ');
};
// add css class to element
var addClass = function (el, className) {
	el.className += ' ' + className;
};
// checks if given element has specified css class
var hasClass = function (el, className) {
	var re = new RegExp('( |^)' + className + '( |$)', 'g');
	if (!el.className) {
		return false;
	}
	return !!el.className.match(re);
};
// Helper to get height of element (including margin)
var getOuterHeight = function (el) {
	var styles = window.getComputedStyle(el);
	return parseInt(styles.marginTop, 10) + parseInt(styles.marginBottom, 10) + el.offsetHeight;
};
// Make AJAX request to specified URL, on request end call cb with returned data
var ajax = function (url, cb) {
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			cb(httpRequest.responseText);
		}
	};
	httpRequest.open('GET', url);
	httpRequest.send();
}

// I know this doesn't qualify as "small" helper anymore ...
// build card html from json, indentation represents html structure
var buildCardElement = (function () {
	var cardImageRoot = '/watch/cardImages'; // <-- the folder all the card images are stored in
	// After panel generated with buildCardElement was added we have to set the width inline, for transitions to work
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					if (hasClass(mutation.addedNodes[i], 'panel')) {
						var titleHeight = getOuterHeight(mutation.addedNodes[i].querySelector('.panel-title'));
						var imageHeight = getOuterHeight(mutation.addedNodes[i].querySelector('.panel-image'));
						var bodyHeight = getOuterHeight(mutation.addedNodes[i].querySelector('.panel-body'));
						mutation.addedNodes[i].style.height = titleHeight + Math.max(imageHeight, bodyHeight) + 'px';
					}
				}
			}
		});
	});
	observer.observe(document.body, { childList: true, subtree: true });

	var lists = [{
		name: 'removeFromGame'
	}, {
		name: 'leftHand'
	}, {
		name: 'rightHand'
	}, {
		name: 'leftUnusedPlots'
	}, {
		name: 'leftCurrentPlot'
	}, {
		name: 'leftUsedPlots'
	}, {
		name: 'rightUnusedPlots'
	}, {
		name: 'rightCurrentPlot'
	}, {
		name: 'rightUsedPlots'
	}];

	// function that actually builds card panel html
	return function (json, listName, defaultMoveTarget) {
		var panel = document.createElement('div');
		panel.className = 'panel style-' + json.faction_code + ' type-' + json.type_code + (json.expanded ? '' : ' collapsed');
		panel.setAttribute('data-cardIdx', json.idx);
		panel.setAttribute('data-cardCode', json.code);
		var html = '';
		html += '<h3 class="panel-title">';
		if (listName || defaultMoveTarget) {
			html += '<button type="button" class="synced" name="moveCard" value="' + json.code + '" data-listName="' + listName + '">Move To</button>';
			html += '<select name="moveTarget">';
			html += lists.map(item => '<option' + (item.name === defaultMoveTarget ? ' selected>' : '>') + item.name + '</option>').join('');
			html += '</select>';
			html += '<button type="button" class="synced" name="expandCard" value="' + json.idx + '" data-listName="' + listName + '">Expand</button>';
			html += '<button type="button" class="synced" name="collapseCard" value="' + json.idx + '" data-listName="' + listName + '">Collapse</button>';
		}
		html += (json.is_unique ? '<span class="icon-unique"></span> ' : '') + json.name + '</h3>';
		html += '<div class="panel-image" style="background-image:url(' + cardImageRoot + json.localsrc + ');"></div>';
		html += '<div class="panel-body">';
			html += '<div class="card-faction"><span class="icon-' + json.faction_code + '"></span> ' + json.faction_name + '. ' + (json.is_loyal ? '' : 'Non-') + 'Loyal.</div>';
			html += '<div class="card-info"><span class="card-type">' + json.type_name + '. </span>';
			if (json.type_code === 'plot') {
				html += ' Income: ' + json.income + '. Initiative: ' + json.initiative + '. Claim: ' + json.claim + '. Reserve: ' + json.reserve + '. Plot deck limit: ' + json.deck_limit + '.';
			} else {
				if (json.type_code !== 'agenda') {
					html += '<span class="card-props">Cost: ' + json.cost + '.';
				}
				if (json.type_code === 'character') {
					html += ' STR: ' + json.strength + '. ' + (json.is_military ? '<span class="icon-military"></span>' : '') + (json.is_intrigue ? '<span class="icon-intrigue"></span>' : '') + (json.is_power ? '<span class="icon-power"></span>' : '') + '</span>';
				}
			}
			html += '<span class="card-traits">' + json.traits + '</span></div>';
			html += '<div class="card-text"><p>' + (json.text || '').replace(/\n/g, '</p><p>').replace(/(\[(.+?)\])/g, '<span class="icon-$2"></span>') + '</p></div>';
		html += '</div>';
		panel.innerHTML = html;
		return panel;
	};
})();
