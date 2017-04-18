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
	sendMessage: function (recepientID, keyword) {
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
				//convert the received JSON to a HTML object
				$ = convertToHTML(data)
				//Parse the converted HTML
				synonyms = parseHTML($, keyword)
				//combine the list of synonyms to a string
				var messageString = synonymsToString(synonyms)
				//send it back

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
	//loop over all the matches
	$('.m').each(function(index) {
		//Check if the match matches the keyword
		//(sometimes the keyword is a synonym for some other word)
		if($(this).text() == keyword) { 
			wordId = $(this).attr('id'); //remember the ID of the match
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
	return synonyms
}

function synonymsToString(synonyms) {
	var output = ''
	if(synonyms.length > 0) {
		if(synonyms.length <= 10) {
			output += 'Sünonüümid on: '	
		}
		else {
			output += "Sünonüümid on (näitan ainult esimesed 10 vastust): "
			synonyms = synonyms.slice(0,10)
		}
		synonyms.forEach(function(element, idx, array) {
			output += element
			if(idx != array.length - 1) {
				output += ", "
			}
		})
	}
	else {
		output = "Sünonüüme ei leitud, proovi mõnda teist sõna."
	}
	return output
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



