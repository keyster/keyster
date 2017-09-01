const messages = {
	edit: 'Reverting will update the existing entry to the values below.',
	deletion: 'Reverting will restore the entry below.'
}

var archive = new Vue({
	el: '#archive',
	data: {
		all: [],
		shown: [],
		active: null,
		selected: 0,
		fuse: null,
		query: '',
		height: 8,
		tab: 'edits',
		scrolled: Math.round(document.getElementsByClassName('archive-scroll')[0].scrollTop/41)
	},
	updated: function() {
		if (!this.$refs.homelist) {
			return;
		}
		var diff = window.innerHeight -
			(this.$refs.archivelist.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop) -
			(document.body.getBoundingClientRect().bottom - archive.$refs.archivelist.getBoundingClientRect().bottom);
		if (diff > 410) {
			this.height = Math.floor(diff / 41);
		} else {
			this.height = 8;
		}
	},
	computed: {
		display: function() { return menu.tab === 'archive'; },
		disabled: function() {
			if (this.active.status !== 'deletion') {
				var entry = select.all.filter(function (entry) { return entry.id === archive.active.id })[0]
				if (!entry) { return true }
				for (prop in this.active) {
					if (!['status', 'timestamp', 'id', 'display'].includes(prop) && this.active[prop] !== entry[prop]) {
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
				if (!['display', 'status', 'timestamp', 'id'].includes(x)) {
					edits.push([x, this.active[x]]);
				}
			}
			return edits;
		},
		heightpx: function() { return this.height*41 + 'px' }
	},
	methods: {
		select: function(index) {
			this.selected = index;
			this.active = this.shown[index];
		},
		reset: function(event) {
			var index = this.shown.indexOf(this.shown.filter(function(e) { return e.status === archive.tab.slice(0, -1)})[0])
			this.select(index != -1 ? index : 0)
		},
		maintain: function(event) {
			var i = 0;
			if (this.active) {
				for (e in this.shown) {
					if (this.active.id === this.shown[e].id) {
						i = Number(e);
						break;
					}
				}
			}
			this.select(i);
		},
		search: function(event) {
			if (this.query) {
				this.shown = this.fuse.search(this.query).filter(function(e) { return e.status === archive.tab.slice(0, -1) });
			} else {
				this.shown = this.all.filter(function(e) { return e.status === archive.tab.slice(0, -1) });
			}
			this.maintain();
		},
		revert: function(event) {
			if (this.disabled) {
				return;
			}
			var reverted = {};
			Object.assign(reverted, select.all.filter(function(entry) { return entry.id === archive.active.id })[0])
			Object.assign(reverted, this.active);
			delete reverted.display;
			delete reverted.status;
			delete reverted.timestamp;
			delete reverted.id;
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.active.id).set(reverted);
			archiveUpdate()
		},
		changeTab: function(toTab) {
			this.tab = toTab
			this.reset()
			this.search()
		},
		scroll: function(event) {
			var fromBottom = archive.$refs.archivelist.scrollTop - (archive.$refs.archivelist.scrollHeight - archive.$refs.archivelist.offsetHeight)
			if (fromBottom < 1 && fromBottom >= 0) {
				var exact = archive.$refs.archivelist.scrollTop / 41;
				var rounded = Math.round(exact);
				archive.scrolled = rounded;
			} else {
				var exact = archive.$refs.archivelist.scrollTop / 41;
				var rounded = Math.round(exact);
				var diff = Math.abs(rounded-exact);
				if (diff < .03) {
					archive.scrolled = rounded;
				} else {
					archive.scrolled = NaN;
				}
			}
		}
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
	var archives = {};
	Object.assign(archives, archiveCurrent);
	var all = [];
	for (id in archives) {
		for (changeId in archives[id]) {
			archives[id][changeId].id = id;
			if (servicesCurrent[id]) {
				if (archives[id][changeId].status === "edit") {
					all.push(archives[id][changeId]);
				}
			} else {
				all.push(archives[id][changeId]);
			}
		}
	}
	all.sort(function(a, b) {
		return (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime();
	});
	archive.all = [];
	for (a in all) {
		duplicate = false;
		var check1 = {};
		Object.assign(check1, all[a]);
		for (s in archive.all) {
			var check2 = {};
			Object.assign(check2, archive.all[s]);
			if (check1.status === "deletion" && check2.status === "deletion" && check1.id === check2.id) {
				duplicate = true;
			}
		}
		if (!duplicate) {
			archive.all.push(all[a]);
		}
	}
	archive.shown = {};
	Object.assign(archive.shown, archive.all);
	archive.fuse = new Fuse(all, archiveFuse);
	archiveDisplay();
	archive.search();
	archive.changeTab(archive.tab)
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
