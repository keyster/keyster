firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		menu.auth = true;
		profile.number = user.phoneNumber;
		firebase.database().ref("/users/"+user.uid+"/services").on("value", function(snapshot) {
			var entries = [];
			var services = snapshot.val();
			for (s in services) {
				services[s].id = s;
				entries.push(services[s]);
			}
			select.entries = entries;
			generate.entry = select.entries[0];
		});
		firebase.database().ref("/users/"+user.uid+"/settings").on("value", function(snapshot) {
			Object.assign(update.response, snapshot.val());
			Object.assign(create.response, snapshot.val());
		});
		firebase.database().ref("/users/"+user.uid).on("value", function(snapshot) {
			profile.raw = JSON.stringify(snapshot.val());
		});
	} else {
		menu.auth = false;
	}
})