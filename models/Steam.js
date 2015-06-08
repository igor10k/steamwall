var Canvas = require('canvas');
var gm = require('gm');
var CanvasGrid = require('../assets/js/canvas-grid');
var config = require('../config');
var request = require('koa-request');
var BigNumber = require('bignumber.js');

var apiUrl = 'http://api.steampowered.com/';

exports.getOwnedGames = function* (steamId) {
	var url, response, responseBody;

	url =  apiUrl + 'IPlayerService/GetOwnedGames/v1/';
	url += '?key=' + config.steam.apiKey;
	url += '&steamid=' + steamId;
	url += '&include_appinfo=1';

	response = yield request(url);
	try {
		responseBody = JSON.parse(response.body);
	} catch (e) {}

	if (typeof responseBody === 'object' && typeof responseBody.response === 'object') {
		return {
			games: responseBody.response.games
		};
	}
};

exports.resolveVanityURL = function* (vanityurl) {
	var url, response, responseBody;

	url = apiUrl + 'ISteamUser/ResolveVanityURL/v0001/?key=' + config.steam.apiKey + '&vanityurl=' + vanityurl;
	response = yield request(url);
	try {
		responseBody = JSON.parse(response.body);
	} catch (e) {}

	if (typeof responseBody === 'object' && typeof responseBody.response === 'object') {
		return responseBody.response.steamid;
	}
};

exports.makeCollage = function (images, canvasWidth, canvasHeight) {
	return function (callback) {
		var canvas = new Canvas(canvasWidth, canvasHeight);

		var canvasGrid = new CanvasGrid(canvas);
		canvasGrid.fitImages(images, gm, Canvas.Image, function () {
			callback(null, canvas.toBuffer());
		});
	};
};

exports.steamIdTo64 = function (steamId) {
	var y, z, matches;

	matches = steamId.match(/STEAM_(\d+)\:(\d+)\:(\d+)/);
	if (matches && matches.length === 4) {
		y = matches[2];
		z = matches[3];
		return new BigNumber('76561197960265728').plus(z * 2).plus(y).toString();
	}
};

exports.extractSteam64Id = function (string) {
	var matches;

	matches = string.match(/\d{17}/);
	if (matches) {
		return matches[0];
	}
};

exports.extractVanityUrl = function (string) {
	var matches;

	if (string.indexOf('/') === -1) {
		// Custom URL
		return string;
	} else {
		// /id link
		matches = string.match(/\/id\/(\w+)/);

		if (matches && matches[1]) {
			return matches[1];
		}
	}
};
