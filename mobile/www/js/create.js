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
		advanced: false
	},
	computed: {
		display: function() { return menu.tab === 'create' && menu.auth; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		create: function(event) {
			var service = {};
			Object.assign(service, this.response);
			service.salt = salt(32);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services').push(service);
			this.reset();
			menu.toggle('home');
		},
		reset: function(event) {
			Object.assign(this.response, settingsCurrent);
			Object.assign(this.response, {
				title: '',
				subtitle: '',
				description: ''
			});
			this.advanced = false;
		}
	}
});
