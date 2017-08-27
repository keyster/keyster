firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		document.getElementById("app").style.display = "inherit"
		menu.auth = true;
		profile.number = user.phoneNumber
		firebase.database().ref("/users/"+user.uid+"/services").on("value", function(snapshot) {
			var entries = [];
			var services = snapshot.val();
			for (s in services) {
				services[s].id = s
				if (!services[s].archived) {
					entries.push(services[s]);
				}
			}
			select.entries = entries;
			generate.entry = select.entries[0];
			select.loaded = true;
		})
		firebase.database().ref("/users/"+user.uid+"/settings").on("value", function(snapshot) {
			var newSettings = snapshot.val()
			if (!newSettings) {
				newSettings = JSON.parse(JSON.stringify(settings));
				firebase.database().ref("/users/"+user.uid+"/settings").set(newSettings);
			}
			for (s in newSettings) {
				update.response[s] = newSettings[s];
				create.response[s] = newSettings[s];
			}
		})
		firebase.database().ref("/users/"+user.uid).on("value", function(snapshot) {
			profile.json = JSON.stringify(snapshot.val());
			profile.inputJson = profile.json;
		})
	} else {
		document.getElementById("app").style.display = "none";
		menu.auth = false;
		login.createCaptcha();
	}
})
