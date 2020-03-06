const { model, Schema } = require('mongoose')

const schema = new Schema({
    text: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: false,
        enum: ['none', 'ace', 'winner', 'double_fault'],
        default: 'none'
    },
    match_id: {
        type: Number,
        required: true
    }
})

module.exports = model('Log', schema)