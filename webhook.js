const express = require('express')
const app = express()
const port = process.env.PORT || 8080

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
	console.log(req.body)
	var data = req.body
})

app.post('/webhook', (req, res) => {
	var data = req.body

	if(data.object === 'page') {

		data.entry.forEach((event) => {
			if(event.message) {
				receivedMessage(event)
			}
			else{
				console.log('Unknown event: ', event)
			}
		})
		res.sendStatus(200)
	}
})

function receivedMessage(event) {
	console.log(event.message);
}




//run the server and listen
app.listen(port, (err) => {
	if(err) {
		return console.log('This is not good', err)
	}

	console.log(`Server running, port: ${port}`)
})