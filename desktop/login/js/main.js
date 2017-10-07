var login = new Vue({
	el: "#login",
	data: {
		number: '',
		token: ''
	},
	methods: {
		send: function() {
		},
		confirm: function() {
			confirmationResult.confirm(this.code);
			this.code = '';
		}
	}
});

var recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha");
recaptcha.verify = function() {
	return new Promise((resolve, reject) => {
		resolve(login.token)
	})
}
window.onmessage = function(event) {
	if (event.origin === "https://captcha.keyster.io") {
		var data = JSON.parse(event.data)
		if (data.action == "send") {
			login.token = data.token
			login.number = data.number
			login.prefix = data.prefix
			recaptcha.verify()
			firebase.auth().signInWithPhoneNumber(login.number, recaptcha)
			.then(function(confirmationResult) {
				window.confirmationResult = confirmationResult;
			}).catch(function(error) {
			});
			login.number = '';
		} else if (data.action == "confirm") {
			window.confirmationResult.confirm(data.code)
		}
	}
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		redirect();
	}
});
