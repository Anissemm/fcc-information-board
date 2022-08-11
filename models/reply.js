const { Schema, model } = require('mongoose');

const replySchema = new Schema({
    board: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    delete_password: {
        type: String,
        required: true
    },
    reported: {
        type: Boolean,
        default: false
    },
    parentThread: {
        type: Schema.Types.ObjectId,
        ref: 'Thread'
    }
}, {timestamps: {createdAt: "created_on"}});


const Reply = model('Reply', replySchema);

module.exports = Reply