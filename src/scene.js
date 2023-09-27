import map from './assets/allSprites_default.png';
import mapJson from './assets/map.json';
import playerPNG from './assets/soldier.png';
import playerRedPNG from './assets/soldierred.png';
import playerYellowPNG from './assets/soldieryellow.png';
import playerBluePNG from './assets/soldierblue.png';
import bullet from './assets/bulletDark3_outline.png';
import explosion from './assets/explosion4.png';
import box from './assets/crateWood.png';
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  players = [];
  bullets = [];
  playerKeys = [];
  playerStates = [];
  ammoGroup;
  AMMO_RESPAWN_TIME = 10000;
  playerNames = [];
  scores = [
    {
      player: 'Verde',
      score: 0,
    },
    {
      player: 'Vermelho',
      score: 0,
    },
    {
      player: 'Amarelo',
      score: 0,
    },
    {
      player: 'Azul',
      score: 0,
    },
  ];
  countdownText;
  constructor() {
    super('GameScene');
  }
  getRandomPlayersSpawn(numeroDeJogadores) {
    const ordem = [];

    // Preenche um array com os números dos jogadores
    for (let i = 1; i <= numeroDeJogadores; i++) {
      ordem.push(i);
    }

    // Embaralha a ordem aleatoriamente
    for (let i = ordem.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; // Troca os elementos aleatoriamente
    }

    return ordem;
  }

  preload() {
    this.load.image('tiles', map.src);
    this.load.tilemapTiledJSON('map', mapJson);
    this.load.spritesheet('player1', playerPNG.src, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('player2', playerRedPNG.src, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('player3', playerYellowPNG.src, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('player4', playerBluePNG.src, {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image('bullet', bullet.src);
    this.load.image('ammo', box.src);
    this.load.image('explosion', explosion.src);
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('allSprites_default', 'tiles');
    const ground = map.createLayer('ground', tileset, 0, 0);
    const objectCollider = map.createLayer('objectCollider', tileset, 0, 0);

    objectCollider?.setCollisionByProperty({ collider: true });
    ground?.setCollisionByProperty({ collider: true });
    let controls = [];
    if (this.input.keyboard) {
      controls = [
        {
          up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), // W para cima
          down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), // S para baixo
          left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), // A para esquerda
          right: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
          ), // D para direita
          shoot: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SHIFT
          ), // Espaço para atirar
        },
        {
          up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), // W para cima
          down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S), // S para baixo
          left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), // A para esquerda
          right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D), // D para direita
          shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB), // Shift para atirar
        },
        {
          up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I), // W para cima
          down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K), // S para baixo
          left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J), // A para esquerda
          right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L), // D para direita
          shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O), // Shift para atirar
        },
        {
          up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T), // W para cima
          down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G), // S para baixo
          left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F), // A para esquerda
          right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H), // D para direita
          shoot: this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
          ), // Shift para atirar
        },
      ];
    }
    const totalPlayers = 4;
    const getPlayersSpawn = this.getRandomPlayersSpawn(totalPlayers);
    for (let i = 1; i <= totalPlayers; i++) {
      const spawnPoint = map.findObject(
        'player' + getPlayersSpawn[i - 1],
        (objects) => objects.name === 'spawn' + getPlayersSpawn[i - 1]
      );
      if (!spawnPoint) {
        continue;
      }

      // const x = Phaser.Math.Between(50, 600); // Posição X aleatória
      // const y = Phaser.Math.Between(50, 600); // Posição Y aleatória

      const player = this.physics.add.sprite(
        spawnPoint.x || 0,
        spawnPoint.y || 0,
        'player' + i
      );
      player.setCollideWorldBounds(true);
      player.setScale(0.25);

      const playerText = this.add.text(player.x, player.y - 20, 'Muniçōes: 2', {
        fontSize: '16px',
        color: '#fff',
        align: 'center',
      });
      this.playerNames.push(playerText);

      this.physics.add.collider(player, objectCollider);
      this.physics.add.collider(player, ground);

      const animate = this.anims;

      animate.create({
        key: 'move' + i,
        frames: animate.generateFrameNames('player' + i, { start: 2, end: 3 }),
        frameRate: 5,
        repeat: -1,
      });

      animate.create({
        key: 'shoot' + i,
        frames: animate.generateFrameNames('player' + i, { start: 1, end: 1 }),
        frameRate: 30,
        repeat: 0,
      });

      // const playerName = prompt(`Jogador ${i}, por favor, insira seu nome:`);

      const playerState = {
        remainingShots: 2,
        canShoot: true,
        playerName: `Tiros`,
      };
      this.playerStates.push(playerState);
      this.players.push(player);
      this.playerKeys.push(controls[i - 1]);
    }
    this.physics.add.overlap(
      this.bullets,
      this.players,
      this.bulletHitPlayer,
      undefined,
      this
    );
    this.ammoGroup = this.physics.add.group();

    this.time.addEvent({
      delay: this.AMMO_RESPAWN_TIME, // 10 segundos
      callback: this.generateRandomAmmo,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(
      this.players,
      this.ammoGroup,
      this.playerCollectAmmo,
      undefined,
      this
    );
    this.generateRandomAmmo();

    this.countdownText = this.add.text(
      Number(this.game.config.width) / 2,
      Number(this.game.config.height) / 2 - 120,
      '',
      {
        font: '72px Arial',
        color: '#ffffff',
        align: 'center',
      }
    );
    this.countdownText.setOrigin(0.5);
    this.countdownText.setVisible(false);
  }
  update() {
    this.players.forEach((player, index) => {
      const controls = this.playerKeys[index];
      const playerState = this.playerStates[index];

      this.playerNames[index].x = player.x - 30;
      this.playerNames[index].y = player.y - 45;

      this.playerNames[index].setText(
        `${this.playerStates[index]?.playerName || 'Tiros'}: ${
          this.playerStates[index]?.remainingShots || 0
        }`
      );

      player.body.setVelocity(0);
      const playerSpeed = 150;
      if (controls?.left.isDown) {
        player.setRotation(Math.PI / 2);
        player.anims.play('move' + Number(Number(index) + 1), true);
        player.body.setVelocityX(-playerSpeed);
      } else if (controls?.right.isDown) {
        player.setRotation(-Math.PI / 2);
        player.body.setVelocityX(playerSpeed);
        player.anims.play('move' + Number(Number(index) + 1), true);
      } else if (controls?.down.isDown) {
        player.body.setVelocityY(playerSpeed);
        player.setRotation(0);
        player.anims.play('move' + Number(Number(index) + 1), true);
      } else if (controls?.up.isDown) {
        player.setRotation(Math.PI);
        player.anims.play('move' + Number(Number(index) + 1), true);
        player.body.setVelocityY(-playerSpeed);
      } else {
        player.anims.stop();
      }

      // Atire quando a tecla de tiro for pressionada
      if (controls?.shoot.isDown) {
        this.shootBullet(player, playerState);
      }
    });
  }
  playerCollectAmmo(player, ammo) {
    if (!player.active) {
      return;
    }
    ammo.destroy();
    // Aumente a contagem de munição do jogador em 2
    const playerIndex = this.players.indexOf(player);
    if (playerIndex !== -1) {
      this.playerStates[playerIndex].remainingShots += 2;
    }

    // setTimeout(this.generateRandomAmmo.bind(this), this.AMMO_RESPAWN_TIME);
  }

  generateRandomAmmo() {
    const x = Phaser.Math.Between(50, 600); // Posição X aleatória
    const y = Phaser.Math.Between(50, 600); // Posição Y aleatória

    const ammo = this.physics.add.image(x, y, 'ammo');

    // Configure a colisão com os jogadores
    this.physics.add.overlap(
      this.players,
      ammo,
      this.playerCollectAmmo,
      undefined,
      this
    );
  }
  mostrarPlacar() {
    const cenaPlacar = this.add.container(0, 0); // Crie uma cena ou contêiner para o placar

    // Crie um fundo para o placar
    const fundoPlacar = this.add.rectangle(
      Number(this.game.config.width) / 2,
      Number(this.game.config.height) / 2,
      Number(this.game.config.width) / 2,
      Number(this.game.config.height) / 2,
      0x000000,
      0.7
    );
    cenaPlacar.add(fundoPlacar);

    // Crie um texto para exibir as pontuações
    let textoPlacar = 'Placar:\n';

    for (const item of this.scores) {
      textoPlacar += `${item.player}: ${item.score}\n`;
    }

    const texto = this.add.text(
      Number(this.game.config.width) / 2,
      Number(this.game.config.height) / 2,
      textoPlacar,
      {
        fontSize: '24px',
        color: '#fff',
        align: 'center',
      }
    );
    texto.setOrigin(0.5);

    cenaPlacar.add(this.countdownText);
    cenaPlacar.add(texto);

    // Agora, a cena do placar está pronta para ser mostrada
  }
  bulletHitPlayer(bullet, player) {
    if (!player.active) {
      return;
    }
    // Encontre o índice do jogador atingido
    const playerIndex = this.players.indexOf(player);

    // Se o jogador não foi encontrado (índice -1), saia da função
    if (playerIndex === -1 || bullet.playerIndex === playerIndex) {
      return;
    }

    player.setActive(false);
    player.setVisible(false);
    this.playerNames[playerIndex].setVisible(false);
    this.onBulletHit(bullet);
    // Atualize os arrays para refletir a remoção do jogador
    // this.players.splice(playerIndex, 1);
    // this.playerKeys.splice(playerIndex, 1);
    // this.playerStates.splice(playerIndex, 1);

    const explosion = this.physics.add.sprite(player.x, player.y, 'explosion');
    bullet.destroy();
    explosion.setScale(0.5);
    this.time.delayedCall(200, () => {
      explosion.destroy();
    });
    // Verifique se o jogo acabou (por exemplo, se todos os jogadores foram derrotados)
    const alive = this.players.filter((player) => player.active);
    if (alive.length <= 1) {
      if (alive.length === 1) {
        const aliveIndex = this.players.indexOf(alive[0]);

        this.scores[aliveIndex].score++;
      }

      this.countdownText.setVisible(true);
      this.countdownText.setText('3');
      this.mostrarPlacar.call(this);
      // Conte até 3 em intervalos de 1 segundo
      let count = 3;
      const countdownInterval = setInterval(() => {
        count--;
        this.countdownText.setText(count.toString());

        if (count <= 0) {
          clearInterval(countdownInterval);

          // Reinicie o jogo
          this.restartGame();
        }
      }, 1000);
    }
  }

  restartGame() {
    this.scene.restart();
    this.players = [];
    this.bullets = [];
    this.playerKeys = [];
    this.playerNames = [];
    this.playerStates = [];
    // window.location.reload();
  }

  shootBullet(player, playerState) {
    if (!player.active) {
      return;
    }
    const playerIndex = this.players.indexOf(player);
    if (playerState.remainingShots <= 0) {
      return; // Não dispare se não houver mais munições
    }
    if (playerState.canShoot === false) {
      return; // Não dispare se o jogador não puder atirar novamente ainda
    }
    let direction;
    let bulletDirectionX;
    let bulletDirectionY;
    if (player.body.rotation == 180) {
      direction = 'up';
      bulletDirectionX = player.x + 5;
      bulletDirectionY = player.y - 20;
    } else if (player.body.rotation == 0) {
      bulletDirectionX = player.x - 5;
      bulletDirectionY = player.y + 20;
      direction = 'down';
    } else if (player.body.rotation == 90) {
      direction = 'left';
      bulletDirectionX = player.x - 20;
      bulletDirectionY = player.y - 5;
    } else if (player.body.rotation == -90) {
      direction = 'right';
      bulletDirectionX = player.x + 20;
      bulletDirectionY = player.y + 5;
    }

    // Crie uma bala para o jogador
    const bullet = this.physics.add.sprite(
      bulletDirectionX || 0,
      bulletDirectionY || 0,
      'bullet'
    );
    bullet.setScale(0.3);
    player.anims.play('shoot' + Number(playerIndex + 1), true);
    this.bullets.push(bullet);

    const speed = 500;

    if (direction === 'up') {
      bullet.setVelocity(0, -speed);
      bullet.setRotation(0);
    } else if (direction === 'down') {
      bullet.setRotation(Math.PI);
      bullet.setVelocity(0, speed);
    } else if (direction === 'left') {
      bullet.setVelocity(-speed, 0);
      bullet.setRotation(-Math.PI / 2);
    } else if (direction === 'right') {
      bullet.setRotation(Math.PI / 2);
      bullet.setVelocity(speed, 0);
    }

    bullet.playerIndex = playerIndex;
    // Destrua a bala após algum tempo ou quando ela sair da tela

    playerState.remainingShots--;
    playerState.canShoot = false;
    setTimeout(() => {
      playerState.canShoot = true;
      // Permita apenas 1 tiro por vez
    }, 500);
    this.time.delayedCall(5000, () => {
      bullet.destroy();
    });
  }

  onBulletHit(bullet) {
    this.time.delayedCall(1000, () => {
      bullet.destroy();
    });
  }
}
