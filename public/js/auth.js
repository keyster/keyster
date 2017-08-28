function newuser() {
	var settings = {
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\
				   abcdefghijklmnopqrztuvwxyz\
				   0123456789!@#$%^&*()'
	}
	firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(settings);
}

function choose() {
	if (select.entries) {
		var none = true;
		if (generate.entry) {
			for (e in select.entries) {
				if (generate.entry.id === select.entries[e].id) {
					none = false;
					select.select(Number(e));
					break;
				}
			}
		}
		if (none) {
			select.select(0);
		}
	} else {
		generate.entry = null;
	}
}

function titles() {
	var titles = {};
	var curr;
	for (c in archive.changes) {
		curr = archive.changes[c];
		if (curr.status === 'deletion') {
			titles[curr.id] = curr.title;
		} else {
			for (e in select.entries) {
				if (curr.id === select.entries[e].id) {
					titles[curr.id] = select.entries[e].title;
				}
			}
		}
	}
	archive.titles = titles;
}

firebase.auth().onAuthStateChanged(function(user) {
	menu.curr = '';
	select.entries = [];
	if (user) {
		profile.number = user.phoneNumber;
		firebase.database().ref("/users/"+user.uid).on("value", function(snapshot) {
			var result = snapshot.val();

			var services = result.services;
			var entries = [];
			for (s in services) {
				services[s].id = s;
				entries.push(services[s]);
			}
			select.entries = entries;
			select.select(0);
			choose();

			var settings = result.settings;
			if (settings) {
				Object.assign(update.response, settings);
				Object.assign(create.response, settings);
			} else {
				newuser();
			}

			var archived = result.archive;
			var changes = [];
			for (s in archived) {
				for (c in archived[s]) {
					archived[s][c].id = s;
					changes.push(archived[s][c]);
				}
			}
			archive.changes = changes;
			archive.select(0);
			titles();

			profile.raw = JSON.stringify(result);
			menu.auth = true;
		});
	} else {
		menu.auth = false;
	}
})
