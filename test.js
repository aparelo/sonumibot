const BotTester = require('messenger-bot-tester')

describe('First Test of a bot', function() {
	const testPort = 3001
	const webHookUrl = 'http://localhost:3000/webhook'
	const tester = new BotTester.default(testPort, webHookUrl)

	before(function() {
		return tester.startListening()
	})

	it('Reverses string', function() {
		const theScript = new BotTester.Script('132', '40')
		var messageText = "tere"
		theScript.sendTextMessage(messageText)
		theScript.expectTextResponses("terekest, tervist, servus, tervitus, [tere] jumalime, jõudu tööle, tere jõudu, jätku [leiba, leivale], jõudu tarvis, jätku tarvis, tarvis,")

		return tester.runScript(theScript)
	})
})