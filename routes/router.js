var router = require('koa-router')();
var openid = require('openid');
var config = require('../config');
var thunkify = require('thunkify');
var Steam = require('../models/Steam');
var http = require('http');
var bodyParser = require('koa-body')();

var realm = 'http://' + config.domain + (process.env.NODE_ENV !== 'production' ? ':' + config.port : '') + '/';
var returnUrl = realm + 'auth/verify';
var relyingParty = new openid.RelyingParty(returnUrl, realm, true, false, []);

router.get('/', function* () {
	this.render('index', {
		steamId: this.session.steamId
	});
});

router.get('/getownedgames', function* () {
	if (!this.session.steamId) {
		this.body = { error: 'User is not signed in.' };
	} else {
		this.body = yield Steam.getOwnedGames(this.session.steamId);
	}
});

router.post('/download', bodyParser, function* () {
	if (!this.session.steamId) {
		this.body = { error: 'User is not signed in.' };
		return;
	}

	var requestImage = function (url) {
		return function (done) {
			http.get(url, function (response) {
				if (response.statusCode === 404) { return done(null); }

				var data = [];
				response.on('data', function (chunk) {
					data.push(chunk);
				});
				response.on('end', function () {
					done(null, Buffer.concat(data));
				});
			});
		};
	};

	function* fetchImages(games) {
		var actions = [];

		games.forEach(function (game) {
			if (!game.img_logo_url) { return; }
			actions.push(requestImage('http://cdn.akamai.steamstatic.com/steam/apps/' + game.appid + '/header.jpg'));
		});

		return yield actions;
	}

	var canvasWidth = this.request.body.width * (this.request.body['is-retina'] ? 2 : 1);
	var canvasHeight = this.request.body.height * (this.request.body['is-retina'] ? 2: 1);

	if (!canvasWidth || !canvasHeight) {
		return this.redirect('/');
	}

	var data = yield Steam.getOwnedGames(this.session.steamId);
	var images = yield fetchImages(data.games);
	images = images.filter(function (image) {
		return typeof image !== 'undefined';
	});

	if (!images.length) {
		this.redirect('/?nogames');
	} else {
		this.set('Content-Disposition', 'attachment; filename=steamwall.png');
		this.body = yield Steam.makeCollage(images, canvasWidth, canvasHeight);
	}
});

router.get('/auth', function* () {
	var auth = thunkify(relyingParty.authenticate);
	var authUrl = yield auth.call(relyingParty, 'http://steamcommunity.com/openid', false);
	this.redirect(authUrl);
});

router.post('/auth/steamid', bodyParser, function* () {
	var vanityurl, idOrUrl;

	if (!this.request.body.id_or_url) {
		this.redirect('/');
	}

	idOrUrl = this.request.body.id_or_url;

	// STEAM_0:X:XXXXXX
	this.session.steamId = Steam.steamIdTo64(idOrUrl);

	// /profiles/[STEAM64_ID]
	if (!this.session.steamId) {
		this.session.steamId = Steam.extractSteam64Id(idOrUrl);
	}

	// /id/[CUSTOM_URL]
	if (!this.session.steamId) {
		vanityurl = Steam.extractVanityUrl(idOrUrl);

		if (vanityurl) {
			this.session.steamId = yield Steam.resolveVanityURL(encodeURIComponent(vanityurl));
		}
	}

	if (!this.session.steamId) {
		this.redirect('/?nomatch');
	}

	this.redirect('/');
});

router.get('/auth/verify', function* () {
	var verify = thunkify(relyingParty.verifyAssertion);
	var result = yield verify.call(relyingParty, this.req);
	if (result.authenticated) {
		this.session.steamId = result.claimedIdentifier.slice(result.claimedIdentifier.lastIndexOf('/') + 1);
	}
	this.redirect('/');
});

router.get('/signout', function* () {
	delete this.session.steamId;
	this.redirect('/');
});

module.exports = router;
