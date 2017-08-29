function newuser() {
	var settings = {
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrztuvwxyz0123456789!@#$%^&*()'
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

			var services = {};
			if (result && result.services) {
				services = result.services;
			}
			var entries = [];
			for (s in services) {
				services[s].id = s;
				entries.push(services[s]);
			}
			entries.sort(function(a, b) {
				if (a.title < b.title) { return -1 }
				if (a.title > b.title) { return 1 }
				return 0
			})
			select.entries = entries;
			select.select(0);
			choose();

			var settings = null;
			if (result && result.settings) {
				settings = result.settings;
			}
			if (settings) {
				Object.assign(update.response, settings);
				Object.assign(create.response, settings);
			} else {
				newuser();
			}

			var archived = {};
			if (result && result.archive) {
				archived = result.archive;
			}
			var changes = [];
			for (s in archived) {
				for (c in archived[s]) {
					if (services[s]) {
			            for (x in archived[s][c]) {
			                if (['status', 'timestamp'].indexOf(x) === -1 && archived[s][c][x] !== services[s][x]) {
			                	archived[s][c].id = s;
								changes.push(archived[s][c]);
			                    break;
			                }
			            }
					} else {
						archived[s][c].id = s;
						changes.push(archived[s][c]);
					}
				}
			}
			changes.sort(function(a, b) {
				return (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime()
			})
			archive.changes = changes;
			archive.select(0);
			titles();

			var exported = {};
			Object.assign(exported, result);
			delete exported.archive;
			profile.raw = JSON.stringify(exported);
			menu.auth = true;
		});
	} else {
		window.location.href = '/login/';
	}
})
