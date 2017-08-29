const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

function clean(uid) {
    return admin.database().ref('/users/'+uid).once('value').then(function(snapshot) {
        var result = snapshot.val();
        var services = result.services;
        var archive = result.archive;
        var equal;
        for (id in archive) {
            if (services[id]) {
                for (eid in archive[id]) {
                    equal = true;
                    for (x in archive[id][eid]) {
                        if (['status', 'timestamp'].indexOf(x) === -1 && archive[id][eid][x] !== services[id][x]) {
                            equal = false;
                            break;
                        }
                    }
                    if (equal) {
                        admin.database().ref('/users/'+uid+'/archive/'+id+'/'+eid).remove();
                    }
                }
            }
        }
    });
}

exports.archive = functions.database.ref('/users/{uid}/services/{id}')
    .onWrite(event => {
        clean(event.params.uid);
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