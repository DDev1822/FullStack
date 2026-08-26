'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const Thread = require('../models/thread');

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function publicReply(reply) {
  return {
    _id: reply._id,
    text: reply.text,
    created_on: reply.created_on
  };
}

function publicThread(thread, recentOnly) {
  const replies = Array.isArray(thread.replies) ? thread.replies : [];
  const selectedReplies = recentOnly ? replies.slice(-3) : replies;
  const result = {
    _id: thread._id,
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies: selectedReplies.map(publicReply)
  };

  if (recentOnly) {
    result.replycount = replies.length;
  }

  return result;
}

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).type('text').send('server error');
    }
  };
}

module.exports = function (app) {
  app.route('/api/threads/:board')
    .post(asyncHandler(async function (req, res) {
      const board = req.params.board;
      const { text, delete_password } = req.body;

      if (!text || !delete_password) {
        return res.status(400).type('text').send('text and delete_password are required');
      }

      const now = new Date();
      await Thread.create({
        board,
        text,
        created_on: now,
        bumped_on: now,
        delete_password: hashPassword(delete_password),
        reported: false,
        replies: []
      });

      return res.redirect('/b/' + encodeURIComponent(board) + '/');
    }))
    .get(asyncHandler(async function (req, res) {
      const threads = await Thread.find({ board: req.params.board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .lean();

      res.json(threads.map(function (thread) {
        return publicThread(thread, true);
      }));
    }))
    .delete(asyncHandler(async function (req, res) {
      const { thread_id, delete_password } = req.body;

      if (!mongoose.isValidObjectId(thread_id)) {
        return res.type('text').send('incorrect password');
      }

      const thread = await Thread.findOne({
        _id: thread_id,
        board: req.params.board
      });

      if (!thread || thread.delete_password !== hashPassword(delete_password)) {
        return res.type('text').send('incorrect password');
      }

      await thread.deleteOne();
      res.type('text').send('success');
    }))
    .put(asyncHandler(async function (req, res) {
      const { thread_id } = req.body;

      if (mongoose.isValidObjectId(thread_id)) {
        await Thread.updateOne(
          { _id: thread_id, board: req.params.board },
          { $set: { reported: true } }
        );
      }

      res.type('text').send('reported');
    }));

  app.route('/api/replies/:board')
    .post(asyncHandler(async function (req, res) {
      const { thread_id, text, delete_password } = req.body;

      if (!mongoose.isValidObjectId(thread_id)) {
        return res.status(404).type('text').send('thread not found');
      }

      if (!text || !delete_password) {
        return res.status(400).type('text').send('text and delete_password are required');
      }

      const now = new Date();
      const reply = {
        _id: new mongoose.Types.ObjectId(),
        text,
        created_on: now,
        delete_password: hashPassword(delete_password),
        reported: false
      };

      const thread = await Thread.findOneAndUpdate(
        { _id: thread_id, board: req.params.board },
        {
          $push: { replies: reply },
          $set: { bumped_on: now }
        },
        { new: true }
      );

      if (!thread) {
        return res.status(404).type('text').send('thread not found');
      }

      res.redirect('/b/' + encodeURIComponent(req.params.board) + '/' + thread_id);
    }))
    .get(asyncHandler(async function (req, res) {
      const threadId = req.query.thread_id;

      if (!mongoose.isValidObjectId(threadId)) {
        return res.status(404).type('text').send('thread not found');
      }

      const thread = await Thread.findOne({
        _id: threadId,
        board: req.params.board
      }).lean();

      if (!thread) {
        return res.status(404).type('text').send('thread not found');
      }

      res.json(publicThread(thread, false));
    }))
    .delete(asyncHandler(async function (req, res) {
      const { thread_id, reply_id, delete_password } = req.body;

      if (!mongoose.isValidObjectId(thread_id) || !mongoose.isValidObjectId(reply_id)) {
        return res.type('text').send('incorrect password');
      }

      const thread = await Thread.findOne({
        _id: thread_id,
        board: req.params.board
      });

      if (!thread) {
        return res.type('text').send('incorrect password');
      }

      const reply = thread.replies.id(reply_id);
      if (!reply || reply.delete_password !== hashPassword(delete_password)) {
        return res.type('text').send('incorrect password');
      }

      reply.text = '[deleted]';
      await thread.save();
      res.type('text').send('success');
    }))
    .put(asyncHandler(async function (req, res) {
      const { thread_id, reply_id } = req.body;

      if (mongoose.isValidObjectId(thread_id) && mongoose.isValidObjectId(reply_id)) {
        const thread = await Thread.findOne({
          _id: thread_id,
          board: req.params.board
        });

        if (thread) {
          const reply = thread.replies.id(reply_id);
          if (reply) {
            reply.reported = true;
            await thread.save();
          }
        }
      }

      res.type('text').send('reported');
    }));
};
