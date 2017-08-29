var login = new Vue({
	el: "#login",
	data: {
		prefix: '+1',
		number: '',
		code: ''
	},
	created: function() {
		window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha');
		window.recaptchaVerifier.render();
	},
	methods: {
		send: function() {
			firebase.auth().signInWithPhoneNumber(this.prefix+this.number, window.recaptchaVerifier)
			.then(function(confirmationResult) {
				window.confirmationResult = confirmationResult;
			}).catch(function(error) {
				window.recaptchaVerifier.render().then(function(widgetId) {
					grecaptcha.reset(widgetId);
				});
			});
			this.prefix = '+1';
			this.number = '';
		},
		confirm: function() {
			confirmationResult.confirm(this.code);
			this.code = '';
		}
	}
});

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		window.location.href = '/';
	}
});
