/*global CanvasGrid*/

$(function () {
	var $loader = $('#loader');

	var showLoader = function () {
		$loader.show();
		setTimeout(function () {
			$loader.addClass('show');
		}, 1);
	};

	var hideLoader = function () {
		$loader.removeClass('show');
		$loader.on('webkitTransitionEnd transitionend', function () {
			$loader.off('webkitTransitionEnd transitionend');
			$loader.hide();
		});
	};

	var $error = $('#error');
	var errorTimeout;

	var showError = function (msg, duration) {
		$error.text(msg);
		$error.show();
		setTimeout(function () {
			$error.addClass('show');
		}, 1);

		clearTimeout(errorTimeout);
		errorTimeout = setTimeout(function () {
			$error.removeClass('show');
		}, duration || 2000);
	};

	if (window.location.search.indexOf('nogames') !== -1) {
		showError('You should have at least one purchased game to use this app', 4000);
	}

	var screenWidth = screen.width;
	var screenHeight = screen.height;
	var isRetina = window.devicePixelRatio && window.devicePixelRatio > 1 || false;

	var goToStep = function (stepIndex) {
		var $form = $('#form');
		var $steps = $('.step1, .step2', $form);
		var $oldStep = $steps.eq(1 - stepIndex);
		var $newStep = $steps.eq(stepIndex);

		$form.addClass('overflow');
		$oldStep.addClass('hide');
		$newStep.removeClass('hidden');

		setTimeout(function () {
			$newStep.removeClass('hide');
			$newStep.on('webkitTransitionEnd transitionend', function () {
				$newStep.off('webkitTransitionEnd transitionend');
				$oldStep.addClass('hidden');
				$form.removeClass('overflow');
			});
		}, 1);
	};

	var augmentForm = function () {
		var $form = $('#form');
		var $width = $('input[name="width"]', $form);
		var $height = $('input[name="height"]', $form);
		var $isRetina = $('input[name="is-retina"]', $form);
		var $btnGenerate = $('.btn-generate', $form);

		$width.val(screenWidth);
		$height.val(screenHeight);
		$isRetina.prop('checked', isRetina);

		$width.on('keyup', function () {
			screenWidth = parseInt($width.val(), 10);
		});

		$height.on('keyup', function () {
			screenHeight = parseInt($height.val(), 10);
		});

		$isRetina.on('change', function () {
			isRetina = this.checked;
		});

		$btnGenerate.on('click', function (event) {
			event.preventDefault();
			if (screenWidth < 100 || screenHeight < 100) {
				return showError('Minimum wallpaper size is 100x100');
			}

			generateCanvas();
			goToStep(1);
		});
	};
	augmentForm();

	var fetchImages = function (imageUrls, done) {
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
	};

	var pluckImageUrls = function (games) {
		var images = [];

		$.each(games, function (gameIndex, game) {
			if (!game.img_logo_url) {
				return;
			}
			images.push('http://cdn.akamai.steamstatic.com/steam/apps/' + game.appid + '/header.jpg');
		});

		return images;
	};

	var fetchGames = function (done) {
		$.getJSON('/getownedgames', function (data) {
			done(null, data.games);
		});
	};

	var generateCanvas = function () {
		var canvas = $('#canvas')[0];
		var canvasWidth = screenWidth * (isRetina ? 2 : 1);
		var canvasHeight = screenHeight * (isRetina ? 2 : 1);

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.width = screenWidth + 'px';
		canvas.style.height = screenHeight + 'px';

		showLoader();

		fetchGames(function (error, games) {
			if (error) { return console.error(error); }

			fetchImages(pluckImageUrls(games), function (error, images) {
				if (error) { return console.error(error); }

				if (!images.length) {
					goToStep(0);
					showError('You should have at least one purchased game to use this app', 4000);
				} else {
					var canvasGrid = new CanvasGrid(canvas);
					canvasGrid.fitImages(images);
				}

				hideLoader();
			});
		});
	};
});
