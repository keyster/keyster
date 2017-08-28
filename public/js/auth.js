function newuser() {
	default = {
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\
				   abcdefghijklmnopqrztuvwxyz\
				   0123456789!@#$%^&*()'
	}
	firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(default);
}

firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		profile.number = user.phoneNumber;
		firebase.database().ref("/users/"+user.uid).on("value", function(snapshot) {
			var result = snapshot.val();

			var entries = [];
			var services = result.services;
			for (s in services) {
				services[s].id = s;
				entries.push(services[s]);
			}
			select.entries = entries;
			if (entries) {
				generate.entry = select.entries[0];
			} else {
				generate.entry = null;
			}

			var settings = result.settings;
			if (settings) {
				Object.assign(update.response, settings);
				Object.assign(create.response, settings);
			} else {
				newuser();
			}

			profile.raw = JSON.stringify(result);
			menu.auth = true;
		});
	} else {
		menu.auth = false;
	}
})