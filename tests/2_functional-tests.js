const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);


suite('Functional Tests', function () {
    let thread_id = null;
    let reply_id = null;
    const text = () => `test thread ${new Date()}`;
    const delete_password = 'test_password';

    test('Creating a new thread', (done) => {
        const txt = text();

        const testThread = {
            text: txt,
            delete_password
        };
        chai.request(server)
            .post('/api/threads/test_board')
            .send(testThread)
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }

                if (res.ok) {
                    chai.request(server)
                        .get('/api/threads/test_board')
                        .end((err, res) => {
                            assert.equal(res.status, 200);
                            assert.isArray(res.body);
                            assert.isObject(res.body[0]);
                            assert.property(res.body[0], 'text');
                            assert.property(res.body[0], 'bumped_on');
                            assert.property(res.body[0], 'created_on');
                            assert.property(res.body[0], '_id');
                            assert.equal(res.body[0].text, txt);
                            thread_id = res.body[0]._id
                            done();
                        })
                }
            });
    });

    test('Viewing the 10 most recent threads with 3 replies each', (done) => {
        chai.request(server)
            .get('/api/threads/test_board')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }

                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isObject(res.body[0]);
                assert.property(res.body[0], 'text');
                assert.property(res.body[0], 'bumped_on');
                assert.property(res.body[0], 'created_on');
                assert.property(res.body[0], '_id');
                done();
            });
    });


    test('Deleting a thread with the incorrect password', (done) => {
        chai.request(server)
            .delete('/api/threads/test_board')
            .send({
                thread_id,
                delete_password: 'incorrect-password'
            })
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }

                assert.equal(res.status, 200);
                assert.isString(res.text);
                assert.equal(res.text, 'incorrect password');
                done();
            });
    });

    test('Deleting a thread with the correct password', (done) => {
        chai.request(server)
            .delete('/api/threads/test_board')
            .send({
                thread_id,
                delete_password
            })
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }

                assert.equal(res.status, 200);
                assert.isString(res.text);
                assert.equal(res.text, 'success');
                done();
            });
    });

    test('Reporting a thread', (done) => {
        const txt = text();

        const testThread = {
            text: txt,
            delete_password
        };
        chai.request(server)
            .post('/api/threads/test_board')
            .send(testThread)
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }

                if (res.ok) {
                    chai.request(server)
                        .get('/api/threads/test_board')
                        .end((err, res) => {
                            if (res.ok) {
                                thread_id = res.body[0]._id
                                chai.request(server)
                                    .put('/api/threads/test_board')
                                    .send({ report_id: thread_id })
                                    .end((err, res) => {
                                        if (err) console.log(err);

                                        assert.equal(res.status, 200);
                                        assert.equal(res.text, 'reported');
                                        done();
                                    });
                            }
                        });
                }
            });
    });

    test('Creating a new reply', (done) => {
        const txt = text()
        chai.request(server)
            .post('/api/replies/test_board')
            .send({
                text: txt,
                thread_id,
                delete_password
            })
            .end((err, res) => {
                if (err) console.log(err);

                if (res.ok) {
                    chai.request(server)
                        .get('/api/replies/test_board')
                        .query({
                            thread_id
                        })
                        .end((err, res) => {
                            if (err) console.log(err);
                            assert.equal(res.status, 200);
                            assert.isArray(res.body.replies);
                            assert.equal(res.body.replies.length, 1);
                            assert.equal(res.body.replies[0].parentThread, thread_id);
                            reply_id = res.body.replies[0]._id;
                            done();
                        });
                }
            });
    })

    test('Viewing a single thread with all replies', (done) => {

        chai.request(server)
            .get('/api/replies/test_board')
            .query({
                thread_id
            })
            .end((err, res) => {
                if (err) console.log(err);
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.hasAllKeys(res.body, ['text', '_id', 'created_on', 'board', 'bumped_on', 'replies', '__v']);
                assert.isArray(res.body.replies);
                assert.equal(res.body.replies.length, 1);
                assert.equal();
                assert.equal(res.body.replies[0].parentThread, thread_id);
                assert.equal(res.body.replies[0]._id, reply_id);
                done();
            });

    });

    test('Deleting a reply with the incorrect password', (done) => {

        chai.request(server)
            .delete('/api/replies/test_board')
            .send({
                thread_id,
                reply_id,
                delete_password: 'incorrect-password'
            })
            .end((err, res) => {
                if (err) console.log(err);
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password')
                done();
            });
    });

    test('Deleting a reply with the correct password', (done) => {

        chai.request(server)
            .delete('/api/replies/test_board')
            .send({
                thread_id,
                reply_id,
                delete_password
            })
            .end((err, res) => {
                if (err) console.log(err);
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success')
                done();
            });
    });

    test('Reporting a reply', (done) => {
        const txt = text();

        chai.request(server)
            .post('/api/replies/test_board')
            .send({
                thread_id,
                text: txt,
                delete_password
            })
            .end((err, res) => {
                if (err) console.log(err);
                if (res.ok) {
                    chai.request(server)
                        .get('/api/replies/test_board')
                        .query({ thread_id })
                        .end((err, res) => {
                            if (err) console.log(err);
                            if (res.ok) {
                                reply_id = res.body.replies[0]._id;
                                chai.request(server)
                                    .put('/api/replies/test_board')
                                    .send({ thread_id, reply_id })
                                    .end((err, res) => {
                                        if (err) console.log(err);

                                        assert.equal(res.status, 200);
                                        assert.equal(res.text, 'reported');
                                        done();
                                    })
                            }

                        });
                }
            });
    });
});
