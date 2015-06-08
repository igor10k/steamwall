/* global MrLoader, MrError, PreviewCanvas, MainForm */

window.app = {};
var app = window.app;

$(function () {
	var screenWidth, screenHeight, isRetina;

	screenWidth = screen.width;
	screenHeight = screen.height;
	isRetina = window.devicePixelRatio && window.devicePixelRatio > 1 || false;

	app.mrLoader = new MrLoader();
	app.mrError = new MrError();
	app.previewCanvas = new PreviewCanvas();
	app.mainForm = new MainForm(screenWidth, screenHeight, isRetina);
});
