const remote = require('electron').remote;

const path = require('path');
const url = require('url');

function redirect() {
	remote.getCurrentWindow().loadURL(url.format({
		pathname: path.join(__dirname, 'login/index.html'),
		protocol: 'file:',
		slashes: true
	}));
}

function offline() {
	remote.getCurrentWindow().loadURL(url.format({
		pathname: path.join(__dirname, 'offline/index.html'),
		protocol: 'file:',
		slashes: true
	}));
}

var connection = firebase.database().ref(".info/connected");
connection.on("value", function(snap) {
	if (snap.val()) {
		window.connected = true;
	} else {
		window.connected = false;
		setTimeout(function() {
			if (!window.connected) {
				offline();
			}
		}, 2000);
	}
});