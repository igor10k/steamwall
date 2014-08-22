var Steam = require('steam-webapi');
var Canvas = require('canvas');
var thunkify = require('thunkify');
var gm = require('gm');
var CanvasGrid = require('../assets/js/canvasGrid');
var config = require('../config');

Steam.key = config.steam.apiKey;

exports.getOwnedGames = function* (userId) {
	yield Steam.ready;
	var steam = new Steam();
	var games = yield thunkify(steam.getOwnedGames).call(steam, {
		steamid: userId,
		include_appinfo: true,
		include_played_free_games: false,
		appids_filter: []
	});

	return games;
};

exports.makeCollage = function (images, canvasWidth, canvasHeight) {
	return function (callback) {
		var canvas = new Canvas(canvasWidth, canvasHeight);

		var canvasGrid = new CanvasGrid(canvas);
		canvasGrid.fitImages(images, gm, Canvas.Image, function () {
			callback(null, canvas.toBuffer());
		});
	}
};
