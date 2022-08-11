'use strict';

const { addThread, reportThread, deleteThread, getThreads } = require("../controllers/thread");
const { addReply, reportReply, deleteReply, getReplies } = require("../controllers/reply");

module.exports = function (app) {
  
  app.route('/api/threads/:board').post(addThread).put(reportThread).delete(deleteThread).get(getThreads);
    
  app.route('/api/replies/:board').post(addReply).put(reportReply).delete(deleteReply).get(getReplies);

};
