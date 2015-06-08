/*exported MrError*/

function MrError() {
	this.$error = $('#error');

	this.init();
}

$.extend(MrError.prototype, {
	init: function () {
		if (this.$error.length) {
			this.hideErrorOnTimeout();
		}
	},

	showError: function (msg) {
		if (!this.$error || !this.$error.length) {
			this.$error = $('<div id="error"/>');
			$('body').append(this.$error);
		}

		this.$error.text(msg);

		setTimeout(function () {
			this.$error.addClass('show');
		}.bind(this), 1);

		this.hideErrorOnTimeout();
	},

	hideErrorOnTimeout: function () {
		var self = this;

		clearTimeout(this.errorTimeout);
		this.errorTimeout = setTimeout(function () {
			self.$error.removeClass('show');
			self.$error.on('webkitTransitionEnd transitionend', function () {
				self.$error.remove();
				self.$error = null;
			});
		}, 4000);
	}
});
