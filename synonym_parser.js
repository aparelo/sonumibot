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




module.exports = {
	getSynonyms: function (recepientID, keyword) {
		const JSONPassword = 'sapa170417'
		const baseUrl = 'http://www.eki.ee/dict/sys/index.cgi/'
		
		//create querystring
		var string = querystring.stringify({
			Z: 'json',
			X: JSONPassword,
			Q: keyword
		})

		//combine into full url
		var fullUrl = baseUrl + '?' + string

		//make a get request for the JSON


		var synonyms = []
		request(fullUrl, function(error, response, body) {
			if(!error && response.statusCode == 200) {
				//parse the JSON
				var data = JSON.parse(body);
				$ = convertToHTML(data)
				synonyms = parseHTML($, keyword)
				var messageString = synonymsToString(synonyms)
				console.log(messageString);
				sendTextMessage(recepientID, messageString)
			}
		})
	}
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
	$('.m').each(function(index) {
		if($(this).text() == keyword) {
			wordId = $(this).attr('id');
		}
	})
	wordId = wordId.split('_')[0]
	$('.syn').each(function(index) {
		if($(this).attr('id').split('_')[0] == wordId) {
			synonyms.push($(this).text())
		}
	})
	return synonyms
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
			console.log(response)
			console.log(error)
		}
	})
}

function synonymsToString(synonyms) {
	var output = ''
	synonyms.forEach(function(element) {
		output += element
		output += ", "
	})
	output.substring(0,output.length-2)
	return output
}


