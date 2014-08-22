var Router = require('koa-router');
var openid = require('openid');
var config = require('../config');
var thunkify = require('thunkify');
var Steam = require('../models/Steam');
var http = require('http');
var bodyParser = require('koa-body')();

var router = new Router();

var realm = 'http://' + config.domain + (process.env.NODE_ENV !== 'production' ? ':' + config.port : '') + '/';
var returnUrl = realm + 'auth/verify';
var relyingParty = new openid.RelyingParty(returnUrl, realm, true, false, []);

router.get('/', function* () {
	yield this.render('index', {
		userId: this.session.userId
	});
});

router.get('/getownedgames', function* () {
	if (!this.session.userId) {
		this.body = { error: 'User is not signed in.' };
	} else {
		this.body = yield Steam.getOwnedGames(this.session.userId);
	}
});

router.post('/download', bodyParser, function* () {
	if (!this.session.userId) {
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

	var data = yield Steam.getOwnedGames(this.session.userId);
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

router.get('/auth/verify', function* () {
	var verify = thunkify(relyingParty.verifyAssertion);
	var result = yield verify.call(relyingParty, this.req);
	if (result.authenticated) {
		this.session.userId = result.claimedIdentifier.slice(result.claimedIdentifier.lastIndexOf('/') + 1);
	}
	this.redirect('/');
});

router.get('/auth/signout', function* () {
	delete this.session.userId;
	this.redirect('/');
});

module.exports = router;
