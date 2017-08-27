function prepare(N) {
	scrypt_module_factory(function (s) {
		window.scrypt = s;
	}, { requested_total_memory: N * 2048 });
}

function request(length, radix) {
	return Math.ceil(Math.log(Math.pow(radix, length)) / Math.log(256));
}

function integer(bytes) {
	var v = bigInt();
	for (var i=0; i<bytes.length; i++) {
		v = v.times(256).plus(bytes[i]);
	}
	return v;
}

function encode(length, radix, alphabet, raw) {
	radix = bigInt(radix);
	var v = integer(raw).mod(radix.pow(length));
	var password = '';
	var round;
	for (var i=length-1; i>=0; i--) {
		round = v.divmod(radix.pow(i));
		password += alphabet.charAt(round.quotient);
		v = round.remainder;
	}
	return password;
}

function hash(entry, master) {
	prepare(entry.N);
	var raw = scrypt.crypto_scrypt(
		scrypt.encode_utf8(master),
		scrypt.encode_utf8(entry.salt),
		entry.N,
		entry.r,
		entry.p,
		request(entry.length, entry.alphabet.length)
	);
	return encode(entry.length, entry.alphabet.length, entry.alphabet, raw);
}