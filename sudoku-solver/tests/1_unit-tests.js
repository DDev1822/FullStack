const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const solution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Unit Tests', () => {

  test('Logic handles a valid puzzle string of 81 characters', function() {
    assert.equal(solver.validate(validPuzzle), true);
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', function() {
    const invalidCharPuzzle = 'A' + validPuzzle.slice(1);
    assert.property(solver.validate(invalidCharPuzzle), 'error');
    assert.equal(solver.validate(invalidCharPuzzle).error, 'Invalid characters in puzzle');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', function() {
    const shortPuzzle = validPuzzle.slice(1);
    assert.property(solver.validate(shortPuzzle), 'error');
    assert.equal(solver.validate(shortPuzzle).error, 'Expected puzzle to be 81 characters long');
  });

  test('Logic handles a valid row placement', function() {
    assert.isTrue(solver.checkRowPlacement(validPuzzle, 0, 1, '3'));
  });

  test('Logic handles an invalid row placement', function() {
    assert.isFalse(solver.checkRowPlacement(validPuzzle, 0, 1, '1'));
  });

  test('Logic handles a valid column placement', function() {
    assert.isTrue(solver.checkColPlacement(validPuzzle, 0, 1, '3'));
  });

  test('Logic handles an invalid column placement', function() {
    assert.isFalse(solver.checkColPlacement(validPuzzle, 0, 1, '2'));
  });

  test('Logic handles a valid region (3x3 grid) placement', function() {
    assert.isTrue(solver.checkRegionPlacement(validPuzzle, 0, 1, '3'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', function() {
    assert.isFalse(solver.checkRegionPlacement(validPuzzle, 0, 1, '5'));
  });

  test('Valid puzzle strings pass the solver', function() {
    const result = solver.solve(validPuzzle);
    assert.isString(result);
    assert.equal(result.length, 81);
  });

  test('Invalid puzzle strings fail the solver', function() {
    const invalidPuzzle = '995..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    assert.isFalse(solver.solve(invalidPuzzle));
  });

  test('Solver returns the expected solution for an incomplete puzzle', function() {
    assert.equal(solver.solve(validPuzzle), solution);
  });

});
