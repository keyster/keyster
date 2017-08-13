var crypto = window.crypto || window.msCrypto;

function genSalt(length) {
  var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  values = new Uint32Array(length);
  crypto.getRandomValues(values);
  for(var i=0; i<length; i++) {
      result += charset[values[i] % charset.length];
  }
  return result;
}

const settings = {
	title: "",
	subtitle: "",
	description: "",
	salt: "",
	N: 16384,
	r: 8,
	p: 1,
	length: 32,
	alphabet: 'abcdefghijklmnopqrstuvwxyz'
}

const entries = [{}];

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
})

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
})

var menu = new Vue({
	el: '#menu',
	data: {
		update: false,
		create: false,
		login: false,
		loggedin: false
	},
	methods: {
		toggleupdate: function(event) {
			this.update = !this.update;
			this.create = false;
			this.login = false;
		},
		togglecreate: function(event) {
			this.update = false;
			this.create = !this.create;
			this.login = false;
		},
		togglelogin: function(event) {
			this.update = false;
			this.create = false;
			this.login = !this.login;
		},
		logout: function(event) {
			firebase.auth().signOut()
		}
	}
});

var credentials = {prefix: "+1", number: "", code: ""}

var login = new Vue({
	el: "#login",
	data: {
		credentials: credentials
	},
	created: function() {
		window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha')
	},
	computed: {
		display: function() { return menu.login; }
	},
	methods: {
		confirm: function() {
			confirmationResult.confirm(credentials.code)
		},
		sendCode: function() {
			firebase.auth().signInWithPhoneNumber(credentials.prefix+credentials.number, window.recaptchaVerifier)
			.then(function(confirmationResult) {
				window.confirmationResult = confirmationResult
			}).catch(function(error) {
				window.recaptchaVerifier.render().then(function(widgetId) {
					grecaptcha.reset(widgetId);
				})
			})
		}
	}
})

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
		display: function() { return menu.update; }
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
			title: settings.title,
			subtitle: settings.subtitle,
			description: settings.description,
			N: settings.N,
			r: settings.r,
			p: settings.p,
			length: settings.length,
			alphabet: settings.alphabet
		},
		show: false
	},
	computed: {
		display: function() { return menu.create; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		createService: function(event) {
			var newService = JSON.parse(JSON.stringify(this.response));
			newService.salt = genSalt(32)
			firebase.database().ref("/users/"+firebase.auth().currentUser.uid+"/services").push(newService)
		}
	}
});

var generate = new Vue({
	el: '#generate',
	data: {
		entry: entries[0],
		master: '',
		password: '',
		notify: false,
		loading: false
	},
	methods: {
		generate: function(event) {
			this.loading = true;
			this.password = hash(this.entry, this.master);
			this.loading = false;
			this.master = '';
			this.notify = true;
			setTimeout(()=>{
				this.notify = false;
				this.password = '';
			}, 5000);
		}
	}
});

var select = new Vue({
	el: '#select',
	data: {
		entries: entries,
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

firebase.auth().onAuthStateChanged(function(user) {
	menu.login = false
	select.entries = [{}]
	generate.entry = entries[0]
	if (user) {
		menu.loggedin = true
		firebase.database().ref("/users/"+user.uid+"/services").on("value", function(snapshot) {
			var servicesList = []
			var services = snapshot.val()
			for (s in services) {
				servicesList.push(services[s])
			}
			select.entries = servicesList
			generate.entry = select.entries[0]
		})
	} else {
		menu.loggedin = false
	}
})
