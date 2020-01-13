const express = require('express')
const cors = require('cors')
const routes = require('./routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/', routes)

app.listen(80, () => console.log('Servidor executando'))