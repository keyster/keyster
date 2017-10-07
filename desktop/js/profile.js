var profile = new Vue({
	el: '#profile',
	data: {
		number: null,
		raw: null
	},
	computed: {
		display: function() { return menu.tab === 'profile' && menu.auth; }
	},
	methods: {
		logout: function(event) {
			firebase.auth().signOut();
		},
		confirmLogout: function(event) {
			confirm.call('Log Out',
				'Are you sure you want to log out?',
				this.logout);
		},
		import: function(event) {
			var imported = JSON.parse(profile.raw);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services').set(imported.services);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(imported.settings);
			menu.toggle('home');
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

function profileUpdate() {
	var raw = {
		services: servicesCurrent,
		settings: settingsCurrent
	};
	profile.raw = JSON.stringify(raw);
}
