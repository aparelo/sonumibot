webhook.get('/webhook', function(req, res) {
	if(req.query['hub.mode'] && req.query['hub.verify_token'] === 'thisIsPasswordVerify') {
		console.log("kinnitan...");
		res.status(200).send(req.query['hub.challenge']);
	}
	else {
		console.log("Failed, something is not right");
		res.sendStatus(403);
	}
})