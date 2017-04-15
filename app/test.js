const BotTester = require('messenger-bot-tester')

describe('bot test', function() {
	const testPort = 3001
	const webHookUrl = 'http://localhost:3000/webhook'
	const Tester = new BotTester.default(testPort, webHookUrl)
})

before(function() {
	return tester.startListening
})

it('hi', function() {
	const theScript = new BotTester.Script('132', '20')
	theScript.sendTextMessage('hi')

	return tester.runScript(theScript) 
})