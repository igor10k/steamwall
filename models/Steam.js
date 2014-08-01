var Steam = require('steam-webapi');
var Canvas = require('canvas');
var thunkify = require('thunkify');
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
	var canvas = new Canvas(canvasWidth, canvasHeight);

	images = images.map(function (src) {
		var image = new Canvas.Image();
		image.src = src;
		return image;
	});

	var canvasGrid = new CanvasGrid(canvas);
	canvasGrid.fitImages(images);

	return canvas.toBuffer();
};
