firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		profile.number = user.phoneNumber;
		firebase.database().ref("/users/"+user.uid+"/services").on("value", function(snapshot) {
			var entries = [];
			var services = snapshot.val();
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
		});
		firebase.database().ref("/users/"+user.uid+"/settings").on("value", function(snapshot) {
			Object.assign(update.response, snapshot.val());
			Object.assign(create.response, snapshot.val());
		});
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
			Object.assign(update.response, settings);
			Object.assign(create.response, settings);

			profile.raw = JSON.stringify(result);
			menu.auth = true;
		});
	} else {
		menu.auth = false;
	}
})