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
		auth: null,
		curr: ''
	},
	methods: {
		toggle: function(item) {
			if (this.curr === item) {
				this.curr = '';
			} else {
				this.curr = item;
			}
		}
	}
});

var update = new Vue({
	el: '#update',
	data: {
		response: {
			N: null,
			r: null,
			p: null,
			length: null,
			alphabet: null
		}
	},
	computed: {
		display: function() { return menu.curr === 'update'; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		update: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(this.response);
			menu.curr = '';
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
			N: null,
			r: null,
			p: null,
			length: null,
			alphabet: null
		},
		show: false
	},
	computed: {
		display: function() { return menu.curr === 'create'; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		create: function(event) {
			var service = {}
			Object.assign(service, this.response);
			service.salt = salt(32);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services').push(service);
			menu.curr = '';
		}
	}
});

var profile = new Vue({
	el: '#profile',
	data: {
		number: null,
		raw: null
	},
	computed: {
		display: function() { return menu.curr === 'profile'; }
	},
	methods: {
		logout: function(event) {
			firebase.auth().signOut();
			select.entries = [{}];
			generate.entry = select.entries[0];
		},
		confirmLogout: function(event) {
			confirm.title = 'Log Out';
			confirm.message = 'Are you sure you want to log out?';
			confirm.callback = this.logout;
			confirm.display = true;
		},
		import: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid).set(JSON.parse(profile.raw));
			menu.curr = '';
		},
		confirmImport: function(event) {
			confirm.title = 'Import Data';
			confirm.message = 'Are you sure you want to import this data? You will \
			have 30 days to revert changes.';
			confirm.callback = this.import;
			confirm.display = true;
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
		new: {},
		master: '',
		password: '',
		notify: false,
		edit: false
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
		},
		change: function(name, value) {
			this.new[name] = value;
		},
		update: function(event) {
			var updated = {};
			Object.assign(updated, this.entry);
			Object.assign(updated, this.new);
			delete updated.id;
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.entry.id).set(updated);
			this.edit = false;
		},
		archive: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.entry.id).remove();
			select.select(0);
			this.edit = false;
		},
		confirmArchive: function(event) {
			confirm.title = 'Archive Entry';
			confirm.message = 'Are you sure you want to archive this entry? You will \
			have 30 days to revert changes.';
			confirm.callback = this.archive;
			confirm.display = true;
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

var confirm = new Vue({
	el: '#confirm',
	data: {
		display: false,
		title: null,
		message: null,
		callback: null
	},
	methods: {
		close: function(event) {
			this.display = false;
		},
		confirm: function(event) {
			this.callback();
			this.close();
		}
	}
});