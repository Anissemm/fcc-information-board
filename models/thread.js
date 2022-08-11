const { Schema, model } = require('mongoose');
const Reply = require('./reply')

const threadSchema = new Schema({
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
}, { timestamps: { createdAt: "created_on", updatedAt: "bumped_on" } });

// threadSchema.pre('remove', async function () {
//     await Reply.deleteMany({ parentThread: this.id, board: this.board })
// });

const Thread = model('Thread', threadSchema);

module.exports = Thread