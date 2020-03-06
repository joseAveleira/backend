const mongoose = require('mongoose')

mongoose.connect(`mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/scoreboard`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})