/*exported MrLoader*/

function MrLoader() {
	this.$loader = $('#loader');
}

$.extend(MrLoader.prototype, {
	showLoader: function () {
		this.$loader.show();
		setTimeout(function () {
			this.$loader.addClass('show');
		}.bind(this), 1);
	},

	hideLoader: function () {
		this.$loader.removeClass('show');
		this.$loader.on('webkitTransitionEnd transitionend', function () {
			this.$loader.off('webkitTransitionEnd transitionend');
			this.$loader.hide();
		}.bind(this));
	}
});
