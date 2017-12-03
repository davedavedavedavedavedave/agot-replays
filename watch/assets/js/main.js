const assetBaseUrl = '/watch/assets';
require.config({
  baseUrl: assetBaseUrl + '/js'
});
requirejs(['lib/html5-youtube', 'src/CardPlayer', 'src/MediaSyncer', 'src/Controls'],
  (blank, CardPlayer, MediaSyncer, Controls) => {
    // load card data and game
    fetch(assetBaseUrl + '/data/games/' + new URL(location.href).searchParams.get('game') + '.json')
    .then(res => res.json())
    .then(game => {
      // setup of video
      const elVideo = document.createElement('div');
      elVideo.className = 'video'
      document.body.appendChild(elVideo);
      const video = youtube({
        el: elVideo,
        id: game.video.src,
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        autoplay: 0
      });

      // setup of audio
      const audio = (game.audio || []).map(item => new Audio(item.src));
      audio.forEach(item => item.volume = 0);
      const audioLabels = (game.audio || []).map(item => item.label);

      // setup of card playback
      const elCardPlayback = document.createElement('div');
      elCardPlayback.className = 'cardPlayback';
      document.body.appendChild(elCardPlayback);
      const cardPlayback = new CardPlayer(elCardPlayback, game.playback);
      foo = cardPlayback;

      // setup of playback controls
      const elControls = document.createElement('div');
      elControls.className = 'controls';
      document.body.appendChild(elControls);
      const controls = new Controls(elControls, [video].concat(audio), ['Video'].concat(audioLabels));

      // setup of video/audio/card syncer
      const syncer = new MediaSyncer({
        media: [video].concat(audio).concat([cardPlayback]),
        tolerance: 0.1
      });
    });
});