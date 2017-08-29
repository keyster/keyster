const messages = {
	edit: 'Reverting will update the existing entry to the values below.',
	deletion: 'Reverting will restore the entry below.',
	error: 'Either something on our end malfunctioned or someone has \
	tampered with your account. We highly recommend reverting to fix \
	this entry.'
}

var archive = new Vue({
	el: '#archive',
	data: {
		all: [],
		shown: [],
		active: null,
		selected: 0,
		fuse: null
	},
	computed: {
		display: function() { return menu.tab === 'archive'; },
		disabled: function() {
			if (this.active.status !== 'deletion') {
				for (e in select.entries) {
					if (this.active.id === select.entries[e].id) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
		message: function() { return messages[this.active.status]; },
		edits: function() {
			var edits = [];
			for (x in this.active) {
				if (['display', 'status', 'timestamp', 'id'].indexOf(x) === -1) {
					edits.push([x, this.active[x]]);
				}
			}
			return edits;
		}
	},
	methods: {
		select: function(index) {
			this.selected = index;
			this.active = this.shown[index];
		},
		reset: function(event) {
			this.select(0);
		},
		search: function(event) {
			if (event.target.value) {
				this.shown = this.fuse.search(event.target.value);
			} else {
				this.shown = this.all;
			}
			this.reset();
		},
		revert: function(event) {
			if (this.disabled) {
				return;
			}
			var reverted = {};
			if (this.active.status !== 'deletion') {
				for (e in select.entries) {
					if (this.active.id === select.entries[e].id) {
						Object.assign(reverted, select.entries[e]);
						break;
					}
				}
			}
			Object.assign(reverted, this.active);
			delete reverted.display;
			delete reverted.status;
			delete reverted.timestamp;
			delete reverted.id;
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.active.id).set(reverted);
		},
	}
});

const archiveFuse = {
	shouldSort: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 16,
	minMatchCharLength: 1,
	keys: [
		"display"
	]
};

function archiveDisplay() {
	var displays = {};
	var curr;
	for (c in archive.all) {
		curr = archive.all[c];
		if (!displays[curr.id]) {
			if (curr.status === 'deletion') {
				displays[curr.id] = curr.title;
			} else {
				for (e in select.all) {
					if (curr.id === select.all[e].id) {
						displays[curr.id] = select.all[e].title;
					}
				}
			}
		}
	}
	for (c in archive.all) {
		curr = archive.all[c];
		curr.display = displays[curr.id];
	}
}

function archiveUpdate() {
	var a = {};
	Object.assign(a, archiveCurrent);
	var all = [];
	for (s in a) {
		for (c in a[s]) {
			a[s][c].id = s;
			if (servicesCurrent[s]) {
				for (x in a[s][c]) {
					if (['status', 'timestamp', 'id'].indexOf(x) === -1 && a[s][c][x] !== servicesCurrent[s][x]) {
							all.push(a[s][c]);
							break;
					}
				}
			} else {
				all.push(a[s][c]);
			}
		}
	}
	all.sort(function(a, b) {
		return (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime();
	});
	archive.all = all;
	archive.shown = all;
	archive.fuse = new Fuse(all, archiveFuse);
	archiveDisplay();
	archive.reset();
}

function archiveListen(uid) {
	firebase.database().ref('/users/'+uid+'/archive').on("value", function(snapshot) {
		var a = snapshot.val();
		if (a) {
			archiveCurrent = a;
			archiveUpdate();
		}
	});
}
