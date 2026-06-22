class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) {
      return { error: 'Required field missing' };
    }
    if (puzzleString.length !== 81) {
      return { error: 'Expected puzzle to be 81 characters long' };
    }
    if (/[^1-9.]/.test(puzzleString)) {
      return { error: 'Invalid characters in puzzle' };
    }
    return true;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const r = row;
    for (let i = 0; i < 9; i++) {
      if (puzzleString[r * 9 + i] == value) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const c = column;
    for (let i = 0; i < 9; i++) {
      if (puzzleString[i * 9 + c] == value) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(column / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (puzzleString[(startRow + r) * 9 + (startCol + c)] == value) {
          return false;
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    if (this.validate(puzzleString) !== true) {
      return false;
    }
    
    let board = puzzleString.split('');
    
    const isValid = (board, r, c, val) => {
      for (let i = 0; i < 9; i++) {
        if (board[r * 9 + i] == val) return false;
        if (board[i * 9 + c] == val) return false;
      }
      const startRow = Math.floor(r / 3) * 3;
      const startCol = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[(startRow + i) * 9 + (startCol + j)] == val) return false;
        }
      }
      return true;
    };

    const solveRec = (board) => {
      let emptyIndex = board.indexOf('.');
      if (emptyIndex === -1) {
        return true; // Solved
      }
      
      let r = Math.floor(emptyIndex / 9);
      let c = emptyIndex % 9;
      
      for (let val = 1; val <= 9; val++) {
        if (isValid(board, r, c, val.toString())) {
          board[emptyIndex] = val.toString();
          if (solveRec(board)) {
            return true;
          }
          board[emptyIndex] = '.'; // Backtrack
        }
      }
      return false; // No valid number found
    };

    if (solveRec(board)) {
      return board.join('');
    } else {
      return false; // Unsolvable
    }
  }
}

module.exports = SudokuSolver;
