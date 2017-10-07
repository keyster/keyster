const remote = require('electron').remote;

const path = require('path');
const url = require('url');

function online() {
	remote.getCurrentWindow().loadURL(url.format({
		pathname: path.join(__dirname, '../index.html'),
		protocol: 'file:',
		slashes: true
	}));
}

var connection = firebase.database().ref(".info/connected");
connection.on("value", function(snap) {
	if (snap.val()) {
		window.connected = true;
		setTimeout(function() {
			if (window.connected) {
				online();
			}
		}, 2000);
	} else {
		window.connected = false;
	}
});