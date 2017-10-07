const remote = require('electron').remote;

const path = require('path');
const url = require('url');

function redirect() {
	remote.getCurrentWindow().loadURL(url.format({
		pathname: path.join(__dirname, '../index.html'),
		protocol: 'file:',
		slashes: true
	}));
}