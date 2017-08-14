const settings = {
	N: 16384,
	r: 8,
	p: 1,
	length: 32,
	alphabet: 'abcdefghijklmnopqrstuvwxyz'
};

Vue.component('text-input', {
	props: ['name', 'label', 'max', 'placeholder', 'value'],
	template: '<div><label class="label">{{ label }}</label><div class="control">\
	<input class="input" type="text" :maxlength="max" :placeholder="placeholder" \
	:value="value" @input="change"></div></div>',
	methods: {
		change: function(event) {
			this.$emit('change', this.name, event.target.value);
		}
	}
});

Vue.component('num-input', {
	props: ['name', 'label', 'max', 'placeholder', 'value'],
	template: '<div><label class="label">{{ label }}</label><div class="control">\
	<input class="input" type="number" :max="max" :placeholder="placeholder" \
	:value="value" @input="change"></div></div>',
	methods: {
		change: function(event) {
			this.$emit('change', this.name, event.target.value);
		}
	}
});

var menu = new Vue({
	el: '#menu',
	data: {
		auth: false,
		curr: ''
	},
	methods: {
		toggle: function(item) {
			if (this.curr === item) {
				this.curr = '';
			} else {
				this.curr = item;
			}
		},
		logout: function(event) {
			firebase.auth().signOut();
			select.entries = [{}];
			generate.entry = select.entries[0];
		}
	}
});

var login = new Vue({
	el: "#login",
	data: {
		prefix: '+1',
		number: '',
		code: ''
	},
	computed: {
		display: function() {return 'login' === menu.curr; }
	},
	created: function() {
		window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha');
		window.recaptchaVerifier.render();
	},
	methods: {
		clear: function() {
			menu.curr = '';
		},
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

var update = new Vue({
	el: '#update',
	data: {
		response: {
			N: settings.N,
			r: settings.r,
			p: settings.p,
			length: settings.length,
			alphabet: settings.alphabet
		}
	},
	computed: {
		display: function() { return 'update' === menu.curr; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		}
	}
});

var create = new Vue({
	el: '#create',
	data: {
		response: {
			title: '',
			subtitle: '',
			description: '',
			N: settings.N,
			r: settings.r,
			p: settings.p,
			length: settings.length,
			alphabet: settings.alphabet
		},
		show: false
	},
	computed: {
		display: function() { return 'create' === menu.curr; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		create: function(event) {
			var service = JSON.parse(JSON.stringify(this.response));
			service.salt = salt(32);
			firebase.database().ref("/users/"+firebase.auth().currentUser.uid+"/services").push(service);
			menu.curr = '';
		}
	}
});

var select = new Vue({
	el: '#select',
	data: {
		entries: [{}],
		selected: 0
	},
	methods: {
		select: function(index) {
			this.selected = index;
			generate.entry = this.entries[index];
			generate.master = '';
			generate.password = '';
			generate.notify = false;
			generate.loading = false;
		}
	}
});

var generate = new Vue({
	el: '#generate',
	data: {
		entry: select.entries[0],
		master: '',
		password: '',
		notify: false
	},
	methods: {
		generate: function(event) {
			this.password = hash(this.entry, this.master);
			this.master = '';
			this.notify = true;
			setTimeout(()=>{
				this.notify = false;
				this.password = '';
			}, 5000);
		}
	}
});