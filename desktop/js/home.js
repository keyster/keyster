var select = new Vue({
	el: '#select',
	data: {
		all: [],
		shown: [],
		query: '',
		selected: 0,
		fuse: null,
		height: 10,
		scrolled: Math.round(document.getElementsByClassName('entries-scroll')[0].scrollTop/41)
	},
	computed: {
		display: function() { return menu.auth && menu.tab === 'home'; },
		heightpx: function() { return this.height*41 + 'px' }
	},
	updated: function() {
		if (!this.$refs.homelist) {
			return;
		}
		var diff = window.innerHeight -
			(this.$refs.homelist.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop) -
			(document.body.getBoundingClientRect().bottom - select.$refs.homelist.getBoundingClientRect().bottom);
		if (diff > 410) {
			this.height = Math.floor(diff / 41);
		} else {
			this.height = 10;
		}
	},
	methods: {
		select: function(index) {
			this.selected = index;
			generate.entry = this.shown[index];
			generate.reset();
		},
		reset: function() {
			this.select(0);
		},
		maintain: function() {
			var i = 0;
			if (generate.entry) {
				for (e in this.shown) {
					if (generate.entry.id === this.shown[e].id) {
						i = Number(e);
						break;
					}
				}
			}
			this.select(i);
		},
		search: function(event) {
			if (this.query) {
				this.shown = this.fuse.search(this.query);
			} else {
				this.shown = this.all;
			}
			if (event) {
				this.select(0);
			} else {
				this.maintain();
			}
		},
		scroll: function(event) {
			var fromBottom = select.$refs.homelist.scrollTop - (select.$refs.homelist.scrollHeight - select.$refs.homelist.offsetHeight)
			if (fromBottom < 1 && fromBottom >= 0) {
				var exact = select.$refs.homelist.scrollTop / 41;
				var rounded = Math.round(exact);
				select.scrolled = rounded;
			} else {
				var exact = select.$refs.homelist.scrollTop / 41;
				var rounded = Math.round(exact);
				var diff = Math.abs(rounded-exact);
				if (diff < .03) {
					select.scrolled = rounded;
				} else {
					select.scrolled = NaN;
				}
			}
		}
	}
});

var generate = new Vue({
	el: '#generate',
	data: {
		entry: null,
		new: {},
		master: '',
		password: '',
		notify: false,
		edit: false,
		type: 'password'
	},
	computed: {
		display: function() { return menu.auth && select.shown.length > 0 && menu.tab === 'home'; },
	},
	methods: {
		generate: function(event) {
			this.password = hash(this.entry, this.master);
			this.master = '';
			this.type = 'password';
			this.notify = true;
			setTimeout(()=>{
				this.reset();
			}, 5000);
		},
		reset: function(event) {
			this.password = '';
			this.master = '';
			this.type = 'password';
			this.notify = false;
		},
		change: function(name, value) {
			this.new[name] = value;
		},
		toggle: function(event) {
			if (this.type === 'password') {
				this.type = 'text';
			} else {
				this.type = 'password';
			}
		},
		update: function(event) {
			var updated = {};
			Object.assign(updated, this.entry);
			Object.assign(updated, this.new);
			delete updated.id;
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.entry.id).set(updated);
			this.edit = false;
		},
		archive: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services/'+this.entry.id).remove();
			select.reset();
			this.edit = false;
		},
		confirmArchive: function(event) {
			confirm.call('Archive Entry',
				'Are you sure you want to archive this entry? You will have 30 days to revert changes.',
				this.archive);
		}
	}
});

const selectFuse = {
	shouldSort: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 16,
	minMatchCharLength: 1,
	keys: [
		"title",
		"subtitle"
	]
};

function servicesListen(uid) {
	firebase.database().ref('/users/'+uid+'/services').on("value", function(snapshot) {
		var s = snapshot.val();
		if (s) {
			localStorage.setItem("services", JSON.stringify(s));
			servicesCurrent = s;
			var all = [];
			var entry;
			for (e in s) {
				entry = {};
				Object.assign(entry, s[e]);
				entry.id = e;
				all.push(entry);
			}
			all.sort(function(a, b) {
				if (a.title < b.title) { return -1; }
				if (a.title > b.title) { return 1; }
				return 0;
			});
			select.all = all;
			select.shown = all;
			select.fuse = new Fuse(all, selectFuse);
			select.search();
			profileUpdate();
			archiveUpdate();
		} else {
			servicesCurrent = {};
			select.all = [];
			select.shown = [];
			select.fuse = null;
			profileUpdate();
			archiveUpdate();
		}
	});
}
