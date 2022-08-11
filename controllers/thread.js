const Thread = require("../models/thread");
const bcrypt = require('bcrypt');
// const { thread_id } = req.query;

const getThreads = async (req, res) => {
    const { board } = req.params;
    try {
        const threads = await Thread.aggregate([
            {
                '$match': {
                    'board': `${board}`
                }
            }, {
                '$project': {
                    'text': 1,
                    'created_on': 1,
                    'bumped_on': 1
                }
            }, {
                '$sort': {
                    'bumped_on': -1
                }
            }, {
                '$limit': 10
            }, {
                '$lookup': {
                    'from': 'replies',
                    'localField': '_id',
                    'foreignField': 'parentThread',
                    'as': 'replies',
                    'pipeline': [
                        {
                            '$sort': {
                                'created_on': -1
                            }
                        },
                        {
                            '$project': {
                                'text': 1,
                                '_id': 1,
                                'created_on': 1,
                                'parentThread': 1
                            }
                        }
                        , {
                            '$limit': 3
                        }
                    ]
                }
            }
        ]);


        return res.json(threads);
    } catch (error) {
        return res.send('something went wrong on the server')
    }
}

const addThread = async (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    if (!board || !text || !delete_password) {
        return res.send('missing entry data')
    }

    try {
        const hashedPassword = await bcrypt.hash(delete_password, 10);
        await Thread.create({ board, text, delete_password: hashedPassword });
        return res.sendStatus(200);

    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

const reportThread = async (req, res) => {
    const { board } = req.params;
    const { report_id } = req.body;
    
    if (!report_id) {
        return res.send('missing entry data');
    }


    try {
        const newt = await Thread.findOneAndUpdate({ id: report_id, board }, { reported: true }, { new: true });

        return res.send('reported');

    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

const deleteThread = async (req, res) => {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;

    if (!thread_id || !delete_password) {
        return res.send('missing entry data');
    }

    try {
        const thread = await Thread.findOne({ board, _id: thread_id });

        if (!thread) {
            return res.send('no such thread');
        }

        const passwordMatch = await bcrypt.compare(delete_password, thread.delete_password);

        if (passwordMatch) {
            await thread.remove();
            return res.send('success');
        }

        return res.send('incorrect password');

    } catch (err) {
        return res.send('something went wrong on the server');
    }
}

module.exports = {
    addThread,
    reportThread,
    deleteThread,
    getThreads
};