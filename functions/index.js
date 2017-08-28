const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.archive = functions.database.ref('/users/{uid}/services/{id}')
    .onWrite(event => {
    	if (!event.data.previous.exists()) {
    		return;
    	} else if (!event.data.exists()) {
    		previous = event.data.previous.val();
    		delta = {};
    		delta.status = 'deletion';
    		Object.assign(delta, previous);
    		delta.timestamp = event.timestamp;
    		admin.database().ref('/users/'+event.params.uid+'/archive/'+event.params.id).push(delta);
    	} else {
    		previous = event.data.previous.val();
    		current = event.data.val();
    		delta = {};
    		delta.status = 'edit';
    		for (x in current) {
    			if (previous[x] !== current[x]) {
    				if (['salt', 'N', 'r', 'p', 'length', 'alphabet'].indexOf(x) >= 0) {
    					delta.status = 'error';
    				}
    				delta[x] = previous[x];
    			}
    		}
    		delta.timestamp = event.timestamp;
    		admin.database().ref('/users/'+event.params.uid+'/archive/'+event.params.id).push(delta);
    	}
    });