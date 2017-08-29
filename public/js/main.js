const messages = {
	edit: 'Reverting will update the existing entry to the values below.',
	deletion: 'Reverting will restore the entry below.',
	error: 'Either something on our end malfunctioned or someone has \
	tampered with your account. We highly recommend reverting to fix \
	this entry.'
}

Vue.component('text-input', {
	props: ['name', 'label', 'max', 'placeholder', 'value'],
	template: '<div><label class="label">{{ label }}</label><div class="control">\
	<input class="input" type="text" :maxlength="max" :placeholder="placeholder" \
	:value="value" @input="change"></div></div>',
	methods: {
		change: function(event) {
			this.$emit('change', this.name, event.target.value);
		}
	}
});

Vue.component('num-input', {
	props: ['name', 'label', 'max', 'placeholder', 'value'],
	template: '<div><label class="label">{{ label }}</label><div class="control">\
	<input class="input" type="number" :max="max" :placeholder="placeholder" \
	:value="value" @input="change"></div></div>',
	methods: {
		change: function(event) {
			this.$emit('change', this.name, parseInt(event.target.value, 10));
		}
	}
});

var menu = new Vue({
	el: '#menu',
	data: {
		auth: null,
		curr: ''
	},
	methods: {
		toggle: function(item) {
			this.curr = item;
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
		edit: false
	},
	computed: {
		display: function() { return menu.auth && select.shown.length > 0 && menu.curr === ''; },
	},
	methods: {
		generate: function(event) {
			this.password = hash(this.entry, this.master);
			this.master = '';
			this.notify = true;
			setTimeout(()=>{
				this.notify = false;
				this.password = '';
			}, 5000);
		},
		change: function(name, value) {
			this.new[name] = value;
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
			select.select(0);
			this.edit = false;
		},
		confirmArchive: function(event) {
			confirm.title = 'Archive Entry';
			confirm.message = 'Are you sure you want to archive this entry? You will \
			have 30 days to revert changes.';
			confirm.callback = this.archive;
			confirm.display = true;
		}
	}
});

var select = new Vue({
	el: '#select',
	data: {
		entries: [],
		shown: [],
		selected: 0,
		fuse: null
	},
	computed: {
		display: function() { return menu.auth && menu.curr === ''; },
	},
	methods: {
		select: function(index) {
			this.selected = index;
			generate.entry = this.shown[index];
			generate.master = '';
			generate.password = '';
			generate.notify = false;
			generate.loading = false;
		},
		search: function(event) {
			if (event.target.value) {
				this.shown = this.fuse.search(event.target.value);
			} else {
				this.shown = this.entries;
			}
			this.select(0);
		}
	}
});

var update = new Vue({
	el: '#update',
	data: {
		response: {
			N: null,
			r: null,
			p: null,
			length: null,
			alphabet: null
		}
	},
	computed: {
		display: function() { return menu.curr === 'update'; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		update: function(event) {
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(this.response);
			menu.curr = '';
		}
	}
});

var create = new Vue({
	el: '#create',
	data: {
		response: {
			title: '',
			subtitle: '',
			description: '',
			N: null,
			r: null,
			p: null,
			length: null,
			alphabet: null
		},
		show: false
	},
	computed: {
		display: function() { return menu.curr === 'create'; }
	},
	methods: {
		change: function(name, value) {
			this.response[name] = value;
		},
		create: function(event) {
			var service = {}
			Object.assign(service, this.response);
			service.salt = salt(32);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services').push(service);
			this.show = false;
			menu.curr = '';
		}
	}
});

var archive = new Vue({
	el: '#archive',
	data: {
		changes: [],
		shown: [],
		selected: 0,
		fuse: null
	},
	computed: {
		display: function() { return menu.curr === 'archive'; },
		active: function() {
			if (this.shown[this.selected]) {
				return this.shown[this.selected];
			}
			return {};
		},
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
		},
		search: function(event) {
			if (event.target.value) {
				this.shown = this.fuse.search(event.target.value);
			} else {
				this.shown = this.changes;
			}
			this.select(0);
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

var profile = new Vue({
	el: '#profile',
	data: {
		number: null,
		raw: null
	},
	computed: {
		display: function() { return menu.curr === 'profile'; }
	},
	methods: {
		logout: function(event) {
			firebase.auth().signOut();
		},
		confirmLogout: function(event) {
			confirm.title = 'Log Out';
			confirm.message = 'Are you sure you want to log out?';
			confirm.callback = this.logout;
			confirm.display = true;
		},
		import: function(event) {
			var imported = JSON.parse(profile.raw);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/settings').set(imported.settings);
			firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/services').set(imported.services);
			menu.curr = '';
		},
		confirmImport: function(event) {
			confirm.title = 'Import Data';
			confirm.message = 'Are you sure you want to import this data? You will \
			have 30 days to revert changes.';
			confirm.callback = this.import;
			confirm.display = true;
		}
	}
});

var confirm = new Vue({
	el: '#confirm',
	data: {
		display: false,
		title: null,
		message: null,
		callback: null
	},
	methods: {
		close: function(event) {
			this.display = false;
		},
		confirm: function(event) {
			this.callback();
			this.close();
		}
	}
});
