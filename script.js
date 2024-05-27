const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoes = [
    [
        [1, 1, 1, 1]
    ],
    [
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 1],
        [0, 0, 1]
    ],
    [
        [1, 1, 1],
        [1, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [1, 1],
        [1, 1]
    ]
];
const colors = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];
let playfield = Array.from({ length: 20 }, () => Array(10).fill(0));
let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;
let score = 0;

const scoreElement = document.getElementById('score');

function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[color - 1];
                context.fillRect((offset.x + x) * grid, (offset.y + y) * grid, grid - 1, grid - 1);
                context.fillStyle = 'black';
                context.font = '8px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('NU', (offset.x + x) * grid + grid / 2, (offset.y + y) * grid + grid / 2);
            }
        });
    });
}

function drawPlayfield(playfield) {
    playfield.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value - 1];
                context.fillRect(x * grid, y * grid, grid - 1, grid - 1);
                context.fillStyle = 'black';
                context.font = '8px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('NU', x * grid + grid / 2, y * grid + grid / 2);
            }
        });
    });
}

function merge(playfield, tetromino) {
    tetromino.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                playfield[tetromino.row + y][tetromino.col + x] = tetromino.color;
            }
        });
    });
}

function rotate(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index])).reverse();
}

function collision(playfield, tetromino) {
    for (let y = 0; y < tetromino.matrix.length; y++) {
        for (let x = 0; x < tetromino.matrix[y].length; x++) {
            if (
                tetromino.matrix[y][x] !== 0 &&
                (playfield[tetromino.row + y] && playfield[tetromino.row + y][tetromino.col + x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function getNextTetromino() {
    const index = Math.floor(Math.random() * tetrominoes.length);
    const matrix = tetrominoes[index];
    return {
        matrix: matrix,
        row: 0,
        col: Math.floor((10 - matrix[0].length) / 2),
        color: index + 1
    };
}

function removeLines() {
    let lines = 0;
    playfield = playfield.reduce((acc, row) => {
        if (row.every(value => value !== 0)) {
            lines++;
            acc.unshift(Array(10).fill(0));
        } else {
            acc.push(row);
        }
        return acc;
    }, []);
    score += lines * 10;
    scoreElement.innerText = score;
    return lines;
}

function update() {
    if (gameOver) return;
    count++;
    if (count % 20 === 0) {
        tetromino.row++;
        if (collision(playfield, tetromino)) {
            tetromino.row--;
            merge(playfield, tetromino);
            removeLines();
            tetromino = getNextTetromino();
            if (collision(playfield, tetromino)) {
                gameOver = true;
                alert('Game Over');
                return;
            }
        }
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayfield(playfield);
    drawMatrix(tetromino.matrix, { x: tetromino.col, y: tetromino.row }, tetromino.color);
    rAF = requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (gameOver) return;
    if (event.key === 'ArrowLeft') {
        tetromino.col--;
        if (collision(playfield, tetromino)) {
            tetromino.col++;
        }
    }
    if (event.key === 'ArrowRight') {
        tetromino.col++;
        if (collision(playfield, tetromino)) {
            tetromino.col--;
        }
    }
    if (event.key === 'ArrowDown') {
        tetromino.row++;
        if (collision(playfield, tetromino)) {
            tetromino.row--;
        }
    }
    if (event.key === 'ArrowUp') {
        const matrix = rotate(tetromino.matrix);
        const col = tetromino.col;
        let offset = 1;
        while (collision(playfield, { ...tetromino, matrix })) {
            tetromino.col += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > tetromino.matrix[0].length) {
                tetromino.matrix = rotate(tetromino.matrix);
                tetromino.col = col;
                return;
            }
        }
        tetromino.matrix = matrix;
    }
});

rAF = requestAnimationFrame(update);
