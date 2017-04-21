const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const querystring = require('querystring')
const cheerio = require('cheerio')

const app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))

var messageQueue = []
var waiting = false


module.exports = {

	receivedMessage: function(event) {
		var senderID = event.sender.id
		var receipientID = event.recipient.id
		var timeOfMessage = event.timestamp
		var message = event.message
		var messageAttachments = message.attachments

		console.log("Message:", message);
		console.log("echo:", message.is_echo);

		var messageID = message.mid
		if(message.text && !messageAttachments && !message.is_echo) {
			var keyword = message.text.toLowerCase()
			sendMessage(senderID,keyword)
			//sendBatchMessages(senderID)
		}
		else if(messageAttachments && !message.is_echo) {
			var messageText = "Vabandust, ma ei oska manustega midagi teha. Proovi mult mõne sõna kohta küsida."
			messageQueue.push(messageText)
			sendBatchMessages(senderID)
		}
		else if(message.is_echo) {
			waiting = false
			console.log(messageQueue);
			sendBatchMessages(receipientID)
		}
	}




}

function sendMessage(recepientID, keyword) {
	const JSONPassword = 'sapa170417'
	const baseUrl = 'http://www.eki.ee/dict/sys/index.cgi/'
	
	//create querystring
	var string = querystring.stringify({
		Z: 'json',
		X: JSONPassword,
		Q: keyword
	})

	var stringNoJSON = querystring.stringify({
		Q: keyword
	})

	//combine into full url
	var fullUrl = baseUrl + '?' + string
	var urlNoJSON = baseUrl + '?' + stringNoJSON

	//make a get request for the JSON

	if(keyword.split(" ").length == 1) {
		request(fullUrl, function(error, response, body) {
			if(!error && response.statusCode == 200) {
				//parse the JSON
				var data = JSON.parse(body);
				//convert the received JSON to a HTML object
				$ = convertToHTML(data)
				//Parse the converted HTML
				synonymList = parseHTML($, keyword)
				
				//combine the list of synonyms to a string
				synonymsToString(synonymList, recepientID)
				var message2 = 'Täielikud tulemused: ' + urlNoJSON

				messageQueue.push(message2)
			}
		})
	}
	else {
		messageQueue.push("Palun sisesta üks sõna korraga.")
	}
	sendBatchMessages(recepientID)
}

function convertToHTML(data) {
	//clean up the JSON
	data = JSON.stringify(data.resultarr).substring(2,(JSON.stringify(data.resultarr).length-2))
	data = data.replace(/\\"/g,'"') //remove escaping
	$ = cheerio.load(data) //load into Cheerio
	return $
}

function parseHTML($, keyword) {
	var wordId = ''
	var synonyms = []
	var synonymFor = []
	//loop over all the matches
	$('.m').each(function(index) {
		//Check if the match matches the keyword
		//(sometimes the keyword is a synonym for some other word)
		if($(this).text() == keyword) { 
			wordId = $(this).attr('id'); //remember the ID of the match
		}
		else {
			synonymFor.push($(this).text())
		}
	})
	//remove word specific part of ID
	wordId = wordId.split('_')[0]
	//find all the synonyms of the word
	//first part of the ID is the same
	$('.syn').each(function(index) {
		if($(this).attr('id').split('_')[0] == wordId) {
			synonyms.push($(this).text())
		}
	})
	return [synonyms,synonymFor]
}

function synonymsToString(synonymList, recepientID) {
	var output = ''
	var outList = []
	synonyms = synonymList[0]
	synonymFor = synonymList[1]
	if(synonyms.length > 0) {
		output += 'Leidsin ' + synonyms.length + ' sünonüümi '	
		if(synonyms.length > 10) {
			output += '(näitan ainult 10 esimest)'
			synonyms = synonyms.slice(0,10)
		}
		output += ": "
		synonyms.forEach(function(element, idx, array) {
			output += element
			if(idx != array.length - 1) {
				output += ", "
			}
		})
		messageQueue.push(output)

		if(synonymFor.length > 0) {
			output = 'Lisaks on sõna veel ' + synonymFor.length + " sõna sünonüüm."
			messageQueue.push(output)
			output = 'Need on: '
			synonymFor.forEach(function(element, idx, array) {
				output += element
				if(idx != array.length - 1) {
					output += ", "
				}
			})
			messageQueue.push(output)
			
		}
		
	}
	else if (synonyms.length == 0 && synonymFor.length > 0) {
		output = 'Kahjuks ei ole sellel sõnal sünonüüme.'
		messageQueue.push(output)
		output = 'Õnneks leidub ' + synonymFor.length + ' sõna, mille sünonüüm see sõna on.'
		messageQueue.push(output)
		output = 'Need on: '
		synonymFor.forEach(function(element, idx, array) {
			output += element
			if(idx != array.length - 1) {
				output += ", "
			}
		})
		messageQueue.push(output)
	}
	else {
		output = "Sünonüüme ei leitud, proovi mõnda teist sõna."
		messageQueue.push(output)
	}
	sendBatchMessages(recepientID)
}

function sendTextMessage(receipientID,messageText) {
	
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



function sendBatchMessages(recepientID) {
	console.log(waiting)
	console.log(messageQueue.length)
	if(messageQueue.length != 0 && waiting != true) {
		sendTextMessage(recepientID,messageQueue.shift())
		waiting = true
	}
	else {
		console.log("Waiting to send a message...");
	}
}



function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
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
			//console.log(response)
			//console.log(error)
		}
	})
}



