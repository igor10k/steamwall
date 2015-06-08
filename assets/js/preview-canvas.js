/*global CanvasGrid*/

var app = window.app;

function PreviewCanvas() {
	this.canvas = $('#canvas')[0];
}

$.extend(PreviewCanvas.prototype, {
	fetchImages: function (imageUrls, done) {
		var images = [];
		var counter = 0;

		if (!imageUrls.length) {
			done(null, images);
		}

		var finishLoad = function () {
			counter += 1;

			if (counter === imageUrls.length) {
				done(null, images);
			}
		};

		$.each(imageUrls, function (urlIndex, url) {
			var image = new Image();
			image.src = url;
			image.onload = function () {
				images.push(image);
				finishLoad();
			};
			image.onerror = finishLoad;
		});
	},

	pluckImageUrls: function (games) {
		var images = [];

		$.each(games, function (gameIndex, game) {
			if (!game.img_logo_url) {
				return;
			}
			images.push('http://cdn.akamai.steamstatic.com/steam/apps/' + game.appid + '/header.jpg');
		});

		return images;
	},

	fetchGames: function (done) {
		$.getJSON('/getownedgames', function (data) {
			done(null, data.games);
		});
	},

	generateCanvas: function (screenWidth, screenHeight, isRetina) {
		var canvas = this.canvas;
		var canvasWidth = screenWidth * (isRetina ? 2 : 1);
		var canvasHeight = screenHeight * (isRetina ? 2 : 1);

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.width = screenWidth + 'px';
		canvas.style.height = screenHeight + 'px';

		app.mrLoader.showLoader();

		this.fetchGames(function (error, games) {
			if (error) { return console.error(error); }

			this.fetchImages(this.pluckImageUrls(games), function (error, images) {
				if (error) { return console.error(error); }

				if (!images.length) {
					app.mrError.showError('You should have at least one purchased game to use this app');
				} else {
					var canvasGrid = new CanvasGrid(canvas);
					canvasGrid.fitImages(images);
				}

				$('body').addClass('has-image');

				app.mrLoader.hideLoader();
			}.bind(this));
		}.bind(this));
	}
});
