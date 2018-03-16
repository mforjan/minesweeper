// Array that has each of the surrounding spots for an element located at [0, 0]
const surrounding = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

// Applies a given function to the elements around the element at board[row][col]
const around = (board, row, col, fn) => {
  for (let i = 0; i < surrounding.length; i++) {
    let [r, c] = surrounding[i]
    if (board[row + r] !== undefined && board[row + r][col + c] !== undefined && board[row + r][col + c] !== null) {
      fn(board, row + r, col + c)
    }
  }
}

// Create board
const createBoard = (rows, cols) => {
  let board = new Array(rows).fill(null).map(() => new Array(cols).fill(0))
  return board
}

// Increment the spots around the cell at board[row][col]
const incrementNum = (board, row, col) => {
  if (board[row][col] !== "X") {
    board[row][col]++
  }
}

const gameOver = (result) => {
  if (result === 'loss') {
    alert('You lost.')
  } else {
    alert('You won!')
  }
  $('.button').removeClass('transparent flagged')
}

// Place mines and increment the number of the cells around each mine
const placeMines = (board, rows, cols, mines) => {
  // Array of every spot on the board
  let spots = [];
  for (let i = 0; i < rows * cols; i++) {
    spots.push(i);
  }
  // Shuffle array so that mines are randomly placed
  spots = _.shuffle(spots);
  while (mines > 0) {
    // Determine row and column
    let pos = spots[spots.length - 1];
    let row = Math.floor(pos/cols);
    let col = pos % rows;
    // Remove that spot from the array
    spots.pop()
    // If the spot is on the board
    if (board[row] && board[row][col] !== undefined) {
      board[row][col] = "X";
      mines--
      // Increment the spots around the mine
      around(board, row, col, incrementNum)
    }
  }
}

// Function for when a button is clicked
const onClick = (board, row, col, mines) => {
  if ($(`#${row}-${col}`).hasClass("flagged")) {
    alert('This class is flagged.  Unflag it if you want to select it.')
  } else {
    $(`#${row}-${col}`).removeClass("transparent flagged")
    spotsLeft--
    if (board[row][col] === 0) {
      board[row][col] = null;
      around(board, row, col, onClick)
    } else if (board[row][col] === 'X') {
      gameOver('loss')
    } else {
      board[row][col] = null;
      if (spotsLeft === 0) {
        gameOver('win')
      }
    }
  }
}

const onRightClick = (board, row, col, mines) => {
  if ($(`#${row}-${col}`).hasClass("transparent")) {
    if (mines >= 0) {
      $(`#${row}-${col}`).toggleClass("flagged")
      $('#flagCount').text(mines)
    }
  }
}

$( document ).ready(function() {
  $('#start').on("click", () => {
    const rows = +document.getElementById("rows").value
    const cols = +document.getElementById("columns").value
    let mines = +document.getElementById("mines").value
    if ((rows > 15) || (rows < 1) || (cols > 15) || (cols < 1) || (mines < 1) || (mines >= rows * cols)) {
      alert('Please enter a valid number for rows, columns, and mines')
    } else {
      spotsLeft = (rows * cols) - mines
      firstMove = true;
      $('#flagCount').text(mines)
      let board = createBoard(rows, cols)
      placeMines(board, rows, cols, mines)
      for (let i = 0; i < rows; i++) {
        let r = $('<tr class="row"></tr>')
        for (let j = 0; j < cols; j++) {
          const button = $(`<td class="button transparent" id=${i}-${j}></td>`)
          button.click(() => {
            if (firstMove) {
              while (board[i][j] === 'X') {
                debugger;
                board = createBoard(rows, cols)
                placeMines(board, rows, cols, mines)
                console.log(board[i][j])
              }
              firstMove = false;
              for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[0].length; col++) {
                  if ($(`#${row}-${col}`).text() === '0') {
                    $(`#${row}-${col}`).text(' ')
                  } else {
                    $(`#${row}-${col}`).text(board[row][col])
                  }
                }
              }
            }
            onClick(board, i, j, mines)
          })
          button.contextmenu((e) => {
            e.preventDefault()
            if (button.hasClass("transparent")) {
              if (button.hasClass("flagged")) {
                mines++
              } else {
                mines--
              }
              onRightClick(board, i, j, mines)
            }
          })
          if (button.text() === '0') {
            button.text(' ')
          } else {
            button.text(board[i][j])
          }
          r.append(button)
        }
        $('#board').append(r)
      }
      $('#board').toggleClass("invisible")
      $('#flags').toggleClass("invisible")
    }
  })
})
