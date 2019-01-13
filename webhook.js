const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const path = require('path')
const synonym = require('./synonym_parser')
const app = express()
const port = process.env.PORT || 3000


const page_body = `
<htmL>
<head>
<title>Sünonüümirobot</title>
<script>
window.fbAsyncInit = function() {
  FB.init({
	appId            : 'your-app-id',
	autoLogAppEvents : true,
	xfbml            : true,
	version          : 'v3.2'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
</script>
</head>
<body>
<h1>Olen sünonüümirobot, kirjuta mulle!</h1>
<div class="fb-messengermessageus" 
  messenger_app_id="1185899384869819" 
  page_id="1473407816103463"
  color="white"
  size="xlarge">
</div>
</body>
</html>
`


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
	response.send(page_body);
})

app.post('/webhook', function(req, res) {
	var data = req.body

	if(data.object === 'page') {

		data.entry.forEach(function(entry) {
			var pageID = entry.id
			var timeOfEvent = entry.time

			entry.messaging.forEach(function(event) {
				if(event.message) {
					synonym.receivedMessage(event)
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


//run the server and listen
app.listen(port, (err) => {
	if(err) {
		return console.log('This is not good', err)
	}

	console.log(`Server running, port: ${port}`)
})
