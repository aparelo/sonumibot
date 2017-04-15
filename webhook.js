const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/webhook', function(req, res) {
	if(req.query['hub.mode'] && req.query['hub.verify_token'] === 'thisIsPasswordVerify') {
		console.log("kinnitan...");
		res.status(200).send(req.query['hub.challenge']);
	}
	else {
		console.log("Failed, something is not right");
		res.sendStatus(403);
	}
})


app.get('/', (request, response) => {
	response.send('This is a bot, find us on Messenger, nothing to see here.')
})

/*app.post('/webhook', function(req, res) {
	console.log("Here");
	console.log(req.body)
	var data = req.body
})*/

app.post('/webhook', function(req, res) {
	var data = req.body

	if(data.object === 'page') {

		data.entry.forEach(function(entry) {
			var pageID = entry.id
			var timeOfEvent = entry.time

			entry.messaging.forEach(function(event) {
				if(event.message) {
					console.log(JSON.stringify(event.message))
					receivedMessage(event)
				}
				else {
					console.log('Unknown event: ', event)
					console.log(JSON.stringify(event.message))
					receivedMessage(event)
				}
			})
		})
		res.sendStatus(200)
	}
})

function receivedMessage(event) {
	var senderID = event.sender.id
	var receipientID = event.recipient.id
	var timeOfMessage = event.timestamp
	var message = event.message

	console.log("Message:", message.text);

	var messageID = message.mid

	var messageText = message.text
	messageText = reverseText(messageText)
	var messageAttachments = message.attachments

	if(messageText) {
		sendTextMessage(senderID,messageText)
	} 
}




//run the server and listen
app.listen(port, (err) => {
	if(err) {
		return console.log('This is not good', err)
	}

	console.log(`Server running, port: ${port}`)
})


function sendTextMessage(receipientID,messageText) {
	console.log("Message text: ", messageText)
	var messageData = {
		recipient: {
			id: receipientID
		},
		message: {
			text:messageText
		}
	}

	callSendAPI(messageData)
}

function callSendAPI(messageData) {
	request({
		uri: 'http://localhost:3001/v2.6/me/messages',
		qs: {access_token: 'EAAQ2kbeTE7sBAJEm9GsrzqLcm0q0NqL9y3kzgKbNRyj2fhxZBCY9ls0ITVOJVquxjJZChq8ZAXRB5YquS0LFSg4NODCeZCEkroC0Y2EROuWmrXt4ZBRozOKWJoG01ky7rBkUFy8PMg2F9qoS0BYKZAsuKf0UMo3NQk7biOHWn4ZAwZDZD'},
		method: 'POST',
		json: messageData
	}, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			var receipientId = body.recipient_id
			var messageId = body.message_id
		}

		else {
			console.log('Error sending')
			console.log(response)
			console.log(error)
		}
	})
}

function reverseText(text) {
	var o = '';
	for (var i = text.length - 1; i >= 0; i--)
    	o += text[i];
  	return o;
}