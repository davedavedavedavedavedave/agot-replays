define(['src/FnPlayer', 'src/utils'],
  (FnPlayer, utils) => 
  class CardPlayer extends FnPlayer {
    constructor(c, playback) {
      // create array of `do` and `undo` functions with offset for super constructor
      super(playback.map((step, idx) => {
        return {
          offset: step.offset,
          'do': () => this._do(step.data.key, step.data.val, idx),
          undo: () => this._undo(step.data.key, step.data.val, idx)
        }
      }));
      // the easy stuff
      this._c = c;
      this._playback = playback;
      this.cards = fetch(assetBaseUrl + '/data/cards.json')
        .then(res => res.json())
        .then(cards => cards.concat([
          {"name": "none", "faction_code": "none", "type_code": "faction", "code": "none"},
          {"name": "Baratheon", "faction_code": "baratheon", "imagesrc": "/baratheon.jpg", "type_code": "faction", "code": "faction-baratheon"},
          {"name": "Greyjoy", "faction_code": "greyjoy", "imagesrc": "/greyjoy.jpg", "type_code": "faction", "code": "faction-greyjoy"},
          {"name": "Lannister", "faction_code": "lannister", "imagesrc": "/lannister.jpg", "type_code": "faction", "code": "faction-lannister"},
          {"name": "Martell", "faction_code": "martell", "imagesrc": "/martell.jpg", "type_code": "faction", "code": "faction-martell"},
          {"name": "Night\'s Watch", "faction_code": "thenightswatch", "imagesrc": "/thenightswatch.jpg", "type_code": "faction", "code": "faction-thenightswatch"},
          {"name": "Stark", "faction_code": "stark", "imagesrc": "/stark.jpg", "type_code": "faction", "code": "faction-stark"},
          {"name": "Targaryen", "faction_code": "targaryen", "imagesrc": "/targaryen.jpg", "type_code": "faction", "code": "faction-targaryen"},
          {"name": "Tyrell", "faction_code": "tyrell", "imagesrc": "/tyrell.jpg", "type_code": "faction", "code": "faction-tyrell"}
        ]));
      // create all the dom elements needed
      this._els = {
        firstplayer: document.createElement('div'),
        challenge: document.createElement('div'),
        score: {
          left: document.createElement('div'),
          right: document.createElement('div')
        },
        cards: {
          leftHand: document.createElement('div'),
          rightHand: document.createElement('div'),
          leftUnusedPlots: document.createElement('div'),
          leftCurrentPlot: document.createElement('div'),
          leftUsedPlots: document.createElement('div'),
          rightUnusedPlots: document.createElement('div'),
          rightCurrentPlot: document.createElement('div'),
          rightUsedPlots: document.createElement('div'),
          leftMisc: document.createElement('div'),
          rightMisc: document.createElement('div')
        },
        toggleLeftPlots: document.createElement('div'),
        toggleRightPlots: document.createElement('div')
      };
      // setup general elements
      this._els.challenge.className = 'challengeIcon';
      this._els.challenge.setAttribute('data-challenge', 'noChallenge');
      this._els.firstplayer.className = 'firstplayer';
      // setup score dom elements
      this._els.score.left.className = 'leftScore';
      this._els.score.left.innerHTML = new Array(16).fill('').map((el, idx) => el = '<div class="score">' + idx + '</div>').join('');
      this._els.score.right.className = 'rightScore';
      this._els.score.right.innerHTML = this._els.score.left.innerHTML;
      // setup card containers
      this._els.cards.leftHand.className = 'alignPanelsLeft leftHand';
      this._els.cards.leftUnusedPlots.className = 'leftUnusedPlots';
      this._els.cards.leftCurrentPlot.className = 'leftCurrentPlot';
      this._els.cards.leftUsedPlots.className = 'leftUsedPlots';
      this._els.cards.leftMisc.className = 'alignPanelsLeft leftMisc';
      this._els.toggleLeftPlots.className = 'changeHiddenState';
      this._els.toggleLeftPlots.addEventListener('click', e => utils.toggleClass(e.target.parentNode, 'hidePiles'));
      this._els.cards.rightHand.className = 'alignPanelsRight rightHand';
      this._els.cards.rightUnusedPlots.className = 'rightUnusedPlots';
      this._els.cards.rightCurrentPlot.className = 'rightCurrentPlot';
      this._els.cards.rightUsedPlots.className = 'rightUsedPlots';
      this._els.cards.rightMisc.className = 'alignPanelsRight rightMisc';
      this._els.toggleRightPlots.className = 'changeHiddenState';
      this._els.toggleRightPlots.addEventListener('click', e => utils.toggleClass(e.target.parentNode, 'hidePiles'));
      let leftPlots = document.createElement('div');
      leftPlots.className = 'alignPanelsLeft leftPlots hidePiles';
      leftPlots.appendChild(this._els.cards.leftUsedPlots);
      leftPlots.appendChild(this._els.cards.leftCurrentPlot);
      leftPlots.appendChild(this._els.cards.leftUnusedPlots);
      leftPlots.appendChild(this._els.toggleLeftPlots);
      let rightPlots = document.createElement('div');
      rightPlots.className = 'alignPanelsRight rightPlots hidePiles';
      rightPlots.appendChild(this._els.cards.rightUsedPlots);
      rightPlots.appendChild(this._els.cards.rightCurrentPlot);
      rightPlots.appendChild(this._els.cards.rightUnusedPlots);
      rightPlots.appendChild(this._els.toggleRightPlots);

      // append general elements to container
      this._c.appendChild(this._els.firstplayer);
      this._c.appendChild(this._els.challenge);
      // append elements for left player to container
      this._c.appendChild(this._els.score.left);
      this._c.appendChild(this._els.cards.leftHand);
      this._c.appendChild(leftPlots);
      this._c.appendChild(this._els.cards.leftMisc);
      // append elements for right player to container
      this._c.appendChild(this._els.score.right);
      this._c.appendChild(this._els.cards.rightHand);
      this._c.appendChild(rightPlots);
      this._c.appendChild(this._els.cards.rightMisc);

      // create observer to set panel height (needed for css transitions to work)
      let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              if (utils.hasClass(mutation.addedNodes[i], 'panel')) {
                let titleHeight = utils.getOuterHeight(mutation.addedNodes[i].querySelector('.panel-title'));
                let imageHeight = utils.getOuterHeight(mutation.addedNodes[i].querySelector('.panel-image'));
                let bodyHeight = utils.getOuterHeight(mutation.addedNodes[i].querySelector('.panel-body'));
                mutation.addedNodes[i].style.height = titleHeight + Math.max(imageHeight, bodyHeight) + 'px';
              }
            }
          }
        });
      });
      observer.observe(this._c, { childList: true, subtree: true });

      // event handler to toggle `collapsed` class on click on card panels
      this._c.addEventListener('click', e => {
        let panel = e.target.matches('.panel') ? e.target : utils.findParent(e.target, '.panel');
        if (panel) {
          utils.toggleClass(panel, 'collapsed');
        }
      });
    }

    _do(key, val, idx) {
      let keyFragments = key.split('.');
      // figure out action to perform
      switch (keyFragments[0]) {
        case 'score':
          return this.setScore(keyFragments[1], val);
        case 'firstplayer':
          return this.setFirstplayer(val);
        case 'challenge':
          return this.setChallenge(val);
        case 'cards':
          // ignore `expand` and `collapse` requests
          if (keyFragments[3]) {
            return Promise.resolve();
          }
          // deal with normal card `add` and `remove` requests
          return this.setCard(keyFragments[1], keyFragments[2], val);
        case 'leftHidePlots':
        case 'rightHidePlots':
          return Promise.resolve();
      }
      return Promise.reject('unkown action', key);
    }
    _undo(key, val, idx) {
      let prevVal = null;
      // search for previous step with same key
      while (--idx > 0) {
        if (this._playback[idx].data.key === key) {
          prevVal = this._playback[idx].data.val;
          break;
        }
      }
      // do, what was previously done (default is null)
      return this._do(key, prevVal, idx);
    }

    setScore(player, val) {
      this._els.score[player].setAttribute('data-score', val);
      return Promise.resolve();
    }
    setFirstplayer(val) {
      this._els.firstplayer.setAttribute('data-firstplayer', val);
      return Promise.resolve();
    }
    setChallenge(val) {
      this._els.challenge.setAttribute('data-challenge', val);
      return Promise.resolve();
    }
    setCard(cardList, cardIdx, cardCode) {
      // if cardlist is 'removefromgame', we just ignore it
      if (cardList === 'removeFromGame') {
        return Promise.resolve();
      }
      // otherwise, deal with it accordingly
      return this.cards
        .then(cards => {
          if (cardCode) {
            // add card
            let el = this.buildPanel(cards.find(card => card.code === cardCode), cardIdx);
            this._els.cards[cardList].appendChild(el);
            return Promise.resolve();
          } else {
            // remove card
            let el = this._els.cards[cardList].querySelector('[data-cardIdx="' + cardIdx + '"]:not(.removed)');
            if (el) {
              utils.addClass(el, 'removed');
              // wait 2secs to make sure animations finished, then actually remove element from dom
              window.setTimeout(() => el.parentNode.removeChild(el), 2000);
            }
            return Promise.resolve();
          }
        });
    }

    buildPanel(json, cardIdx) {
      let panel = document.createElement('div');
      panel.className = 'panel style-' + json.faction_code + ' type-' + json.type_code + (json.expanded ? '' : ' collapsed');
      panel.setAttribute('data-cardIdx', cardIdx);
      panel.setAttribute('data-cardCode', json.code);
      let html = '';
      html += '<h3 class="panel-title">';
      html += (json.is_unique ? '<span class="icon-unique"></span> ' : '') + json.name + '</h3>';
      html += '<div class="panel-image" style="background-image:url(' + assetBaseUrl + '/img' + json.imagesrc + ');"></div>';
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
    }
  }
);