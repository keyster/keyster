var settings = new Vue({
	el: '#settings',
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
		display: function() { return menu.tab === 'settings'; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		update: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(this.response);
			menu.toggle('home');
		},
		reset: function(event) {
			Object.assign(this.response, settingsCurrent);
		}
	}
});

function settingsDefault(uid) {
	firebase.database().ref('/users/'+uid+'/settings').set({
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'abcdefghijklmnopqrztuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
	});
}

function settingsListen(uid) {
	firebase.database().ref('/users/'+uid+'/settings').on("value", function(snapshot) {
		var s = snapshot.val();
		if (s) {
			settingsCurrent = s;
			settings.reset();
			create.reset();
			profileUpdate();
		} else {
			settingsDefault(uid);
		}
	});
}
