function redirect() {
	location.href = "login/index.html"
}

function offline() {
	location.href = "offline/index.html"
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		profile.number = user.phoneNumber;
		servicesListen(user.uid);
		settingsListen(user.uid);
		archiveListen(user.uid);
		menu.auth = true;
	} else {
		redirect();
	}
})

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
		}, 5000);
	}
});
