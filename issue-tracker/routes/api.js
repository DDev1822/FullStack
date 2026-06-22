'use strict';

const crypto = require('crypto');

module.exports = function (app) {

  // Simple in-memory data store for issues
  const issuesDB = {};

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let issues = issuesDB[project] || [];
      
      let filter = req.query;
      if (Object.keys(filter).length > 0) {
        issues = issues.filter(issue => {
          for (let key in filter) {
            // handle boolean conversion for 'open' since query params are strings
            let filterVal = filter[key];
            if (key === 'open') {
              filterVal = filterVal === 'true';
            }
            if (issue[key] !== filterVal) {
              return false;
            }
          }
          return true;
        });
      }
      
      res.json(issues);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      const newIssue = {
        _id: crypto.randomBytes(12).toString('hex'),
        issue_title,
        issue_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by,
        assigned_to: assigned_to || '',
        open: true,
        status_text: status_text || ''
      };
      
      if (!issuesDB[project]) {
        issuesDB[project] = [];
      }
      issuesDB[project].push(newIssue);
      
      res.json(newIssue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && open === undefined) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      
      let issues = issuesDB[project] || [];
      let issueIndex = issues.findIndex(issue => issue._id === _id);
      
      if (issueIndex === -1) {
        return res.json({ error: 'could not update', '_id': _id });
      }
      
      let issue = issues[issueIndex];
      
      if (issue_title) issue.issue_title = issue_title;
      if (issue_text) issue.issue_text = issue_text;
      if (created_by) issue.created_by = created_by;
      if (assigned_to) issue.assigned_to = assigned_to;
      if (status_text) issue.status_text = status_text;
      if (open !== undefined) issue.open = (open === 'false' || open === false) ? false : true;
      
      issue.updated_on = new Date().toISOString();
      
      res.json({ result: 'successfully updated', '_id': _id });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      let issues = issuesDB[project] || [];
      let issueIndex = issues.findIndex(issue => issue._id === _id);
      
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
      
      issues.splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', '_id': _id });
    });
    
};
