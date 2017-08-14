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
	} else {
		menu.auth = false;
	}
})