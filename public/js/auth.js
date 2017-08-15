firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		menu.auth = true;
		firebase.database().ref("/users/"+user.uid+"/services").on("value", function(snapshot) {
			var entries = [];
			var services = snapshot.val();
			for (s in services) {
				entries.push(services[s]);
			}
			select.entries = entries;
			generate.entry = select.entries[0];
		})
		firebase.database().ref("/users/"+user.uid+"/settings").on("value", function(snapshot) {
			var settings = snapshot.val()
			for (s in settings) {
				update.response[s] = settings[s]
				create.response[s] = settings[s]
			}
		})
	} else {
		menu.auth = false;
	}
})
