var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;


mongo.connect('mongodb://127.0.0.1/chat',function(err,db){
	if(err) throw err;
	client.on('connection',function(socket){

		var col = db.collection('messages'),
			sendStatus = function(s){
				socket.emit('status',s);
			},
			message = function(s){
				socket.emit('success');
			};

		// emit all message
		col.find().limit(100).sort({_id:1}).toArray(function(err,res){
			if(err) throw err;
			socket.emit('output',res);

		});


		socket.on('input',function(data){ // for input
			var name = data.name,
				message = data.message,
				whiteSpacePattern = /^\s*$/;
				if(whiteSpacePattern.test(name)  || whiteSpacePattern.test(message)){
					sendStatus('Name And Message is required.');
				}else{
					col.insert({name: name, message: message},function(){

						// Emit Listen message to All clients
						client.emit('output',[data]);

						sendStatus({
							message: 'Message sent',
							name: name,
							text: message,
							success: true
						});;
					});
				}
			
		});
	});

});


