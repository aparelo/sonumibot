const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const path = require('path')
const synonym = require('./synonym_parser')
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

app.post('/webhook', function(req, res) {
	var data = req.body

	if(data.object === 'page') {

		data.entry.forEach(function(entry) {
			var pageID = entry.id
			var timeOfEvent = entry.time

			entry.messaging.forEach(function(event) {
				if(event.message) {
					receivedMessage(event)
				}
				else {
					console.log('Unknown event: ', event)
					console.log(JSON.stringify(event.message))
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

	var keyword = message.text.toLowerCase()
	var messageAttachments = message.attachments

	if(keyword) {
		synonym.sendMessage(senderID,keyword)
	} 
}


//run the server and listen
app.listen(port, (err) => {
	if(err) {
		return console.log('This is not good', err)
	}

	console.log(`Server running, port: ${port}`)
})
