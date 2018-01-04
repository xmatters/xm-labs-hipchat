var hipchatEndpoint = "HipChat"
var hipchatToken = constants["HipChat Token"];


/*
  HipChat Shared Library

  This shared library is for interacting with HipChat.

  Exposed methods:

     createRoom - Creates a HipChat romm with the given payload. If the room already exists, it retrieves the room and in both cases returns the room details. 
        payload - The room payload. This should contain a "name" element containing the room name. 



   Usage:

     
     // Import the HipChat Shared Library
     var HipChat = require( 'HipChat' );


	 ////////////  createRoom ////////////////
     var payload = {
	 	"name": data.issue_key,
	 	"topic": 'xMatters Engage: ' + summary
	 };

	 var room = HipChat.createRoom( payload );
	 ////////////////////////////////////////////////


     /////////// getRoomHistory /////////////////////
     /// Assuming the room name is stored in the `issue_key` property:
     var history = HipChat.getRoomHistory( callback.eventProperties.issue_key );
	 ////////////////////////////////////////////////


	 /////////// inviteUserToRoom ///////////
	 /// Assuming the room name is stored in the `issue_key` property:
	 HipChat.inviteUserToRoom( callback.recipient, callback.eventProperties.issue_key );
	 ////////////////////////////////////////
*/ 


/**
* 
* @param {String}    
* @return {String} 
*/
exports.isInstanceValid = function() {
    if (hipchatEndpoint == null || hipchatEndpoint == "") {
        console.log("HipChat endpoint is not set");
        return false;
    }
    
    if (hipchatToken == null || hipchatToken == "") {
        console.log("HipChat Token is not set");
        return false; 
    }
    return true;
}

/**
* 
* @param {Payload}    
* @return {Room Entity} 
*/
exports.createRoom = function( payload ) {

  if (!this.isInstanceValid()) { return null } 
  
  var req = http.request({
      'endpoint': hipchatEndpoint,
      'path': '/v2/room',
      'method': 'POST',
      'headers': {
          'Content-type': 'application/json',
          'Authorization': 'Bearer ' + hipchatToken
      }
  });
  
  var respRAW = req.write( payload );

  resp = JSON.parse( respRAW.body );
  
  if( resp.entity ) 
    return resp.entity;
  
  if( resp.error.code == 400 ) {
      req = http.request({ 
          'endpoint': hipchatEndpoint,
          'path': '/v2/room/' + encodeURIComponent( payload.name ),
          'method': 'GET',
          'headers': {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + hipchatToken
          }
      });
      
      respRAW = req.write();
      
      return JSON.parse( respRAW.body );
  }
  
  return null;

}



}

/**
* 
* @param {String}    
* @return {String} 
*/
exports.inviteUserToRoom = function(userName, roomName) {
    if (!this.isInstanceValid()) { return null } 
    userName = encodeURIComponent(userName);
    roomName = encodeURIComponent(roomName);
    
    var request = http.request({
        'endpoint': hipchatEndpoint,
        'method': 'POST',
        'path': 'v2/room/' + roomName + '/invite/@' + userName + '?auth_token=' + hipchatToken,
        'headers': {
            'Content-Type': 'application/json'
        }
    });

    var response = request.write();
    if (response.statusCode < 200 || response.statusCode > 299) {
        console.log("inviteUserToRoom received status code: " + response.statusCode);
        return false;
    }
    
    return true;
}

/**
* 
* @param {String}    
* @return {String} 
*/
exports.getRoomHistory = function(roomName) {
    if (!this.isInstanceValid()) { return null } 
    roomName = encodeURIComponent(roomName);
    
	var request = http.request({
        'endpoint': hipchatEndpoint,
        'method': 'GET',
        'path': 'v2/room/' + roomName + '/history?auth_token=' + hipchatToken,
        'headers': {
            'Content-Type': 'application/json'
        }
    });
    
    var response = request.write();
    if (response.statusCode < 200 || response.statusCode > 299) {
        console.log("getRoomHistory received status code: " + response.statusCode);
        return null;
    }
    
    var items = JSON.parse(response.body).items;
    
    var history = "";
    for (i = 0; i < items.length; i++) {
        if (items[i].type == "message") {
            history += "\n[" + items[i].from.mention_name + "] " + items[i].message;
        }
    }
    return history;
}

/**
* 
* @param {String}    
* @return {String} 
*/
exports.postMessage = function(roomName, message, data) {
    if (!this.isInstanceValid()) { return null } 
    roomName = encodeURIComponent(roomName);
    
    data = (typeof data !== 'undefined') ?  data : {};
    data.message = message;    
    
    var request = http.request({
        'endpoint': hipchatEndpoint,
        'method': 'POST',
        'path': 'v2/room/' + roomName + '/notification?auth_token=' + hipchatToken,
        'headers': {
            'Content-Type': 'application/json'
        }
    });

    var response = request.write(data);
    if (response.statusCode < 200 || response.statusCode > 299) {
        console.log("postMessage received status code: " + response.statusCode);
        return false;
    }
    
    return true;
}
