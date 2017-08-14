var crypto = window.crypto || window.msCrypto;

function salt(length) {
	var salt = "";
	values = new Uint32Array(length);
	crypto.getRandomValues(values);
	for(var i=0; i<length; i++) {
		salt += String.fromCharCode(values[i] % 256);
	}
	return salt;
}