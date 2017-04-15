const express = require('express')
const app = express()
const port = 3000

app.get('/', (request, response) => {
	response.send('Hello from the other side')
})

app.listen(process.env.PORT || port, (err) => {
	if(err) {
		return console.log('This is not good', err)
	}

	console.log(`Server running, port: ${port}`)
})