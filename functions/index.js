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
            for (eid in archive[id]) {
                if (Date.now() - Date.parse(archive[id][eid].timestamp) > 2629746000) {
                    admin.database().ref('/users/'+uid+'/archive/'+id+'/'+eid).remove();
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
    				delta[x] = previous[x];
    			}
    		}
    		delta.timestamp = event.timestamp;
    		admin.database().ref('/users/'+event.params.uid+'/archive/'+event.params.id).push(delta);
    	}
    });