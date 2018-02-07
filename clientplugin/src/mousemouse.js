var clientId = null;
var lastCoords = {x:0, y:0}
var currentCoords = {x:0, y:0}

var DDPClient = require("ddp-client");

var ddpclient = new DDPClient({
  // All properties optional, defaults shown
  host : "localhost",
  port : 3000,
  ssl  : false,
  autoReconnect : true,
  autoReconnectTimer : 500,
  maintainCollections : true,
  ddpVersion : '1',  // ['1', 'pre2', 'pre1'] available
  // Use a full url instead of a set of `host`, `port` and `ssl`
  //url: 'ws://localhost.com/websocket',
  //socketConstructor: WebSocket // Another constructor to create new WebSockets
});

console.log("connecting")

ddpclient.connect(function(error, wasReconnect) {
  // If autoReconnect is true, this callback will be invoked each time
  // a server connection is re-established
  if (error) {
    console.log('DDP connection error!');
    return;
  }

  if (wasReconnect) {
    console.log('Reestablishment of a connection.');
  }

  console.log('connected!');

  setTimeout(function () {
    /*
     * Call a Meteor Method
     */
    ddpclient.call(
      'registerclient',             // name of Meteor Method being called
      [],            // parameters to send to Meteor Method
      function (err, result) {   // callback which returns the method call results
        clientId = result;
        console.log('Acquired clientId: ' + clientId);
      }
    );
  }, 0);

  ddpclient.subscribe(
    'clients',                  // name of Meteor Publish function to subscribe to
    [],                       // any parameters used by the Publish function
    function () {             // callback when the subscription is complete
      console.log('subscription complete:');
      console.log(ddpclient.collections.clients);
    }
  );

  var observer = ddpclient.observe("clients");
  observer.added = function(id) {
    console.log("[ADDED] to " + observer.name + ":  " + id);
    var node = document.createElement("I");
    node.id = id;
    document.getElementById("mousemouse-overlay").appendChild(node);
  };
  observer.changed = function(id, oldFields, clearedFields, newFields) {
    document.getElementById(id).style.left = newFields.x;
    document.getElementById(id).style.top = newFields.y;
  };
  observer.removed = function(id, oldValue) {
    document.getElementById(id).outerHTML='';
  };  

})

ddpclient.on('message', function (msg) {
  //console.log("ddp message: " + msg);
});

/* ------------------- listener ------------------ */

window.onmousemove = function(event) {
  currentCoords.x = event.clientX;
  currentCoords.y = event.clientY;
}

window.setInterval( function(event) {
  var x = currentCoords.x;
  var y = currentCoords.y;
  
  if (x === lastCoords.x && y === lastCoords.y ) return; // no change

  ddpclient.call(
    'setmouse',             // name of Meteor Method being called
    [{id:clientId, x:x, y:y}],            // parameters to send to Meteor Method
    function (err, result) {   // callback which returns the method call results
      lastCoords.x = x;
      lastCoords.y = y;      
    }
  );  

}, 50);