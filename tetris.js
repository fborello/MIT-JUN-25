class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Elementos da interface
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.finalLinesElement = document.getElementById('finalLines');
        this.gameOverElement = document.getElementById('gameOver');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Botões
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Configurações do jogo
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // 1 segundo inicial
        
        // Grade do jogo
        this.board = this.createBoard();
        
        // Peças do Tetris
        this.pieces = {
            I: {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00f5ff'
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#ffff00'
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#a000f0'
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00f000'
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#f00000'
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000f0'
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#f0a000'
            }
        };
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.setupEventListeners();
        this.init();
    }
    
    createBoard() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    init() {
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.updateDisplay();
        this.generateNewPiece();
        this.draw();
        
        this.gameOverElement.classList.remove('show');
    }
    
    setupEventListeners() {
        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // Botões
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.restartBtn.addEventListener('click', () => this.init());
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? 'Continuar' : 'Pausar';
        }
    }
    
    resetGame() {
        this.init();
    }
    
    generateNewPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        
        if (!this.currentPiece) {
            this.currentPiece = {
                type: randomType,
                shape: this.pieces[randomType].shape,
                color: this.pieces[randomType].color,
                x: Math.floor(this.cols / 2) - Math.floor(this.pieces[randomType].shape[0].length / 2),
                y: 0
            };
        } else {
            this.currentPiece = this.nextPiece;
        }
        
        // Gerar próxima peça
        const nextType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        this.nextPiece = {
            type: nextType,
            shape: this.pieces[nextType].shape,
            color: this.pieces[nextType].color,
            x: Math.floor(this.cols / 2) - Math.floor(this.pieces[nextType].shape[0].length / 2),
            y: 0
        };
        
        this.drawNextPiece();
        
        // Verificar se a nova peça colide (Game Over)
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#1a1a1a';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }
    
    movePiece(dx, dy) {
        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };
        
        if (!this.checkCollision(newPiece)) {
            this.currentPiece = newPiece;
            this.draw();
            return true;
        }
        
        // Se não conseguiu mover para baixo, fixar a peça
        if (dy > 0) {
            this.fixPiece();
            this.clearLines();
            this.generateNewPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const newPiece = {
            ...this.currentPiece,
            shape: rotated
        };
        
        if (!this.checkCollision(newPiece)) {
            this.currentPiece = newPiece;
            this.draw();
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    checkCollision(piece) {
        return piece.shape.some((row, y) => {
            return row.some((value, x) => {
                if (!value) return false;
                
                const boardX = piece.x + x;
                const boardY = piece.y + y;
                
                return boardX < 0 || boardX >= this.cols || 
                       boardY >= this.rows || 
                       (boardY >= 0 && this.board[boardY][boardX]);
            });
        });
    }
    
    fixPiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            });
        });
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Verificar a mesma linha novamente
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            
            // Aumentar nível a cada 10 linhas
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar grade
        this.drawGrid();
        
        // Desenhar peças fixas
        this.drawBoard();
        
        // Desenhar peça atual
        this.drawPiece(this.currentPiece);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawBoard() {
        this.board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.ctx.fillStyle = cell;
                    this.ctx.fillRect(
                        x * this.blockSize + 1,
                        y * this.blockSize + 1,
                        this.blockSize - 2,
                        this.blockSize - 2
                    );
                }
            });
        });
    }
    
    drawPiece(piece) {
        if (!piece) return;
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = piece.color;
                    this.ctx.fillRect(
                        (piece.x + x) * this.blockSize + 1,
                        (piece.y + y) * this.blockSize + 1,
                        this.blockSize - 2,
                        this.blockSize - 2
                    );
                }
            });
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.finalLinesElement.textContent = this.lines;
        this.gameOverElement.classList.add('show');
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const now = Date.now();
        
        if (now - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = now;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Iniciar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
