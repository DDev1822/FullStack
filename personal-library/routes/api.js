/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const crypto = require('crypto');

module.exports = function (app) {

  // In-memory array for books
  let booksDB = [];

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const response = booksDB.map(book => ({
        _id: book._id,
        title: book.title,
        commentcount: book.comments.length
      }));
      res.json(response);
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      
      const newBook = {
        _id: crypto.randomBytes(12).toString('hex'),
        title: title,
        comments: []
      };
      
      booksDB.push(newBook);
      res.json({ _id: newBook._id, title: newBook.title });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      booksDB = [];
      res.send('complete delete successful');
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = booksDB.find(b => b._id === bookid);
      if (!book) {
        return res.send('no book exists');
      }
      res.json(book);
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      
      if (!comment) {
        return res.send('missing required field comment');
      }
      
      const book = booksDB.find(b => b._id === bookid);
      if (!book) {
        return res.send('no book exists');
      }
      
      book.comments.push(comment);
      res.json(book);
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      const index = booksDB.findIndex(b => b._id === bookid);
      if (index === -1) {
        return res.send('no book exists');
      }
      
      booksDB.splice(index, 1);
      res.send('delete successful');
    });
  
};
