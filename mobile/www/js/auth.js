function redirect() {
	location.href = "login/index.html"
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
