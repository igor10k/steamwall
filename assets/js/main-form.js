/*exported MainForm*/

var app = window.app;

function MainForm(screenWidth, screenHeight, isRetina) {
	var $elForm;

	this.screenWidth = screenWidth;
	this.screenHeight = screenHeight;
	this.isRetina = isRetina;

	$elForm = $('#generate-form');
	this.$elWidth = $('input[name="width"]', $elForm);
	this.$elHeight = $('input[name="height"]', $elForm);
	this.$elRetina = $('input[name="is-retina"]', $elForm);
	this.$btnPreview = $('.btn-preview', $elForm);
	this.$btnDownload = $('.btn-download', $elForm);

	this.init();
}

$.extend(MainForm.prototype, {
	init: function () {
		this.$elWidth.val(this.screenWidth);
		this.$elHeight.val(this.screenHeight);
		this.$elRetina.prop('checked', this.isRetina);

		this.$elWidth.on('keyup', function () {
			this.screenWidth = parseInt(this.$elWidth.val(), 10);
		}.bind(this));

		this.$elHeight.on('keyup', function () {
			this.screenHeight = parseInt(this.$elHeight.val(), 10);
		}.bind(this));

		this.$elRetina.on('change', function (event) {
			this.isRetina = event.currentTarget.checked;
		}.bind(this));

		this.$btnPreview.on('click', this.handleClick.bind(this));
	},

	handleClick: function (event) {
		event.preventDefault();

		if (this.screenWidth < 100 || this.screenHeight < 100) {
			return app.mrError.showError('Minimum wallpaper size is 100x100');
		}

		this.$btnPreview.addClass('hide');
		this.$btnDownload.addClass('full-size');

		app.previewCanvas.generateCanvas(this.screenWidth, this.screenHeight, this.isRetina);
	}
});
