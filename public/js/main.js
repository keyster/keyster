var servicesCurrent = {};
var settingsCurrent = {};
var archiveCurrent = {};

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
		tab: 'home'
	},
	methods: {
		toggle: function(item) {
			this.tab = item;
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
		call: function(title, message, callback) {
			this.title = title;
			this.message = message;
			this.callback = callback;
			this.display = true;
		},
		confirm: function(event) {
			this.callback();
			this.close();
		},
		close: function(event) {
			this.display = false;
		}
	}
});
