const settings = {
	N: 16384,
	r: 8,
	p: 1,
	length: 32,
	alphabet: 'abcdefghijklmnopqrstuvwxyz'
}

const entries = [
	{
		uuid: '1c108e00-13bc-42d5-b57d-c89858cf3a8f',
		title: 'Google',
		subtitle: 'william@defund.io',
		description: 'Secondary account.',
		salt: 'salt0',
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'abcdefghijklmnopqrstuvwxyz'
	},
	{
		uuid: 'cfbee598-2d97-4ef0-914a-e0fd36cc622e',
		title: 'GitHub',
		subtitle: 'defund',
		description: '2FA enabled.',
		salt: 'salt1',
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'abcdefghijklmnopqrstuvwxyz'
	},
	{
		uuid: 'bafe582e-f364-428c-b913-736e8eaa98e5',
		title: 'Twitter',
		subtitle: 'defunded',
		description: 'Need defund.',
		salt: 'salt2',
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'abcdefghijklmnopqrstuvwxyz'
	},
	{
		uuid: '8386024d-3705-4518-940e-8cb2eb3b2c8b',
		title: 'Keybase',
		subtitle: 'defund',
		description: 'More crypto!',
		salt: 'salt3',
		N: 16384,
		r: 8,
		p: 1,
		length: 32,
		alphabet: 'abcdefghijklmnopqrstuvwxyz'
	},
];

var menu = new Vue({
	el: '#menu',
	methods: {
		togglecreate: function(event) {
			create.display = !create.display;
		}
	}
});

var create = new Vue({
	el: '#create',
	data: {
		settings: settings,
		display: false,
		show: false
	}
});

var generate = new Vue({
	el: '#generate',
	data: {
		entry: entries[0],
		master: '',
		password: '',
		notify: false,
		loading: false
	},
	methods: {
		generate: function(event) {
			this.loading = true;
			this.password = hash(this.entry, this.master);
			this.loading = false;
			this.master = '';
			this.notify = true;
			setTimeout(()=>{
				this.notify = false;
				this.password = '';
			}, 5000);
		}
	}
});

var select = new Vue({
	el: '#select',
	data: {
		entries: entries
	},
	methods: {
		select: function(index) {
			generate.entry = entries[index];
			generate.master = '';
			generate.password = '';
			generate.notify = false;
			generate.loading = false;
		}
	}
});