const Thread = require("../models/thread");
const bcrypt = require('bcrypt');
const Reply = require("../models/reply");

const getReplies = async (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.query;

    try {
        const thread = await Thread.findOne({ board, _id: thread_id }).select('-reported -delete_password');

        const replies = await Reply.find({ board, parentThread: thread_id }).select('-reported -delete_password').sort({ 'created_on': -1 });

        return res.json({ ...thread.toObject(), replies })

    } catch (error) {
        return
    }

};

const addReply = async (req, res) => {
    const { board } = req.params;
    const { text, thread_id, delete_password } = req.body;

    if (!board || !text || !delete_password || !thread_id) {
        return res.send('missing entry data')
    }

    try {
        const thread = await Thread.findOne({ _id: thread_id, board });

        if (!thread) {
            return res.send('no such thread');
        }

        const hashedPassword = await bcrypt.hash(delete_password, 10);
        const reply = await Reply.create({ board, text, parentThread: thread_id, delete_password: hashedPassword });

        thread.bumped_on = reply.created_on;
        await thread.save({ timestamps: false });

        return res.sendStatus(200);

    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

const reportReply = async (req, res) => {
    const { board } = req.params
    const { thread_id, reply_id } = req.body;

    if (!thread_id || !reply_id) {
        return res.send('missing entry data');
    }

    try {
        await Reply.findOneAndUpdate({ _id: reply_id, parentThread: thread_id, board }, { reported: true }, { new: true });
        return res.send('reported');
    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

const deleteReply = async (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;

    if (!thread_id || !board || !reply_id || !delete_password) {
        return res.send('missing entry data');
    }

    try {
        const reply = await Reply.findOne({ _id: reply_id, parentThread: thread_id, board });

        if (!reply) {
            return res.send('no such thread');
        }

        const passwordMatch = await bcrypt.compare(delete_password, reply.delete_password);
        if (passwordMatch) {
            await reply.updateOne({ text: '[deleted]' });
            return res.send('success');
        }

        return res.send('incorrect password');

    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

module.exports = {
    addReply,
    reportReply,
    deleteReply,
    getReplies
};