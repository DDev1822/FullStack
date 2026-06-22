const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let issueId1;
  let issueId2;

  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Creator',
        assigned_to: 'Assignee',
        status_text: 'Status'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        issueId1 = res.body._id;
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Creator');
        assert.equal(res.body.assigned_to, 'Assignee');
        assert.equal(res.body.status_text, 'Status');
        assert.isTrue(res.body.open);
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Title2',
        issue_text: 'Text2',
        created_by: 'Creator2'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        issueId2 = res.body._id;
        assert.equal(res.body.issue_title, 'Title2');
        assert.equal(res.body.issue_text, 'Text2');
        assert.equal(res.body.created_by, 'Creator2');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/testproject')
      .send({
        issue_title: 'Title3'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject?created_by=Creator')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        assert.equal(res.body[0].created_by, 'Creator');
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/testproject?created_by=Creator&open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        assert.equal(res.body[0].created_by, 'Creator');
        assert.isTrue(res.body[0].open);
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({
        _id: issueId1,
        issue_text: 'Updated Text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({
        _id: issueId2,
        issue_title: 'Updated Title',
        issue_text: 'Updated Text2'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId2);
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({
        issue_title: 'Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({
        _id: issueId1
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/testproject')
      .send({
        _id: 'invalidid',
        issue_text: 'Text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({
        _id: issueId1
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({
        _id: 'invalidid'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/testproject')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});

