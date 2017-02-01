var mysql = require('mysql');
var tmi = require('tmi.js');
var oauth = require('./oauth.js');
var mysqllogin = require('./mysqllogin.js');

var connectiondb = mysql.createConnection({
	host: mysqllogin.host,
	user: mysqllogin.user,
	password: mysqllogin.password,
	database: mysqllogin.database
});

connectiondb.connect(function(err){
	if(!err) {
    	console.log("Database is connected ... \n\n");  
	}
	else {
    	console.log("Error connecting database ... \n\n");  
	}
});

var options = {
	options: {
		debug: true
	},
	connection: {
		reconnect: true
	},
	identity: {
		username: oauth.username,
		password: oauth.password
	},
	channels: ["momcards", "wecri", "squee_gob"]
};

var client = new tmi.client(options);

client.connect();

client.on('chat', function(channel, user, message, self) {
	if(self) return
	
	var msg = message.toLowerCase();
	var args = msg.split(" ");

	if(msg.indexOf('+momcards') === 0) {
		client.say("momcards", "Pour retrouver toutes les infos sur vos jeux de cartes préférés, faites un tour sur https://www.momcards.fr/");
	}

	if(msg.indexOf('+help') === 0) {
		client.say(channel, "I'm in beta stage so, for now, I'll only respond to these commands : +help, +card. If you have request or any comment, please contact Squee_Gob.");
	}

	if(msg.indexOf('+card') === 0) {

		if(typeof args[1] !== 'undefined' && args[1].trim() !== '') {

			if(args[1].length > 2) {
				var carte = ""
			
				for (var i = 1; i < args.length; i++) {
					carte =carte+ " " +args[i]
					carte = carte.trim()
				};
			
				var sql = 'SELECT * FROM `card` WHERE `name` LIKE "%'+carte+'%"';
				var row ="";

				connectiondb.query(sql, function (err, res) {
					console.log(res.length, carte, res);
					if(res.length !== 0) {
						if (res.length ==1) {
							row = res[0].name+" ("+res[0].cost+") - "+res[0].type+" - "+res[0].text+" - "+res[0].rarity+" "+res[0].collec
							client.say(channel, row);
						}
						else {
							//if(res.length >5) {
							//	client.say(channel, "Too many answers, please try again.")
							//}
							//else {
								for (var i = 0; i < res.length; i++) {
									row = row+"["+res[i].name+"] "
								}
								client.say(channel, "Too many answers, you'll have to choose between "+row)
							//}
						}
					}
					else {
						client.say(channel, "I couldn't find any card with the name ["+carte+"]. Try again ^^")
					}
				});	
			}
			else {
				client.say(channel, "You have to input at least 3 letters !")
			}	
		}
		else {
			client.say(channel, "+card purpose is to display card text, the correct syntax is : +card [card name].");
		}
	}
});


