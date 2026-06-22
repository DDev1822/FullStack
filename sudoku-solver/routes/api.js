'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }
      const validateResult = solver.validate(puzzle);
      if (validateResult !== true) {
        return res.json(validateResult);
      }
      
      const rowMatch = coordinate.match(/^[A-I]/i);
      const colMatch = coordinate.match(/[1-9]$/);
      
      if (coordinate.length !== 2 || !rowMatch || !colMatch) {
        return res.json({ error: 'Invalid coordinate' });
      }
      
      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      }
      
      const row = coordinate.toUpperCase().charCodeAt(0) - 65;
      const col = parseInt(coordinate[1]) - 1;
      
      if (puzzle[row * 9 + col] == value) {
        return res.json({ valid: true });
      }
      
      const validRow = solver.checkRowPlacement(puzzle, row, col, value);
      const validCol = solver.checkColPlacement(puzzle, row, col, value);
      const validReg = solver.checkRegionPlacement(puzzle, row, col, value);
      
      if (validRow && validCol && validReg) {
        return res.json({ valid: true });
      }
      
      let conflict = [];
      if (!validRow) conflict.push('row');
      if (!validCol) conflict.push('column');
      if (!validReg) conflict.push('region');
      
      return res.json({ valid: false, conflict });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }
      const validateResult = solver.validate(puzzle);
      if (validateResult !== true) {
        return res.json(validateResult);
      }
      const solvedString = solver.solve(puzzle);
      if (!solvedString) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }
      return res.json({ solution: solvedString });
    });
};
