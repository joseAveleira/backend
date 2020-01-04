const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('hello!'))

app.get('/test', (req, res) => res.send('test route'))

app.listen(80)