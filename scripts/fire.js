var gcm = require('../lib/node-gcm');
var requestify = require('requestify'); 
var schedule = require('node-schedule');
var sender = new gcm.Sender(process.env.SERVER_GCM_KEY);

var now = new Date();
now.setMinutes(now.getMinutes()+1);
console.log("starting fire at "+now);
scheduleNextFire(now);	// On lance la machine à la date maintenant
function scheduleNextFire(date){
	var scheduler = schedule.scheduleJob(date, function(){
        	fire(date);                                       
	});
}

function fire(date){
	console.log("looking up available cities");
	requestify.get('http://localhost:8087/schemas/list').then(function(response) {
		var schemas = response.getBody();
		for (var i=0; i<schemas['schemas'].length; i++){
			var schema = schemas['schemas'][i]['schema_name'];
			console.log("looking up subscriptions for "+schema);
			requestify.get('http://localhost:8087/subscriptions/list?schema='+schema).then(function(response) {
		        	var subscriptions = response.getBody();
		        	for (var i=0; i<subscriptions['time_subscriptions'].length; i++){
					var stop_id = subscriptions['time_subscriptions'][i]['stop_id'];
					var route_id = subscriptions['time_subscriptions'][i]['route_id'];
					var trip_name = subscriptions['time_subscriptions'][i]['trip_name'];
					var stop_name = subscriptions['time_subscriptions'][i]['stop_name'];
					var route_short_name = subscriptions['time_subscriptions'][i]['route_short_name'];
					var route_color = subscriptions['time_subscriptions'][i]['route_color'];
					//var fire = new Date("May 25, 2016 16:26:00");
					sendNotification("Mise à jour des horaires", "Date "+date.toString(), "global");				
					requestify.get('http://localhost:8087/times/list?schema='+schema+'&stop_id='+stop_id+'&route_id='+route_id).then(function(response) {
			                        var times = response.getBody();
						for (var i=0; i<times['times'].length; i++){
							var time = times['times'][i];
							var departure_time = time['departure_time'].substring(0,5);
							var fire = new Date();
							fire.setHours(departure_time.substring(0,2));
							fire.setMinutes(departure_time.substring(3,5)-10);
							fire.setSeconds(0);
							console.log("Departure "+departure_time+" will be fired at "+fire);
	                	                        var j = schedule.scheduleJob(fire, function(){
								console.log("Firing "+departure_time);
								sendNotification(route_short_name+" -> "+trip_name, stop_name+" : prochain à "+departure_time, schema+"-"+route_id+"-"+stop_id, route_color);
	                                        	});
						}
					});
	        		}	
			});
		
		}
		date.setDate(date.getDate()+1);
		schedule(date);
	
	});
}

function sendNotification(title, body, topic, color){
	var message = new gcm.Message();
        message.addNotification('title',  title);
        message.addNotification('icon', 'ic_notification_tray_icon');
        message.addNotification('body', body);
        message.addNotification('tag', topic);
	message.addNotification("time_to_live", 300); // 5 minutes timeout
	message.addNotification("delay_while_idle", false);	// always deliver the message, regardless of the device state
	message.addNotification("collapse_key", topic);	// If a device receives a second message and the first still isn't opened, the first will be discarded
							// This works only for messages with same key, in that case we use a particular topic
	if(color!=null){message.addNotification('color', '#'+color);}
	else{message.addNotification('color', '#2574A9');}
	var topic = '/topics/'+topic.replace(':', '_');
	console.log("topic = "+topic);
        sender.sendNoRetry(message, { topic: topic }, function (err, response) {
        	if(err) console.error(err);
                else    console.log(response);
        });
}

require('net').createServer().listen();
