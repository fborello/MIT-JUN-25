class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Configurações do jogo
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.speed = 150; // milissegundos entre cada movimento
        
        this.setupEventListeners();
        this.init();
    }
    
    init() {
        // Parar qualquer loop anterior
        this.gameRunning = false;
        
        // Inicializar cobra
        this.snake = [
            {x: 10, y: 10}
        ];
        
        // Direção inicial (parado)
        this.dx = 0;
        this.dy = 0;
        
        // Comida
        this.food = this.generateFood();
        
        // Estado do jogo
        this.score = 0;
        this.gameRunning = true;
        
        // Atualizar pontuação
        this.updateScore();
        
        // Esconder tela de game over
        this.gameOverElement.classList.remove('show');
        
        // Desenhar estado inicial
        this.draw();
        
        // Iniciar loop do jogo
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Botão de reiniciar
        this.restartBtn.addEventListener('click', () => {
            console.log('Botão reiniciar clicado');
            this.init();
        });
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                if (this.dy !== 1) { // Não pode ir para baixo se estiver indo para cima
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
                if (this.dy !== -1) { // Não pode ir para cima se estiver indo para baixo
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.dx !== 1) { // Não pode ir para direita se estiver indo para esquerda
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (this.dx !== -1) { // Não pode ir para esquerda se estiver indo para direita
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Se a cobra não está se movendo, não fazer nada
        if (this.dx === 0 && this.dy === 0) {
            return;
        }
        
        // Mover cobra
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Verificar colisão com paredes
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Verificar colisão com o próprio corpo (exceto a cabeça atual)
        if (this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Adicionar nova cabeça
        this.snake.unshift(head);
        
        // Verificar se comeu a comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            // Remover cauda se não comeu
            this.snake.pop();
        }
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar grade (opcional)
        this.drawGrid();
        
        // Desenhar cobra
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Cabeça da cobra
                this.ctx.fillStyle = '#27ae60';
            } else {
                // Corpo da cobra
                this.ctx.fillStyle = '#2ecc71';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Adicionar borda
            this.ctx.strokeStyle = '#1e8449';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Desenhar comida
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Linhas verticais
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // Linhas horizontais
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    gameOver() {
        console.log('Game Over chamado - Score:', this.score);
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.add('show');
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.draw();
            setTimeout(() => this.gameLoop(), this.speed);
        }
    }
}

// Iniciar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
