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
  // Only spots that haven't been cleared should be flaggable
  if ($(`#${row}-${col}`).hasClass("flagged")) {
    alert('This class is flagged.  Unflag it if you want to select it.')
  } else {
    // Uncover spot
    $(`#${row}-${col}`).removeClass("transparent flagged")
    $(`#${row}-${col}`).addClass("cleared")
    spotsLeft--
    if (board[row][col] === 0) {
      // Mark spot as seen (for around())
      board[row][col] = null;
      // Uncover all surrounding zeros and their surrounding spots
      around(board, row, col, onClick)
    // boom
    } else if (board[row][col] === 'X') {
      gameOver('loss')
    // Regular number
    } else {
      // Mark spot as seen (for around())
      board[row][col] = null;
      // If all spots without mines have been uncovered
      if (spotsLeft === 0) {
        gameOver('win')
      }
    }
  }
}

const onRightClick = (board, row, col, mines) => {
  // Only unclicked spots should be flaggable
  if ($(`#${row}-${col}`).hasClass("transparent")) {
    // Prevents user from using more flags than there are mines
    if (mines >= 0) {
      // Flag spot
      $(`#${row}-${col}`).toggleClass("flagged")
      // Update mine count
      $('#flagCount').text(mines)
    }
  }
}

$( document ).ready(function() {
  $('#start').one("click", () => {
    // Get values from input fields
    const rows = +document.getElementById("rows").value
    const cols = +document.getElementById("columns").value
    let mines = +document.getElementById("mines").value
    // Make sure user's input is valid
    if ((rows > 15) || (rows < 1) || (cols > 15) || (cols < 1) || (mines < 1) || (mines >= rows * cols)) {
      alert('You have entered an invalid number for rows, columns, or mines. Please reload the page and try again!')
    } else {
      // spotsLeft is the number of uncovered spots that aren't mines
      spotsLeft = (rows * cols) - mines
      // Helps make sure user's first move isn't a mine
      firstMove = true;
      // Set flag count equal to number of mines
      $('#flagCount').text(mines)
      // Create board and place mines
      let board = createBoard(rows, cols)
      placeMines(board, rows, cols, mines)
      // Add buttons to board
      for (let i = 0; i < rows; i++) {
        // Create row
        let r = $('<tr class="row"></tr>')
        // For each spot in row
        for (let j = 0; j < cols; j++) {
          // Create button element
          const button = $(`<td class="button transparent" id=${i}-${j}></td>`)
          // Add click handler for uncovering spots
          button.click(() => {
            if (firstMove) {
              // Re-write the board until the user's first move is not a mine
              while (board[i][j] === 'X') {
                debugger;
                board = createBoard(rows, cols)
                placeMines(board, rows, cols, mines)
                console.log(board[i][j])
              }
              // No more re-writing board
              firstMove = false;
              // DOM manipulation - update each button to display correct number
              for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                  // Zeros should be blank
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
          // Add click handler for flagging spots
          button.contextmenu((e) => {
            // Prevent right click menu from showing up
            e.preventDefault()
            // Only uncovered spots can be flagged
            if (button.hasClass("transparent")) {
              // Increase flag count if unflagging a spot and vice versa
              if (button.hasClass("flagged")) {
                mines++
              } else {
                mines--
              }
              onRightClick(board, i, j, mines)
            }
          })
          // Update text (zeros left blank)
          if (button.text() === '0') {
            button.text(' ')
          } else {
            button.text(board[i][j])
          }
          // Append button to row
          r.append(button)
        }
        // Append row to board
        $('#board').append(r)
      }
      // Show board
      $('#board').toggleClass("invisible")
    }
  })
})
