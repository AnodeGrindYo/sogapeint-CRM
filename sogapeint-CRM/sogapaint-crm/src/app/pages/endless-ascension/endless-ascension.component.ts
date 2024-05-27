import { Component, OnInit, AfterViewInit } from '@angular/core';
import  'hammerjs';

@Component({
  selector: 'app-endless-ascension',
  templateUrl: './endless-ascension.component.html',
  styleUrls: ['./endless-ascension.component.scss']
})
export class EndlessAscensionComponent implements OnInit, AfterViewInit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private gameRunning = false;
  private player = {
    x: 50,
    y: 570,
    width: 20,
    height: 30,
    color: '#0ff',
    dy: 0,
    jumpForce: 15,
    gravity: 0.5,
    onGround: false,
    glow: 0,
    glowDirection: 1,
    moveLeft: false,
    moveRight: false,
    jump: false,
    lives: 1
  };
  private hearts = [];
  private platforms = [];
  private coins = [];
  private enemies = [];
  private score = 0;
  private glow = 0;
  private glowDirection = 1;
  private hammer: HammerManager;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('game') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    const playButton = document.getElementById('play');
    playButton.addEventListener('click', () => this.startGame());

    this.hammer = new Hammer(this.canvas);
    this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    this.setupHammerEvents();

    document.documentElement.style.setProperty(
      '--vh',
      `${window.innerHeight * 0.01}px`
    );
  }

  startGame(): void {
    if (this.canvas.requestFullscreen) {
      this.canvas.requestFullscreen();
    } 
    // else if (this.canvas.mozRequestFullScreen) {
    //   this.canvas.requestFullscreen();
    // } else if (this.canvas.webkitRequestFullscreen) {
    //   this.canvas.requestFullscreen();
    // } else if (this.canvas.msRequestFullscreen) {
    //   this.canvas.requestFullscreen();
    // }

    this.resetGame();
    this.gameRunning = true;
    this.animate();
  }

  resetGame(): void {
    this.gameRunning = false;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.player = {
      x: 50,
      y: this.canvas.height - 30,
      width: 20,
      height: 30,
      color: '#0ff',
      dy: 0,
      jumpForce: 15,
      gravity: 0.5,
      onGround: false,
      glow: 0,
      glowDirection: 1,
      moveLeft: false,
      moveRight: false,
      jump: false,
      lives: 1
    };

    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.score = 0;

    this.generatePlatforms();
  }

  setupHammerEvents(): void {
    this.hammer.on('panstart', (ev) => {
      if (ev.offsetDirection === Hammer.DIRECTION_LEFT) {
        this.player.moveLeft = true;
        this.player.moveRight = false;
      } else if (ev.offsetDirection === Hammer.DIRECTION_RIGHT) {
        this.player.moveRight = true;
        this.player.moveLeft = false;
      }
    });

    this.hammer.on('panend', () => {
      this.player.moveLeft = false;
      this.player.moveRight = false;
    });

    this.hammer.on('swipeup', () => {
      this.player.jump = true;
    });

    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          this.player.moveLeft = true;
          break;
        case 'ArrowRight':
          this.player.moveRight = true;
          break;
        case 'ArrowUp':
          if (this.player.onGround) this.player.jump = true;
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          this.player.moveLeft = false;
          break;
        case 'ArrowRight':
          this.player.moveRight = false;
          break;
        case 'ArrowUp':
          this.player.jump = false;
          break;
      }
    });

    let cheatCode = [];
    document.addEventListener('keydown', (e) => {
      cheatCode.push(e.key);
      if (cheatCode.length > 3) {
        cheatCode.shift();
      }
      if (cheatCode.join('') === 'abc') {
        let plat;
        do {
          plat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
        } while (plat.y < 0 || plat.y > this.canvas.height);
        this.generateHeartForPlatform(plat);
        cheatCode = [];
      }
    });
  }

  generatePlatforms(): void {
    let platGap = 100;
    for (let i = 0; i < this.canvas.height / platGap; i++) {
      let platform = {
        x: Math.random() * (this.canvas.width - 30),
        y: i * platGap,
        width: Math.random() * 50 + 50,
        height: 20,
        color: '#808080'
      };
      this.platforms.push(platform);
      this.generateCoinsForPlatform(platform);
    }
  }

  generateCoinsForPlatform(plat): void {
    const numberOfCoins = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numberOfCoins; i++) {
      this.coins.push({
        x: plat.x + i * 20,
        y: plat.y - 10,
        width: 10,
        height: 10,
        color: '#ff0'
      });
    }
  }

  drawHeart(x, y, size, color): void {
    const heartPixels = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    for (let i = 0; i < heartPixels.length; i++) {
      for (let j = 0; j < heartPixels[i].length; j++) {
        if (heartPixels[i][j] === 1) {
          this.context.fillStyle = color;
          this.context.fillRect(x + j * size, y + i * size, size, size);
        }
      }
    }
  }

  generateHeartForPlatform(plat): void {
    if (plat.y >= 0 && plat.y <= this.canvas.height) {
      this.hearts.push({
        x: plat.x + plat.width / 2,
        y: plat.y - 32,
        size: 3,
        color: '#f00'
      });
    }
  }

  collectHearts(): void {
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      let heart = this.hearts[i];
      if (
        this.player.x < heart.x + heart.size &&
        this.player.x + this.player.width > heart.x &&
        this.player.y < heart.y + heart.size &&
        this.player.y + this.player.height > heart.y
      ) {
        this.hearts.splice(i, 1);
        this.player.lives++;
      }
    }
  }

  generateEnemies(): void {
    let ennemyChance = 0.0001 + this.score * 0.000025;
    if (Math.random() < ennemyChance) {
      let enemy = {
        x: Math.random() * (this.canvas.width - 30),
        y: 0,
        width: 20,
        height: 20,
        color: '#f00',
        speed: 2
      };
      this.enemies.push(enemy);
    }
  }

  enemyMove(enemy): void {
    enemy.y += enemy.speed;

    if (enemy.x < this.player.x) {
      enemy.x += enemy.speed;
    } else if (enemy.x > this.player.x) {
      enemy.x -= enemy.speed;
    }

    this.platforms.forEach((plat) => {
      if (
        enemy.x < plat.x + plat.width &&
        enemy.x + enemy.width > plat.x &&
        enemy.y < plat.y + plat.height &&
        enemy.y + enemy.height > plat.y
      ) {
        enemy.y = plat.y + plat.height;
      }
    });
  }

  checkEnemyCollision(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];
      if (
        this.player.x < enemy.x + enemy.width &&
        this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + enemy.height &&
        this.player.y + this.player.height > enemy.y
      ) {
        if (this.player.dy > 0) {
          this.enemies.splice(i, 1);
          this.player.dy = -this.player.jumpForce;
          let pointsToAdd = 10;
          if (this.checkHundredsIncrease(this.score, pointsToAdd)) {
            console.log('yeepee monster !!!');
            let plat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
            this.generateHeartForPlatform(plat);
          }
          this.score += pointsToAdd;
        } else {
          this.enemies.splice(i, 1);
          this.player.lives -= 1;
          if (this.player.lives === 0) {
            this.gameRunning = false;
            alert('Game Over! Score: ' + this.score);
          }
        }
      }
    }
  }

  animate(): void {
    if (!this.gameRunning) return;

    requestAnimationFrame(() => this.animate());

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawHeart(0, 10, 3, '#f00');
    this.context.fillStyle = '#FFF';
    this.context.font = '20px Arial';
    this.context.fillText(': ' + this.player.lives, 40, 30);
    this.context.fillStyle = '#FFF';
    this.context.fillText('Score: ' + this.score, this.canvas.width - 100, 30);

    this.glow += this.glowDirection * 0.05;
    if (this.glow > 1 || this.glow < 0) {
      this.glowDirection *= -1;
    }
    this.context.shadowColor = '#FF00FF';
    this.context.shadowBlur = this.glow * 10;
    this.context.fillStyle = '#FF00FF';
    this.context.font = '30px Futura';
    let goHigherText = 'GO HIGHER!';
    let textWidth = this.context.measureText(goHigherText).width;
    let textX = (this.canvas.width - textWidth) / 2;
    let textY = 30;
    let blinkInterval = 500;
    if (Math.floor(Date.now() / blinkInterval) % 2 == 0) {
      this.context.fillText(goHigherText, textX, textY);
      this.context.fillText('↑↑', this.canvas.width / 2 - this.context.measureText('↑↑').width / 2, 100);
      this.context.shadowBlur = 0;
    }

    this.player.glow += this.player.glowDirection * 0.1;
    if (this.player.glow > 1 || this.player.glow < 0) {
      this.player.glowDirection *= -1;
    }

    this.context.shadowColor = this.player.color;
    this.context.shadowBlur = this.player.glow * 20;

    this.context.fillStyle = this.player.color;
    this.context.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    this.context.shadowBlur = 0;

    this.platforms.forEach((plat) => {
      this.context.fillStyle = plat.color;
      this.context.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    this.coins.forEach((coin) => {
      this.context.fillStyle = coin.color;
      this.context.fillRect(coin.x, coin.y, coin.width, coin.height);
    });

    this.enemies.forEach((enemy) => {
      this.context.fillStyle = enemy.color;
      this.context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      this.enemyMove(enemy);
    });

    this.hearts.forEach((heart) => {
      this.drawHeart(heart.x, heart.y, heart.size, heart.color);
    });

    this.playerMove();
    this.playerFall();
    this.generateMorePlatforms();
    this.collectCoins();
    this.collectHearts();
    this.generateEnemies();
    this.checkEnemyCollision();
    this.cleanupOffscreenEntities();
  }

  playerMove(): void {
    if (this.player.moveLeft) {
      this.player.x -= 5;
      if (this.player.x < 0) {
        this.player.x = this.canvas.width;
      }
    }

    if (this.player.moveRight) {
      this.player.x += 5;
      if (this.player.x > this.canvas.width) {
        this.player.x = 0;
      }
    }

    if (this.player.jump && this.player.onGround) {
      this.player.dy = -this.player.jumpForce;
      this.player.onGround = false;
      this.player.jump = false;
    }
  }

  playerFall(): void {
    this.player.y += this.player.dy;
    this.player.dy += this.player.gravity;

    let highestPlatform = 0;
    this.platforms.forEach((plat) => {
      if (
        this.player.x < plat.x + plat.width &&
        this.player.x + this.player.width > plat.x &&
        this.player.y < plat.y + plat.height &&
        this.player.y + this.player.height > plat.y
      ) {
        this.player.dy = 0;
        this.player.y = plat.y - this.player.height;
        this.player.onGround = true;
      }
      highestPlatform = Math.min(highestPlatform, plat.y);
    });

    if (this.player.y + this.player.height > this.canvas.height) {
      this.player.dy = 0;
      this.player.y = this.canvas.height - this.player.height;
      this.player.onGround = true;
    }

    if (this.player.y < this.canvas.height * 0.5) {
      let dy = this.canvas.height * 0.5 - this.player.y;
      this.player.y += dy;
      highestPlatform += dy;
      this.platforms.forEach((plat) => {
        plat.y += dy;
      });
      this.coins.forEach((coin) => {
        coin.y += dy;
      });
      this.hearts.forEach((heart) => {
        heart.y += dy;
      });
    }

    if (highestPlatform > 0) {
      this.generateMorePlatforms();
    }
  }

  generateMorePlatforms(): void {
    let lastPlat = this.platforms[this.platforms.length - 1];
    if (lastPlat.y > this.canvas.height * 0.5) {
      let newPlatform = {
        x: Math.random() * (this.canvas.width - 30),
        y: lastPlat.y - 100,
        width: Math.random() * 50 + 50,
        height: 20,
        color: '#808080'
      };
      this.platforms.push(newPlatform);
      this.generateCoinsForPlatform(newPlatform);
    }
  }

  collectCoins(): void {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      let coin = this.coins[i];
      if (
        this.player.x < coin.x + coin.width &&
        this.player.x + this.player.width > coin.x &&
        this.player.y < coin.y + coin.height &&
        this.player.y + this.player.height > coin.y
      ) {
        this.coins.splice(i, 1);
        let pointsToAdd = 1;
        if (this.checkHundredsIncrease(this.score, pointsToAdd)) {
          console.log('yeepee coin !!!');
          let plat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
          this.generateHeartForPlatform(plat);
        }
        this.score += pointsToAdd;
      }
    }
  }

  cleanupOffscreenEntities(): void {
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      let plat = this.platforms[i];
      if (plat.y > this.canvas.height) {
        this.platforms.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      let coin = this.coins[i];
      if (coin.y > this.canvas.height) {
        this.coins.splice(i, 1);
      }
    }

    for (let i = this.hearts.length - 1; i >= 0; i--) {
      let heart = this.hearts[i];
      if (heart.y > this.canvas.height) {
        this.hearts.splice(i, 1);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];
      if (enemy.y > this.canvas.height) {
        this.enemies.splice(i, 1);
      }
    }
  }

  checkHundredsIncrease(oldScore, pointsWon): boolean {
    const newScore = oldScore + pointsWon;
    const oldHundreds = Math.floor(oldScore / 100);
    const newHundreds = Math.floor(newScore / 100);
    return newHundreds > oldHundreds;
  }
}
