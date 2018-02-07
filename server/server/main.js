import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  'setmouse'({ id, x, y }) {
    //console.log( id, x, y );
    Clients.update( id, {
      $set: { x:x, y:y, updatedAt:Date.now() }
    });
  },
  'registerclient'() {
    return new Promise((resolve) => {
      Clients.insert({x:null, y:null, updatedAt:Date.now()}, (err,id) => {
        console.log("New client: " + id);
        resolve(id)
      })
    });
  }
})

Meteor.publish("clients", function(){
  return Clients.find();
})

Meteor.setInterval(function(){
  var timeLimit = Date.now() - 60000;
  var query = { 'updatedAt': { $lt: timeLimit } };
  var old = Clients.find(query);
  if (old.count() > 0) {
    console.log(old.count() + " inactive clients");
    old.forEach(function (c) {
      Clients.remove(c);
    });
  }
}, 1000)