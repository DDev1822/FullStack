'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const board = 'fcc-test-' + Date.now();
  const mainText = 'Main functional test thread ' + Date.now();
  const deletePassword = 'thread-secret';
  const replyPassword = 'reply-secret';
  let threadId;
  let disposableThreadId;
  let replyId;

  test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
    chai.request(server)
      .post('/api/threads/' + board)
      .redirects(0)
      .send({ text: mainText, delete_password: deletePassword })
      .end(function (err, res) {
        assert.oneOf(res.status, [200, 302]);

        chai.request(server)
          .post('/api/threads/' + board)
          .redirects(0)
          .send({ text: 'Disposable thread', delete_password: deletePassword })
          .end(function () {
            chai.request(server)
              .get('/api/threads/' + board)
              .end(function (getErr, getRes) {
                if (getErr) return done(getErr);
                const main = getRes.body.find(function (item) { return item.text === mainText; });
                const disposable = getRes.body.find(function (item) { return item.text === 'Disposable thread'; });
                assert.exists(main);
                assert.exists(disposable);
                threadId = main._id;
                disposableThreadId = disposable._id;
                done();
              });
          });
      });
  });

  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
    chai.request(server)
      .get('/api/threads/' + board)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        res.body.forEach(function (thread) {
          assert.isAtMost(thread.replies.length, 3);
          assert.notProperty(thread, 'delete_password');
          assert.notProperty(thread, 'reported');
          assert.property(thread, 'replycount');
        });
        done();
      });
  });

  test('Deleting a thread with the incorrect password', function (done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: disposableThreadId, delete_password: 'wrong-password' })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a thread with the correct password', function (done) {
    chai.request(server)
      .delete('/api/threads/' + board)
      .send({ thread_id: disposableThreadId, delete_password: deletePassword })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
    chai.request(server)
      .put('/api/threads/' + board)
      .send({ thread_id: threadId })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
    chai.request(server)
      .post('/api/replies/' + board)
      .redirects(0)
      .send({ thread_id: threadId, text: 'Functional test reply', delete_password: replyPassword })
      .end(function (err, res) {
        assert.oneOf(res.status, [200, 302]);

        chai.request(server)
          .get('/api/replies/' + board)
          .query({ thread_id: threadId })
          .end(function (getErr, getRes) {
            if (getErr) return done(getErr);
            const reply = getRes.body.replies.find(function (item) {
              return item.text === 'Functional test reply';
            });
            assert.exists(reply);
            replyId = reply._id;
            done();
          });
      });
  });

  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
    chai.request(server)
      .get('/api/replies/' + board)
      .query({ thread_id: threadId })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.status, 200);
        assert.equal(res.body._id, threadId);
        assert.isArray(res.body.replies);
        assert.notProperty(res.body, 'delete_password');
        assert.notProperty(res.body, 'reported');
        res.body.replies.forEach(function (reply) {
          assert.notProperty(reply, 'delete_password');
          assert.notProperty(reply, 'reported');
        });
        done();
      });
  });

  test('Deleting a reply with the incorrect password', function (done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'wrong-password' })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a reply with the correct password', function (done) {
    chai.request(server)
      .delete('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: replyPassword })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
    chai.request(server)
      .put('/api/replies/' + board)
      .send({ thread_id: threadId, reply_id: replyId })
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'reported');
        done();
      });
  });
});
