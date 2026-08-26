'use strict';

const crypto = require('crypto');
const db = require('../db');

function makeId() {
  return crypto.randomBytes(12).toString('hex');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function publicReply(reply) {
  return {
    _id: reply.id,
    text: reply.text,
    created_on: reply.created_on
  };
}

function publicThread(thread, replies, replycount) {
  const result = {
    _id: thread.id,
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies: replies.map(publicReply)
  };

  if (typeof replycount === 'number') {
    result.replycount = replycount;
  }

  return result;
}

function handler(fn) {
  return function (req, res) {
    try {
      fn(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).type('text').send('server error');
    }
  };
}

module.exports = function (app) {
  app.route('/api/threads/:board')
    .post(handler(function (req, res) {
      const board = req.params.board;
      const { text, delete_password } = req.body;

      if (!text || !delete_password) {
        return res.status(400).type('text').send('text and delete_password are required');
      }

      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO threads
          (id, board, text, created_on, bumped_on, delete_password, reported)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(makeId(), board, text, now, now, hashPassword(delete_password));

      res.redirect('/b/' + encodeURIComponent(board) + '/');
    }))
    .get(handler(function (req, res) {
      const threads = db.prepare(`
        SELECT id, text, created_on, bumped_on
        FROM threads
        WHERE board = ?
        ORDER BY bumped_on DESC, rowid DESC
        LIMIT 10
      `).all(req.params.board);

      const countReplies = db.prepare(`
        SELECT COUNT(*) AS count
        FROM replies
        WHERE thread_id = ?
      `);

      const recentReplies = db.prepare(`
        SELECT id, text, created_on
        FROM replies
        WHERE thread_id = ?
        ORDER BY created_on DESC, rowid DESC
        LIMIT 3
      `);

      const output = threads.map(function (thread) {
        const replycount = countReplies.get(thread.id).count;
        const replies = recentReplies.all(thread.id).reverse();
        return publicThread(thread, replies, replycount);
      });

      res.json(output);
    }))
    .delete(handler(function (req, res) {
      const { thread_id, delete_password } = req.body;

      const thread = db.prepare(`
        SELECT delete_password
        FROM threads
        WHERE id = ? AND board = ?
      `).get(thread_id, req.params.board);

      if (!thread || thread.delete_password !== hashPassword(delete_password)) {
        return res.type('text').send('incorrect password');
      }

      db.prepare('DELETE FROM threads WHERE id = ? AND board = ?')
        .run(thread_id, req.params.board);

      res.type('text').send('success');
    }))
    .put(handler(function (req, res) {
      db.prepare(`
        UPDATE threads
        SET reported = 1
        WHERE id = ? AND board = ?
      `).run(req.body.thread_id, req.params.board);

      res.type('text').send('reported');
    }));

  app.route('/api/replies/:board')
    .post(handler(function (req, res) {
      const { thread_id, text, delete_password } = req.body;

      if (!text || !delete_password) {
        return res.status(400).type('text').send('text and delete_password are required');
      }

      const thread = db.prepare(`
        SELECT id
        FROM threads
        WHERE id = ? AND board = ?
      `).get(thread_id, req.params.board);

      if (!thread) {
        return res.status(404).type('text').send('thread not found');
      }

      const now = new Date().toISOString();
      const replyId = makeId();

      const addReply = db.transaction(function () {
        db.prepare(`
          INSERT INTO replies
            (id, thread_id, text, created_on, delete_password, reported)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(replyId, thread_id, text, now, hashPassword(delete_password));

        db.prepare(`
          UPDATE threads
          SET bumped_on = ?
          WHERE id = ? AND board = ?
        `).run(now, thread_id, req.params.board);
      });

      addReply();

      res.redirect('/b/' + encodeURIComponent(req.params.board) + '/' + thread_id);
    }))
    .get(handler(function (req, res) {
      const thread = db.prepare(`
        SELECT id, text, created_on, bumped_on
        FROM threads
        WHERE id = ? AND board = ?
      `).get(req.query.thread_id, req.params.board);

      if (!thread) {
        return res.status(404).type('text').send('thread not found');
      }

      const replies = db.prepare(`
        SELECT id, text, created_on
        FROM replies
        WHERE thread_id = ?
        ORDER BY created_on ASC, rowid ASC
      `).all(thread.id);

      res.json(publicThread(thread, replies));
    }))
    .delete(handler(function (req, res) {
      const { thread_id, reply_id, delete_password } = req.body;

      const reply = db.prepare(`
        SELECT r.delete_password
        FROM replies r
        JOIN threads t ON t.id = r.thread_id
        WHERE r.id = ? AND r.thread_id = ? AND t.board = ?
      `).get(reply_id, thread_id, req.params.board);

      if (!reply || reply.delete_password !== hashPassword(delete_password)) {
        return res.type('text').send('incorrect password');
      }

      db.prepare(`
        UPDATE replies
        SET text = '[deleted]'
        WHERE id = ? AND thread_id = ?
      `).run(reply_id, thread_id);

      res.type('text').send('success');
    }))
    .put(handler(function (req, res) {
      const { thread_id, reply_id } = req.body;

      db.prepare(`
        UPDATE replies
        SET reported = 1
        WHERE id = ?
          AND thread_id = ?
          AND EXISTS (
            SELECT 1
            FROM threads
            WHERE threads.id = replies.thread_id
              AND threads.board = ?
          )
      `).run(reply_id, thread_id, req.params.board);

      res.type('text').send('reported');
    }));
};
