var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game = function(game){};

var skillPoints = 0
//This is the bullets group
var bullets;
//var cancerBullets;

//This is the damage multipler for the player and enemies
var damage = 50;
var cancerSpawnDamage = 50;

//This will give you a bonus multiplier for killing the same type of enemies
var bonusMultiplier = 1;
var currentEnemy;
var currentTarget; //identifies the actual target
var previousEnemy;

//This will be used to give players temporary invincibility after damaged
var invincible = false;
var invincibilityCounter = 60;

//This will determine whether or not the player is attacking
var attacking = false;

//array of currently spawned traps
var traps = new Array();
var activeTrap = false; //temp boolean to spawn a single trap

//variable for the gui
//array of health blocks for gui
var healthArray = new Array();
//used to keep track of the player's max health (used in health calculations)
var playerMaxHealth;
//top gui bar
var topMenuBar;
//bottom gui bar
var bottomMenuBar;
//box that holds the enemy you're doing bous damage to
var bonusDamageBox;
//sprite that currently takes bonus damage
var bonusDamageEnemy;
//it's texture
var bonusDamageEnemyTexture;
//ability icon array
var abilityIcons = new Array();
//array that holds what abilites the player can use.

var game_paused = false;
var pause_menu_up = false;

var abilities = {
    "mucus trap" : true,
    "sniper" : true,
    "ally" : false,
    "whip" : false,
    "blue wave" : false,
    "scatter" : false,
    "void" : false,        
};



TopDownGame.Game.prototype = {
  create: function() {
    
    this.map = this.game.add.tilemap("Levels");

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('TileSet Immune Invasion', 'gameTiles');

    this.backgroundLayer = this.map.createLayer('Background Layer');
    this.blockedLayer = this.map.createLayer(this.game.selectedLevel);

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel);

    this.backgroundLayer.renderSettings.enableScrollDelta = true;
    this.blockedLayer.renderSettings.enableSrollDelta = true;
    //resizes the game world to match the layer dimensions
    this.backgroundLayer.resizeWorld();
   
    //White Blood Cell is the name of this sprite
    this.player = this.game.add.sprite(1580, 1856, 'WhiteBloodCell');
    
    //Sets the player anchor to 0.5, 0.5 (center)
    this.player.anchor.setTo(0.5,0.5)

    //ADDING THE DIFFERENT ANIMATIONS OF THE WHITE BLOOD CELL
    this.player.animations.add('attackBack', [0,1,2,3,4,5,6,7,8,9], 7, true);
    this.player.animations.add('attackForward', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 7, true);
    this.player.animations.add('attackLeft', [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], 7, true);
    this.player.animations.add('attackRight', [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 7, true);
    this.player.animations.add('dead', [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], 7, false);
    this.player.animations.add('idleBack', [59, 60, 61, 62, 63,64,65,66,67,68,69,70,71,72,73,74,75,76], 7, true);
    this.player.animations.add('idleForward', [77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94], 7, true);
    this.player.animations.add('idleLeft', [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112], 7, true);
    this.player.animations.add('idleRight', [113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130], 7, true);
    this.player.animations.add('moveBack', [131, 132, 133, 134, 135, 136, 137, 138, 139, 140], 7, true);
    this.player.animations.add('moveForward', [141, 142, 143, 144, 145, 146, 147, 148, 149, 150], 7, true);
    this.player.animations.add('moveLeft', [151, 152, 153, 154, 155, 156, 157, 158, 159, 160],7,true);
    this.player.animations.add('moveRight', [161, 162, 163, 164, 165, 166, 167, 168, 169, 170], 7, true);
    this.player.animations.add('takeDamage', [171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181], 7, false);


    //Play idle forward at the start of the game
    this.player.animations.play('idleForward');
    
    //This will keep track of which idle animation to play next
    this.currentAnimation = "moveForward";

    //This is a counter varible used to determine respawn time. The counter will update every frame after a player's death. 
    //The number of deaths starts with 1 so that the dying animation can be played upon first death.
    //However when displaying the number of deaths on the screen, just use this.numberOfDeaths - 1
    this.counter = 0;
    this.numberOfDeaths = 1;
    
    //enables arcade and sets world bounds collision
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //Set the Player HP
    this.player.HP = 500;

    //Sets the player speed
    this.player.speed = 750;

    //Sets locked status
    this.player.locked = false;
    this.player.lockedTimer = 1000;

    

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //Creating an array of cancer cell enemies,eacn time an enemy is created in the create cancer function, it will be pushed into this array
    this.cancerCells = [];
    this.blueViruses = [];
    this.parasites = [];
    this.bacterias = [];
    this.totalAllies = [];
    this.totalEnemies = [];
    //Creates an array of enemy bullets, each time a bullet group is created, the bullets are pushed. For the purpose of benchmark2, we assume all enemies can fire
    this.enemyBullets = [];
    this.allyBullets = [];

    //Giving the players a few seconds before the first wave spawns
    this.generateFirstWave();

    //Create an organ object to protect
    this.heart = this.game.add.sprite(1580, 2000, 'Heart');
    if (this.game.selectedLevel == "Level5") { this.heart.y = 2400; }
    this.heart.anchor.setTo(0.5, 0.5);
    this.heart.animations.add('beating', [0,1,2,3], 5, true);
    this.heart.animations.play('beating');
    this.game.physics.arcade.enable(this.heart);
    this.heart.body.collideWorldBounds = true;
    this.heart.HP = 5000;
    this.heart.maxHP = 5000;
    this.heart.body.immovable = true;
    this.heart.tinted = false;
    this.heart.tintCounter = 5;
    var bmd = this.game.add.bitmapData(200,10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,180,30);
    bmd.ctx.fillStyle = '#00ff00';
    bmd.ctx.fill();
    var healthBar = this.game.add.sprite(-100, -100, bmd);
    this.heart.addChild(healthBar);
    

    //move player with wasd controls
    this.W = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.F = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
    this.I = this.game.input.keyboard.addKey(Phaser.Keyboard.I); //Cheat
    this.E = this.game.input.keyboard.addKey(Phaser.Keyboard.E); //Blue Wave
    this.R = this.game.input.keyboard.addKey(Phaser.Keyboard.R); //Whip
    this.T = this.game.input.keyboard.addKey(Phaser.Keyboard.T); //Void
    this.G = this.game.input.keyboard.addKey(Phaser.Keyboard.G); //Mucus Trap
    this.J = this.game.input.keyboard.addKey(Phaser.Keyboard.J); //Mucus Trap
    this.K = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
    this.spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    

    //Create Bullets
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(50, 'AntibodyBullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    this.fireRate = 100;
    this.nextFire = 0;

    //create sniper Bullets
    this.sniperBullets = this.game.add.group();
    this.sniperBullets.enableBody = true;
    this.sniperBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.sniperBullets.createMultiple(1, 'SniperBullet');
    this.sniperBullets.setAll('checkWorldBounds', true);
    this.sniperBullets.setAll('outOfBoundsKill', true);
    this.sniperFireRate = 1500;
    this.sniperNextFire = 0;

    //create scattershot bullets
    this.scatterBullets = this.game.add.group();
    this.scatterBullets.enableBody = true;
    this.scatterBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.scatterBullets.createMultiple(150, 'AntibodyBullet');
    this.scatterBullets.setAll('checkWorldBounds', true);
    this.scatterBullets.setAll('outOfBoundsKill', true);
    this.scatterFireRate = 5;
    this.scatterNextFire = 0

    //The following variables implements the WAVE system and enemy spawn
    this.currentWave = 0; //The current wave the player is on
    this.enemiesDead = 0;
    this.enemiesLeft = 0;

    //This will keep boss spawn at 1
    this.cancerBossGenerated = false;
    this.parasiteBossGenerated = false;
    this.virusBossGenerated = false;
    this.cancerBossDefeated = false;
    this.parasiteBossDefeated = false;
    this.virusBossDefeated = false;
    this.generateCancerSpawnCounter = 1000; //generates new cancer spawns after every 1000 frames
    this.generateParasiteCounter = 300;
    this.generateVirusCounter = 2000;
   
    //Summon 1 ally only
    this.allySummoned = false;
    this.targetEnemy;


    //make the gui

    //draw the top menu bar
    this.createTopBar();

    //draw the bottom menu bar
    this.createBottomBar();

    //draw the health icons
    this.createHealth();

    //create the bonus damage box
    this.createBonusDamageBox();

    //create a single trap
    this.createATrap();

    //create the ability icons
    this.createAbilityIcons();

    //AOE attacks, create one first so we can recycle it later
    //BlueWave - fully heals player and grants invincibility, grants powerful barrier that deals massive damage
    this.blueWave = TopDownGame.game.add.sprite(-800, -800, 'BlueWave');
    this.blueWave.anchor.setTo(0.5, 0.5);
    this.blueWave.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9,10,11], 13, true);
    TopDownGame.game.physics.arcade.enable( this.blueWave);
    this.blueWave.body.immovable = true;
    this.blueWave.visible = false;
    this.blueWave.kill()
    this.blueWaveCounter = 300;

    //Whip - grants a large AOE attack that deals constant damage to enemies within that area
    this.whip = TopDownGame.game.add.sprite(-800, -800, 'Whip');
    this.whip.anchor.setTo(0.5, 0.5);
    this.whip.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 40, true);
    TopDownGame.game.physics.arcade.enable(this.whip);
    this.whip.body.immovable = true;
    this.whip.visible = false;
    this.whip.kill()
    this.whipCounter = 1000;

    //Void - grants a powerful AOE attack that deals massive damage to enemies within that area
    this.void = TopDownGame.game.add.sprite(-800, -800, 'Void');
    this.void.anchor.setTo(0.5, 0.5);
    this.void.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9], 13, true);
    TopDownGame.game.physics.arcade.enable(this.void);
    this.void.body.immovable = true;
    this.void.visible = false;
    this.void.kill()
   
    //Mucus Trap- slows down all enemies within the trap's range, activates when enemies landed in its area for a set amount of time
    this.mucusTrap = TopDownGame.game.add.sprite(-800, -800, 'MucusTrap');
    this.mucusTrap.anchor.setTo(0.5, 0.5);
    this.mucusTrap.animations.add('dormant', [0], 13, true);
    this.mucusTrap.animations.add('resolving', [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], 20, false);
    TopDownGame.game.physics.arcade.enable(this.mucusTrap);
    this.mucusTrap.body.immovable = true;
    this.mucusTrap.visible = false;
    this.mucusTrap.kill();
    this.mucusTrapCounter = 300;
    
    //ParasiteBoss AOE attack
    this.parasiteTeeths = [];
    for(var i = 0; i < 5; i++){
        this.parasiteTeeth = TopDownGame.game.add.sprite(-800, -800, 'ParasiteTeeth');
        this.parasiteTeeth.fired = false;
        this.parasiteTeeth.anchor.setTo(0.5, 0.5);
        this.parasiteTeeth.animations.add('resolving', [0,1,2], 17, true);
        this.parasiteTeeth.animations.add('exploding', [3,4,5,6,7,8,9,10,11,12,13], 17, false);
        TopDownGame.game.physics.arcade.enable(this.parasiteTeeth);
        this.parasiteTeeth.visible = false;
        this.parasiteTeeths.push(this.parasiteTeeth);
    }

    for(var i = 0; i <this.parasiteTeeths.length; i++){
        this.parasiteTeeths[i].kill();
    }

    //VirusBoss AOE attack
    this.virusHole = TopDownGame.game.add.sprite(-800, -800, 'VirusHole');
    this.virusHole.fired = false;
    this.virusHole.anchor.setTo(0.5, 0.5);
    this.virusHole.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], 13, false);
    this.virusHole.animations.add('exploding', [7,8,9,10,11,12,13,14,15,16,17,18,19], 13, false);
    TopDownGame.game.physics.arcade.enable(this.virusHole);
    this.virusHole.visible = false;
    this.virusHole.kill()

    this.target = TopDownGame.game.add.sprite(-800, -800, 'Target');
    this.target.anchor.setTo(0.5, 0.5);
    TopDownGame.game.physics.arcade.enable(this.target);
    this.target.visible = false;
    this.target.kill();

    this.sniperExplosion = TopDownGame.game.add.sprite(-800, -800, 'SniperExplosion');
    this.sniperExplosion.anchor.setTo(0.5,0.5);
    this.sniperExplosion.animations.add('resolving', [0,1,2,3,4], 9, false);
    TopDownGame.game.physics.arcade.enable(this.sniperExplosion);
    this.sniperExplosion.visible = false;
    this.sniperExplosion.kill();

    //checks if gravity/wind is present
    this.windActivated = false;
    this.warningSet = false;

    //Warning sign
    this.warning = TopDownGame.game.add.sprite(-800, -800, 'Warning');
    this.warning.anchor.setTo(0.5, 0.5);
    this.warning.animations.add('resolving', [0,1,2,3,4,5], 5, true);
    TopDownGame.game.physics.arcade.enable(this.warning);
    this.warning.visible = false;
    this.warning.kill();
    this.pressureUp = TopDownGame.game.add.sprite(-800, -800, 'Pressure Up');
    this.pressureDown = TopDownGame.game.add.sprite(-800, -800, 'Pressure Down');
    this.pressureLeft = TopDownGame.game.add.sprite(-800, -800, 'Pressure Left');
    this.pressureRight = TopDownGame.game.add.sprite(-800, -800, 'Pressure Right');
    this.gunDisabled = TopDownGame.game.add.sprite(-800, -800, 'Gun Disabled');
    this.pressureUp.anchor.setTo(0.5, 0.5);
    this.pressureDown.anchor.setTo(0.5, 0.5);
    this.pressureLeft.anchor.setTo(0.5, 0.5);
    this.pressureRight.anchor.setTo(0.5, 0.5);
    this.gunDisabled.anchor.setTo(0.5, 0.5);
    TopDownGame.game.physics.arcade.enable(this.pressureUp);
    TopDownGame.game.physics.arcade.enable(this.pressureDown);
    TopDownGame.game.physics.arcade.enable(this.pressureLeft);
    TopDownGame.game.physics.arcade.enable(this.pressureRight);
    TopDownGame.game.physics.arcade.enable(this.gunDisabled);
    this.pressureUp.kill();
    this.pressureDown.kill();
    this.pressureLeft.kill();
    this.pressureRight.kill();
    this.gunDisabled.kill();
 
    this.mainTheme = this.game.add.audio('Main');
    this.boss1theme = this.game.add.audio('Boss1');
    this.boss2theme = this.game.add.audio('Boss2');
    if(!this.mainTheme.isPlaying){
    //this.mainTheme.play();
    }
    this.mainTheme.loop = true;
    this.boss1theme.play();
    this.boss1theme.loop = true;
    this.boss1theme.pause();
    this.boss2theme.play();
    this.boss2theme.loop = true;
    this.boss2theme.pause();

    //pathfinding
    var tile_dimensions = new Phaser.Point(128, 128);
    this.pathfinding = this.game.plugins.add(TopDownGame.Pathfinding, this.map.layers[1].data, [-1], tile_dimensions);
    this.setPathfindingMap(this.game.selectedLevel);
    
    this.leave = false;

    this.text = this.game.add.text(1600, 1830, "Skill Points: " + skillPoints, {
        font: "50px Arial",
        fill: "#42f4e8",
        align: "center"
    });

    this.level = this.game.add.text(350, 64, "Level: " + this.game.selectedLevel.substr(-1), {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
    });

    this.wave = this.game.add.text(575, 64, "Wave: " + this.currentWave, {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
    });

    this.left = this.game.add.text(850, 64, "Enemies Left: " + this.enemiesLeft, {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
    });

    this.shooting = this.game.add.text(1160, 64, "Shooting Mode: Antibody Gun", {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
    });

    this.timeUntilNextWave = this.game.add.text(1560, 64, "Next Wave:", {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
    });

    this.playerRespawnTime = this.game.add.text(960, 960, "Time Until Respawn:", {
        font: "100px Arial",
        fill: "#00ff00",
        align: "center"
    });

    this.heartDanger = this.game.add.text(960, 400, "HEART HP LOW!", {
        font: "60px Arial",
        fill: "#00ff00",
        align: "center"
    });

    this.displayMultiplier = this.game.add.text(138, 300, "Current Multiplier:", {
        font: "40px Arial",
        fill: "#00ff00",
        align: "center"
    });

    this.text.anchor.setTo(0.5, 0.5);
    this.text.fixedToCamera = true;
    this.shooting.anchor.setTo(0.5,0.5);
    this.shooting.fixedToCamera = true;
    this.level.anchor.setTo(0.5, 0.5);
    this.level.fixedToCamera = true;
    this.wave.anchor.setTo(0.5, 0.5);
    this.wave.fixedToCamera = true;
    this.left.anchor.setTo(0.5, 0.5);
    this.left.fixedToCamera = true;
    this.playerRespawnTime.anchor.setTo(0.5, 0.5);
    this.playerRespawnTime.fixedToCamera = true;
    this.heartDanger.anchor.setTo(0.5, 0.5);
    this.heartDanger.fixedToCamera = true;
    this.timeUntilNextWave.anchor.setTo(0.5, 0.5);
    this.timeUntilNextWave.fixedToCamera = true;
    this.displayMultiplier.anchor.setTo(0.5, 0.5);
    this.displayMultiplier.fixedToCamera = true;

    this.sniperLine = new Phaser.Line(this.player.x, this.player.y, this.player.x, this.player.y);
    this.sniperLine.width = 100;
    this.player.sniperMode = false;
    this.player.scatterMode = false;
    this.shootingMode = 0; //This will set up shooting MODES


    //Tutorial variables
    this.current_instruction = -1;
    this.instruction_counter = -1;
    this.tutorial_text = this.game.add.text(960, 450, "", { font: "100px Arial", fill: "#ffffff", align: "center"})
    this.tutorial_text.anchor.setTo(0.5, 0.5);
    this.tutorial_text.fixedToCamera = true;

    //pause
    game_paused = false;
    pause_menu_up = false;

    //This will be the time between waves
    this.waveCounter = 300;

    this.whiteBloodCellAlly();
    this.respawnCountDown = 0;
  },


  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },

  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },














  update: function(game) {
    
    
    
    //collision for player
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.collide(bullets, this.blockedLayer, this.bulletCollisionLayer);
    this.game.physics.arcade.collide(bullets, this.heart, this.healCollision);
    this.game.physics.arcade.collide(this.scatterBullets, this.blockedLayer, this.bulletCollisionLayer);
    this.game.physics.arcade.collide(this.player, this.heart);
    this.game.physics.arcade.overlap(this.player, this.virusHole, this.virusHoleCollisionPlayer);
    this.game.physics.arcade.overlap(this.heart, this.virusHole, this.virusHoleCollisionOrgan);

    //For loop collision for each enemy bullets
    for (var i = 0; i < this.enemyBullets.length; i++){
        this.game.physics.arcade.collide(this.enemyBullets[i], this.blockedLayer, this.bulletCollisionLayer);
        this.game.physics.arcade.overlap(this.enemyBullets[i], this.player, this.bulletCollisionPlayer);
        this.game.physics.arcade.collide(this.enemyBullets[i], this.heart, this.bulletCollisionOrgan);
    }

    //For loop collision for each parasite Teeth attack
    for(var i = 0; i < this.parasiteTeeths.length; i++){
        this.game.physics.arcade.collide(this.parasiteTeeths[i], this.blockedLayer, this.teethCollisionLayer, null, this);
        this.game.physics.arcade.collide(this.parasiteTeeths[i], this.heart, this.teethCollisionHeart);
        this.game.physics.arcade.overlap(this.player, this.parasiteTeeths[i], this.teethCollisionPlayer);
    }

    //For loop collision for every ally
    for(var i = 0; i < this.totalAllies.length; i++){
        this.game.physics.arcade.collide(this.totalAllies[i], this.blockedLayer);
        this.game.physics.arcade.collide(this.allyBullets[i], this.blockedLayer, this.bulletCollisionLayer);
        this.game.physics.arcade.collide(this.totalAllies[i], this.heart);
        
    }

    //Double for loop so ally bullets can deal damage to all enemies
    for(var i = 0; i < this.totalAllies.length; i++){
        for(var j = 0; j < this.totalEnemies.length; j++){
            this.game.physics.arcade.overlap(this.allyBullets[i], this.totalEnemies[j], this.allyBulletCollisionEnemy);
        }
    }

    //Double for loop so enemy bullets can deal damage to all allies
    for(var i = 0; i < this.totalEnemies.length; i++){
        for(var j = 0; j < this.totalAllies.length; j++){
            this.game.physics.arcade.overlap(this.enemyBullets[i], this.totalAllies[j], this.bulletCollisionAlly);
        }
    }
    

    //For loop collision for enemy enemy cells
    for (var i = 0; i < this.totalEnemies.length; i++){
        if(this.totalEnemies[i].type != "parasite" && this.totalEnemies[i].alive == true){ //Parasite will not collide with wall
        this.game.physics.arcade.collide(this.totalEnemies[i], this.blockedLayer);
        this.game.physics.arcade.overlap(bullets, this.totalEnemies[i], this.bulletCollision, null, this);
        this.game.physics.arcade.overlap(this.sniperBullets, this.totalEnemies[i], this.sniperBulletCollision, null, this);
        this.game.physics.arcade.overlap(this.scatterBullets, this.totalEnemies[i], this.scatterBulletCollision, null, this);
        this.game.physics.arcade.collide(this.totalEnemies[i], this.heart, this.enemyCollisionOrgan);
     
        //trapcollision
        this.game.physics.arcade.overlap(this.totalEnemies[i], traps[0], this.activateTrap, null, this);
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.blueWave, this.blueWaveCollision);
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.whip, this.whipCollision)
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.void, this.voidCollision)
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.mucusTrap, this.mucusTrapCollision, null, this);
        }

        if (this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].alive == true){//But will collide with heart and traps and bullets
        this.game.physics.arcade.collide(this.totalEnemies[i], this.heart, this.enemyCollisionOrgan);
        this.game.physics.arcade.overlap(bullets, this.totalEnemies[i], this.bulletCollision);
        this.game.physics.arcade.overlap(this.sniperBullets, this.totalEnemies[i], this.sniperBulletCollision, null, this);
        this.game.physics.arcade.overlap(this.scatterBullets, this.totalEnemies[i], this.scatterBulletCollision, null, this);
    
        //trapcollision
        this.game.physics.arcade.overlap(this.totalEnemies[i], traps[0], this.activateTrap, null, this);
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.blueWave, this.blueWaveCollision);
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.whip, this.whipCollision)
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.void, this.voidCollision)
        this.game.physics.arcade.overlap(this.totalEnemies[i], this.mucusTrap, this.mucusTrapCollision, null, this);

        }
    }

    //Summon a white blood cell ally
    if(this.F.isDown && skillPoints >= 1000 && this.player.alive == true && this.totalAllies[0].alive == false  && abilities["ally"]){
        console.log("summon ally");
        this.summonAlly();
        skillPoints -= 1000;
    }

    //player movement
    //this.currentAnimation stores a string representation of the current animation state
    //this.currentAnimation will be used to determine which idle position the player will take
    //if the player takes damage, player flash will take priority
    //if the player is attacking, attacking will take priority over moving
    
    this.player.body.velocity.set(0);

    if(this.W.isDown && this.player.alive == true) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y -= this.player.speed;
      if(invincible == false && attacking == false){
        this.player.animations.play('moveBack');
      }
      if(attacking == true && invincible == false){
        this.player.animations.play('attackBack');  
      }
      this.currentAnimation = "moveBack";
      
    }
    else if(this.S.isDown && this.player.alive == true) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y += this.player.speed;
      if(invincible == false && attacking == false){
      this.player.animations.play('moveForward');
      }
      if(attacking == true && invincible == false){
        this.player.animations.play('attackForward');  
      }
      this.currentAnimation = "moveForward";
    }
    else {
      this.player.body.velocity.y = 0;
     
    }
    if(this.A.isDown && this.player.alive == true) {
      this.player.body.velocity.x -= this.player.speed;
      if(invincible == false && attacking == false){
      this.player.animations.play('moveLeft');
      }
      if(attacking == true && invincible == false){
        this.player.animations.play('attackLeft');  
      }
      this.currentAnimation = "moveLeft";
    }
    else if(this.D.isDown && this.player.alive == true) {
      this.player.body.velocity.x += this.player.speed;
      if(invincible == false && attacking == false){
      this.player.animations.play('moveRight');
      }
      if(attacking == true && invincible == false){
        this.player.animations.play('attackRight');  
      }
      this.currentAnimation = "moveRight";
    }
    else{
        this.player.body.velocity.x = 0;
        
    }

    //this.player.body.gravity.x = 40000;



    //Player fire Bullets
    if (this.game.input.activePointer.isDown && this.player.alive == true && this.player.locked == false && this.player.sniperMode == false && this.player.scatterMode == false){
        this.fire();
        attacking = true;
    }

    else{
        attacking = false;
    }


//Pause game
this.ESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
if (this.ESC.downDuration(10)) {
    if (pause_menu_up) {
        pause_menu_up = false;
        pause_resume.destroy();
        pause_help.destroy();
        pause_controls.destroy();
        pause_mainmenu.destroy();
        pause_title.destroy();
        pause_menu.destroy();
        if (typeof pause_help_bg !== 'undefined') { pause_help_bg.destroy(); }
        if (typeof pause_help_text !== 'undefined') { pause_help_text.destroy(); }
        if (typeof pause_help_back !== 'undefined') { pause_help_back.destroy(); }
        if (typeof pause_controls_bg !== 'undefined') { pause_controls_bg.destroy(); }
        if (typeof pause_controls_text1 !== 'undefined') { pause_controls_text1.destroy(); }
        if (typeof pause_controls_text2 !== 'undefined') { pause_controls_text2.destroy(); }
        if (typeof pause_controls_back !== 'undefined'){ pause_controls_back.destroy(); }
        if (!game_paused) game.physics.arcade.isPaused = false;   
    }
    else {
        pause_menu_up = true;
        game.physics.arcade.isPaused = true;
        var resetfunc = this.resetState; 
        var mus1 = this.mainTheme;
        var mus2 = this.boss1theme;
        var mus3 = this.boss2theme;
        var stop = this.stopMusic;
        pause_menu = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 1440, 1440, 'pause_bg');
        pause_title = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2) - 400, 161, 46, 'pause_title');

        pause_mainmenu = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2) - 100, 'p_mainmenu', function() { resetfunc(); stop(mus1, mus2, mus3); game.state.start("MainMenu"); });
        pause_mainmenu.onInputOver.add(function() { pause_mainmenu.loadTexture("p_mainmenu2"); }, this);
        pause_mainmenu.onInputOut.add(function() { pause_mainmenu.loadTexture("p_mainmenu"); }, this);

        pause_controls = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 'p_controls', function() { 
            resetfunc(); 
            stop(mus1, mus2, mus3); 
            pause_resume.inputEnabled = false;
            pause_help.inputEnabled = false;
            pause_controls.inputEnabled = false;
            pause_mainmenu.inputEnabled = false;

            pause_controls_bg = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 1440, 1440,"controls_bg");
            pause_controls_bg.anchor.setTo(0.5, 0.5);
    
            pause_controls_text1 = game.add.tileSprite(game.camera.x + (game.width/2)-225, game.camera.y + (game.height/2)-300, 351, 217,"p_controls_text");
            pause_controls_text1.anchor.setTo(0.5, 0.5);
            pause_controls_text1.scale.x = 1.75;
            pause_controls_text1.scale.y = 1.75;

            pause_controls_text2 = game.add.tileSprite(game.camera.x + (game.width/2)+80, game.camera.y + (game.height/2)+175, 709, 298,"p_controls_text2");
            pause_controls_text2.anchor.setTo(0.5, 0.5);
            pause_controls_text2.scale.x = 1.75;
            pause_controls_text2.scale.y = 1.75;

            pause_controls_back = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2) + 500, "p_back", function() {
                pause_controls_bg.destroy(); 
                pause_controls_text1.destroy(); 
                pause_controls_text2.destroy();
                pause_controls_back.destroy();
                pause_resume.inputEnabled = true;
                pause_help.inputEnabled = true;
                pause_controls.inputEnabled = true;
                pause_mainmenu.inputEnabled = true;
            })
            pause_controls_back.onInputOver.add(function() { pause_controls_back.loadTexture("p_back2"); }, this);
            pause_controls_back.onInputOut.add(function() { pause_controls_back.loadTexture("p_back"); }, this);
            pause_controls_back.anchor.setTo(0.5, 0.5);
        })
        pause_controls.onInputOver.add(function() { pause_controls.loadTexture("p_controls2"); }, this);
        pause_controls.onInputOut.add(function() { pause_controls.loadTexture("p_controls"); }, this);

        pause_help = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2) + 100, 'p_help', function() {  
            resetfunc(); 
            stop(mus1, mus2, mus3); 

            pause_resume.inputEnabled = false;
            pause_help.inputEnabled = false;
            pause_controls.inputEnabled = false;
            pause_mainmenu.inputEnabled = false;

            pause_help_bg = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 1440, 1440,"help_bg");
            pause_help_bg.anchor.setTo(0.5, 0.5);
    
            pause_help_text = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 731, 248,"help_text");
            pause_help_text.anchor.setTo(0.5, 0.5);
            pause_help_text.scale.x = 1.75;
            pause_help_text.scale.y = 1.75;

            pause_help_back = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2) + 400, "p_back", function() {
                pause_help_bg.destroy(); 
                pause_help_text.destroy(); 
                pause_help_back.destroy();
                pause_resume.inputEnabled = true;
                pause_help.inputEnabled = true;
                pause_controls.inputEnabled = true;
                pause_mainmenu.inputEnabled = true;
            })
            pause_help_back.onInputOver.add(function() { pause_help_back.loadTexture("p_back2"); }, this);
            pause_help_back.onInputOut.add(function() { pause_help_back.loadTexture("p_back"); }, this);
            pause_help_back.anchor.setTo(0.5, 0.5);

        })
        pause_help.onInputOver.add(function() { pause_help.loadTexture("p_help2"); }, this);
        pause_help.onInputOut.add(function() { pause_help.loadTexture("p_help"); }, this);

        pause_resume = game.add.button(game.camera.x + (game.width/2), game.camera.y + (game.height/2) + 200, 'p_resume', function() {
            pause_resume.destroy();
            pause_help.destroy();
            pause_controls.destroy();
            pause_mainmenu.destroy();
            pause_title.destroy();
            pause_menu.destroy();
            game.physics.arcade.isPaused = false;   
        })
        pause_resume.onInputOver.add(function() { pause_resume.loadTexture("p_resume2"); }, this);
        pause_resume.onInputOut.add(function() { pause_resume.loadTexture("p_resume"); }, this);

        pause_menu.anchor.setTo(0.5, 0.5);
        pause_title.anchor.setTo(0.5, 0.5);
        pause_mainmenu.anchor.setTo(0.5, 0.5);
        pause_controls.anchor.setTo(0.5, 0.5);
        pause_help.anchor.setTo(0.5, 0.5);
        pause_resume.anchor.setTo(0.5, 0.5);
    }
}   

    //Choose Idle Animation
    if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0){
        this.chooseIdleAnimation();
    }

    //spawn a single trap on click
    //if((!activeTrap) && (this.game.input.activePointer.isDown)){
        //console.log("trap spawned");
        //this.spawnATrap(traps[0]);
        //activeTrap = true;
    //}

    //Performs AI where enemies follow player if player comes into enemy's view
    this.performAI();
    
    //Perform AI for allies
    this.performAllyAI();

    //Enemy fire bullets
    this.enemyFire();

    //Ally fire bullets
    this.allyFire();
    
    //Performs damage calculation when enemy touches player
    this.enemyTouchPlayer();

    //Performs damage calculation when enemy touches ally
    //this.enemyTouchAlly();

    //Respawns player accordingly if player is dead
    this.respawnPlayer();

    //Will automatically generate a new wave of enemies if the previous waves of enemies are defeated
    if (this.game.selectedLevel == "TutorialT") {
        this.tutorial();
    }
    else {
        this.NextWave();
    }
    
    //Check if the player is invincible
    this.checkInvincible();

    //Increment the tint counter and resets tint
    this.resetTint();

    //Resets the organ 
    this.resetOrganTint();

    //draw health
    this.drawHealth();

    //Generate new cancer spawns
    this.generateCancer();

    //Updates ally animation
    this.updateAllyAnimation();

    //check the bonus damage enemy
    if(bonusDamageEnemy != null){
        //if it's already been created, update it
        this.updateBonusDamageSprite();
    }
    else if(currentEnemy != null){
        //otherwise, create it if we've hit an enemy
        this.createUpBonusDamageSprite();
    }

    this.reapplySprite();
    
    if(this.I.isDown){
        this.killAllEnemies();
    }

    if(this.E.isDown && this.blueWave.alive == false && skillPoints >= 500 && this.player.alive == true && abilities["blue wave"]){
        this.activateBlueWave();
        skillPoints -= 500;
    }

    this.blueWaveFollow();

    if(this.R.isDown && this.whip.alive == false && skillPoints >= 300 && this.player.alive == true && abilities["whip"]){
        //this.player.tint = 0.1 * 0xffffff;
        //if(this.game.input.activePointer.isDown){
        this.activateWhip();
        skillPoints -= 300;
        //}
    }

    this.whipFollow();

    //if(this.R.isUp){
    //    this.player.tint = 0xffffff;
    //}

    if(this.T.isDown && this.void.alive == false && skillPoints >= 300 && this.player.alive == true && abilities["void"]){
        //this.player.tint = 0.1 * 0xffffff;
        //if(this.game.input.activePointer.isDown){
        this.activateVoid();
        skillPoints -= 300;
        //}
    }

    if(this.G.isDown && this.mucusTrap.alive == false && skillPoints >= 100 && this.player.alive == true && abilities["mucus trap"]){
        //this.player.tint = 0.1 * 0xffffff;
        //if(this.game.input.activePointer.isDown){
            this.placeMucusTrap();
            skillPoints -= 100;
        //    }
    }


    if(this.spaceBar.downDuration(10)){
        if(this.shootingMode % 3 == 0 && abilities["sniper"]){
            this.shootingMode++;
        }
        else if(this.shootingMode % 3 == 1){
            if(abilities["scatter"]){
                this.shootingMode++;
            }
            else{
                this.shootingMode--;
            }
        }
        else if(this.shootingMode % 3 == 2){
            this.shootingMode++;
        }
    }

    if(this.J.isDown){
        skillPoints += 9999;
    }

    if(this.K.isDown){//Unlocks All Abilities
        //this.unlockAbilities(0);
        //this.unlockAbilities(1);
        //this.unlockAbilities(2);
        //this.unlockAbilities(3);
        //this.unlockAbilities(4);
        this.unlockAbilities(5);
    }

    this.checkShootingMode();

    this.resetMucusCounter();

    this.parasiteTeethAttack();

    this.checkBossDefeatStatus();
    
    this.checkWind();

    this.checkPressure();

    this.checkLocked();

    this.virusHoleAttackHeart();

    this.shake();

    this.playBossTheme();

    this.updateScore();

    this.healthBarForce();

    this.exit();


  },




 















  //This will make a bullet disappear after colliding with a cancer cell. Will kill cancer cell settings its 
  //this.cancerSpawn.alive to false, and then its hp will deplete by the current damage multipler
  //After each bullet  (Note b here is the bullet object)
  bulletCollision: function(a, b){
     
    currentTarget = a;
    currentEnemy = a.type; //Make the current enemy the type of enemy the bullet shot
    bonusDamageEnemyTexture = a.texture;    //save the texture for later
    

    if (currentEnemy == previousEnemy && bonusMultiplier < 3){ //If current is the same as previous, also cap multiplier at 3
        bonusMultiplier += 0.1;
    }
    if (currentEnemy == previousEnemy && bonusMultiplier >= 3){
        bonusMultiplier = 3;
    }
    if (currentEnemy != previousEnemy){
        bonusMultiplier = 1;
    }

    a.HP -= damage* bonusMultiplier;
    skillPoints++;

    if (a.HP <= 0) {
        a.children[0].width = 0;
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }
    
    
    if(a.tinted == false){ //If the enemy is not currently tinted
        a.tint = 0.4 * 0xffffff;
        a.tinted = true;
    }

    
    previousEnemy = currentEnemy; //Make the previous enemy the current enemy 

    if (a.HP <= 0){
        a.tint = 0xffffff; //Resets the tint
        a.alive = false;
        a.play('dead',7, false, true);
        //a.kill();
        
    }
    b.kill();

    
  },

 

  sniperBulletCollision: function(a,b){
    currentTarget = a;
    currentEnemy = a.type; //Make the current enemy the type of enemy the bullet shot
    bonusDamageEnemyTexture = a.texture;    //save the texture for later
    this.sniperExplosion.reset(a.x, a.y);
    this.sniperExplosion.animations.play('resolving', 18, false, true);
    if(a.type != "bossCancer" && a.type != "bossParasite" && a.type!= "bossVirus"){
        a.HP -= 5000;
    }
    else if (a.type == "bossCancer" || a.type == "bossParasite" || a.type == "bossVirus"){ //Does not affect bosses
        a.HP -= 1;
    }
    a.HP -= damage* bonusMultiplier;
    skillPoints++;

    if (a.HP <= 0) {
        a.children[0].width = 0;
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }
    console.log(a.HP);
    if(a.tinted == false){ //If the enemy is not currently tinted
        a.tint = 0.4 * 0xffffff;
        a.tinted = true;
    }
    
    previousEnemy = currentEnemy; //Make the previous enemy the current enemy 

    if (a.HP <= 0){
       
        a.tint = 0xffffff; //Resets the tint
        a.alive = false;
        a.play('dead',7, false, true);
        
    }
    b.kill();
  },

  scatterBulletCollision: function(a, b){
     
    currentTarget = a;
    currentEnemy = a.type; //Make the current enemy the type of enemy the bullet shot
    bonusDamageEnemyTexture = a.texture;    //save the texture for later
    

    if (currentEnemy == previousEnemy && bonusMultiplier < 3){ //If current is the same as previous, also cap multiplier at 3
        bonusMultiplier += 0.1;
    }
    if (currentEnemy == previousEnemy && bonusMultiplier >= 2){
        bonusMultiplier = 2;
    }
    if (currentEnemy != previousEnemy){
        bonusMultiplier = 1;
    }

    a.HP -= 5* bonusMultiplier;

    a.HP -= damage* bonusMultiplier;

    skillPoints += 0.1; 

    if (a.HP <= 0) {
        a.children[0].width = 0;
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }
    
    if(a.tinted == false){ //If the enemy is not currently tinted
        a.tint = 0.4 * 0xffffff;
        a.tinted = true;
    }

    
    previousEnemy = currentEnemy; //Make the previous enemy the current enemy 

    if (a.HP <= 0){
        a.tint = 0xffffff; //Resets the tint
        a.alive = false;
        a.play('dead',7, false, true);
        //a.kill();
        
    }
    b.kill();

    
  },

  allyBulletCollisionEnemy: function(a,b){
    a.HP -= 50;
    a.HP -= damage* bonusMultiplier;
    skillPoints++;

    if (a.HP <= 0) {
        a.children[0].width = 0;
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }
    skillPoints++;
    if (a.tinted == false){
        a.tint = 0.4 * 0xffffff;
        a.tinted = true;
    }

    if (a.HP <= 0){
        a.tint = 0xffffff; //reset the tint
        a.alive = false;
        a.play('dead', 7, false, true);
    }

    b.kill();
  },

  //This method deals with the player dying. Increment number of deaths to increase respawn time
  bulletCollisionPlayer: function(a,b){
    if(a.alive == true){
      if(invincible == false){

        a.HP -= 50;
        
        a.animations.play('takeDamage');
        invincible = true; //Make the player invincible temporarily
      }

      
      if(a.HP <= 0){

          a.animations.play('dead');
          a.alive = false;
      }
      b.kill();
    }
    
  },

  teethCollisionPlayer: function(a, b){
    if(a.alive == true){
        if(invincible == false){
            a.HP -= 100;
            a.animations.play('takeDamage');
            invincible = true;
        }

        if(a.HP < 0){
            a.animations.play('dead');
            a.alive = false;
        }
        b.animations.play('exploding',15,false,true);
    }
  },

  teethCollisionHeart: function(b, a){
    a.HP -= 100; //We set the enemy damage as constant to the organ

    if(a.tinted == false){ //If the enemy is not currently tinted
      a.tint = 0.14 * 0xffffff;
      a.tinted = true;
      }

    if (a.HP <= 0){
      a.children[0].width = 0;
      a.kill()
      alert('game over - Organ was overtaken');
      
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }

    b.animations.play('exploding',15,false,true);
  },

  virusHoleCollisionPlayer: function(a,b){
    if(a.alive == true){
        if(invincible == false){
            a.HP -= 100;
            a.animations.play('takeDamage');
            invincible = true;
        }

        if(a.HP < 0){
            a.animations.play('dead');
            a.alive = false;
        }
        
    }
  },

  bulletCollisionAlly: function(a,b){
    
    if(a.alive == true){
    if(a.invincible == false  && a.dying == false){
    a.HP -= 50;
    a.animations.play('takeDamage');
    a.invincible = true;
    }

    if(a.HP <= 0 && a.dying == false){
        a.dying = true;
        a.animations.play('dead',7,false,true);
        a.speed = 0;
        a.children[0].width = 0;
    }
    else{
        a.children[0].width = 200*a.HP/a.maxHP;
    }

    b.kill();
    }

  },

  //This method deals with enemy dealing damage to the organ
  bulletCollisionOrgan: function(a,b){
      a.HP -= 50; //We set the enemy damage as constant to the organ

      if(a.tinted == false){ //If the enemy is not currently tinted
        a.tint = 0.14 * 0xffffff;
        a.tinted = true;
        }

      if (a.HP <= 0){

        a.kill()
        alert('game over - Organ was overtaken');
        a.children[0].width = 0;
      }
      else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }
      b.kill()

  },

  healCollision: function(a, b){
    if(a.HP < a.maxHP){
     a.HP += 50; //We set the enemy damage as constant to the organ
    }

      if(a.tinted == false){ //If the enemy is not currently tinted
        a.tint = 0.14 * 0xff00ff;
        a.tinted = true;
      }

      a.children[0].width = 200*a.HP/a.maxHP;
    
    b.kill()
    
  },

  virusHoleCollisionOrgan: function(a,b){
    a.HP -= 1; //We set the enemy damage as constant to the organ

    if(a.tinted == false){ //If the enemy is not currently tinted
      a.tint = 0.14 * 0xffffff;
      a.tinted = true;
      }

    if (a.HP <= 0){
      a.children[0].width = 0;
      a.kill()
      alert('game over - Organ was overtaken');
      
    }
    else {
        a.children[0].width = 200*a.HP/a.maxHP;
    }

},

  //This method deals with enemies colliding and dealing damage to the organ
  enemyCollisionOrgan: function(a, b){
    b.HP -= 1; //We will many enemies do less HP by touching organ
    

    if(b.tinted == false){ //If the enemy is not currently tinted
        b.tint = 0.14 * 0xffffff;
        b.tinted = true;
        }

    if (b.HP <= 0){
        b.kill()
        alert('game over - Organ was overtaken');
        b.children[0].width = 0;
    }
    else{
        b.children[0].width = 200*b.HP/b.maxHP;
    }
  },

  //This method will kill any bullets that hits the wall
  bulletCollisionLayer: function(a){
      a.kill()
  },

  teethCollisionLayer: function(a){
      a.animations.play('exploding', 25, false, true);
      this.game.camera.shake(0.002, 1000);
  },

  //Will fire and recycle bullets when used 
  fire: function(){

    if (this.game.time.now > this.nextFire && bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.fireRate;
        bullet = bullets.getFirstDead()
        bullet.anchor.setTo(0.5, 0.5);
        
        if (bullet){
        bullet.reset(this.player.x - 8, this.player.y - 8);
        bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 2000);
        }

    }

  },

  sniperFire: function(){

    if (this.game.time.now > this.sniperNextFire && this.sniperBullets.countDead() > 0) {
        this.sniperNextFire = this.game.time.now + this.sniperFireRate;
        bullet = this.sniperBullets.getFirstDead()
        bullet.anchor.setTo(0.5, 0.5);
        
        if (bullet){
        bullet.reset(this.player.x - 8, this.player.y - 8);
        bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 5000);
        }

    }
    

  },

  scatterFire: function(){
    if (this.game.time.now > this.scatterNextFire && this.scatterBullets.countDead() > 0) {
        this.scatterNextFire = this.game.time.now + this.scatterFireRate;
        bullet = this.scatterBullets.getFirstDead()
        bullet.anchor.setTo(0.5, 0.5);
        
        if (bullet){
        bullet.reset(this.player.x - 8, this.player.y - 8);
       // bullet.rotation = this.game.physics.arcade.moveToXY(bullet, 
        //TopDownGame.game.rnd.integerInRange((this.game.input.activePointer.x + 120), (this.game.input.activePointer.x - 120)),
        //TopDownGame.game.rnd.integerInRange((this.game.input.activePointer.y + 120), (this.game.input.activePointer.y - 120)), 2000);
        //}
        bullet.rotation = this.game.physics.arcade.moveToXY(bullet, TopDownGame.game.rnd.integerInRange((this.game.input.activePointer.x + this.game.camera.x + 180) ,
        (this.game.input.activePointer.x + this.game.camera.x - 180)),
         TopDownGame.game.rnd.integerInRange((this.game.input.activePointer.y + this.game.camera.y + 180), (this.game.input.activePointer.y + this.game.camera.y - 180)), 2000);
        }

    }
  },

  //Enemy will fire if it is alive and player is alive. This method can be used to change how bullets are fired
  //Bullets are linked to enemies by array index, as implemented in the following function
  //***THIS FUNCTION CAN CHANGE THE BEHAVIOR OF BULLETS FOR EACH TYPE OF ENEMIES ***/
  enemyFire: function(){
    for (var i = 0; i < this.totalEnemies.length; i++){
       // if(this.enemyBullets[i].user == this.totalEnemies[i].type){ //If the USER of the gun matches the TYPE of enemy, THEN fire
        if (this.ManhattanDistance(this.totalEnemies[i].world.x, this.totalEnemies[i].world.y, this.player) < 1700){
        
            if (this.game.time.now > this.enemyBullets[i].NextFire && this.enemyBullets[i].countDead() > 0 && this.totalEnemies[i].alive == true && this.player.alive == true) {
                this.enemyBullets[i].NextFire = this.game.time.now + this.enemyBullets[i].FireRate;
                bullet = this.enemyBullets[i].getFirstDead()
                bullet.anchor.setTo(0.5, 0.5);
        
                if (bullet && this.enemyBullets[i].user == "cancer"){
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, TopDownGame.game.rnd.integerInRange(0, 3200), TopDownGame.game.rnd.integerInRange(0, 3200), 500);
                }

                if(bullet && this.enemyBullets[i].user == "virus"){
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 300);
                    
                }

                if(bullet && this.enemyBullets[i].user == "dangerVirus"){
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, TopDownGame.game.rnd.integerInRange(this.player.x - 70, this.player.x + 70)
                    , TopDownGame.game.rnd.integerInRange(this.player.y - 70, this.player.y + 70), 1500);
                    
                }

                if(bullet && this.enemyBullets[i].user == "bacteria"){
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 450);
                }

                if(bullet && this.enemyBullets[i].user == "dangerBacteria"){
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 950);
                }


                //Some fun AI I implemented for boss
                else if (bullet && this.enemyBullets[i].user == "bossCancer"){//The second property will distinguish boss bullet.
                    bullet.reset(this.totalEnemies[i].x - 8, this.totalEnemies[i].y - 8);
                
                    if(this.totalEnemies[i].HP < 5000){ //If the boss's HP is low, activate this rage mode AI
                        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 950);
    
                    }
                else{
                    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, TopDownGame.game.rnd.integerInRange(0, 3200), TopDownGame.game.rnd.integerInRange(0, 3200), 500);
                }
                }

            }
        }
        
    //}
    }
    

  },

  //This will perform ally fires
  allyFire: function(target){
    for (var i = 0; i < this.totalAllies.length; i++){
        if (this.game.time.now > this.allyBullets[i].NextFire && this.allyBullets[i].countDead() > 0 
        && this.totalAllies[i].alive == true && this.player.alive == true) {
            this.allyBullets[i].NextFire = this.game.time.now + this.allyBullets[i].FireRate;
            bullet = this.allyBullets[i].getFirstDead()
            bullet.anchor.setTo(0.5, 0.5);
            

             if(bullet && this.allyBullets[i].user == "ally" && currentTarget && currentTarget.alive == true){
                bullet.reset(this.totalAllies[i].x - 8, this.totalAllies[i].y -8);
                bullet.rotation = this.game.physics.arcade.moveToObject(bullet, currentTarget, 2000);
             }
            
            
        }
    }
  },

  //Perform ally AI
  performAllyAI: function(){
      for(var i = 0; i < this.totalAllies.length; i++){
          if (this.totalAllies[i].alive == true && this.ManhattanDistance(this.totalAllies[i].world.x, this.totalAllies[i].world.y, this.player) >= 200){
              this.game.physics.arcade.moveToXY(this.totalAllies[i], this.player.x , this.player.y , this.totalAllies[i].speed);
              
          }
          else if (this.totalAllies[i].alive == true && this.ManhattanDistance(this.totalAllies[i].world.x, this.totalAllies[i].world.y, this.player) < 200){
              this.totalAllies[i].body.velocity.set(0,0);
          }
      }
  },


  //This function uses this.currentAnimation to determine the idle position
  //If the player stopped moving, then play the corresponding idle movements

  chooseIdleAnimation: function(){

    
        if (this.currentAnimation == "moveBack" && this.player.alive == true){
            this.currentAnimation = "idleBack";
            this.player.animations.play('idleBack');
        }
        else if (this.currentAnimation == "moveForward" && this.player.alive == true){
            this.currentAnimation = "idleForward";
            this.player.animations.play('idleForward')
        }
        else if (this.currentAnimation == "moveLeft" && this.player.alive == true){
          this.currentAnimation = "idleLeft";
          this.player.animations.play('idleLeft')
        }
        else if (this.currentAnimation == "moveRight" && this.player.alive == true){
          this.currentAnimation = "idleRight";
          this.player.animations.play('idleRight')
        }
    

  },

  //Checks whether or not the two sprites are overlapping 
  checkOverlap: function(spriteA, spriteB){
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();
      return Phaser.Rectangle.intersects(boundsA, boundsB);

  },

  //This function creates an enemy cancer cell
  EnemyCancerCell: function(){
    cancerSpawn = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'CancerCell');
    cancerSpawn.anchor.setTo(0.5, 0.5);
    cancerSpawn.animations.add('attacking', [0,1,2,3,4,5,6,7,8,9], 7, true);
    cancerSpawn.animations.add('dead', [10, 11, 12 ,13 ,14, 15], 7, false);
    cancerSpawn.animations.play('attacking');
    TopDownGame.game.physics.arcade.enable(cancerSpawn);
    cancerSpawn.maxHP = 500;
    cancerSpawn.HP = 500;
    cancerSpawn.type = "cancer";
    cancerSpawn.tinted = false; //Whether or not the enemy has been tinted
    cancerSpawn.tintCounter = 2; //Determines how long the enemy will be tinted
    cancerSpawn.speed = 550;
    var bmd = this.game.add.bitmapData(200,10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,180,30);
    bmd.ctx.fillStyle = '#00ff00';
    bmd.ctx.fill();
    var healthBar = this.game.add.sprite(-100, -100, bmd);
    cancerSpawn.addChild(healthBar)
    this.cancerCells.push(cancerSpawn);
    this.totalEnemies.push(cancerSpawn);
    this.setUpPathfinding(cancerSpawn); //add pathfinding
    cancerSpawn.kill()
    return cancerSpawn;
},

  EnemyBlueVirus: function(){
    blueVirus = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'BlueVirus');
    blueVirus.anchor.setTo(0.5, 0.5);
    blueVirus.animations.add('attacking', [2,3], 7, true);
    blueVirus.animations.add('dead', [4, 5, 6, 7, 8, 9], false);
    blueVirus.animations.play('attacking');
    blueVirus.game.physics.arcade.enable(blueVirus);
    blueVirus.maxHP = 2500;
    blueVirus.HP = 2500;
    blueVirus.type = "virus";
    blueVirus.subType = "normal";
    blueVirus.tinted = false; //Whether or not the enemy has been tinted
    blueVirus.tintCounter = 2; //Determines how long the enemy will be tinted
    blueVirus.speed = 150;
    var bmd = this.game.add.bitmapData(200,10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,180,30);
    bmd.ctx.fillStyle = '#00ff00';
    bmd.ctx.fill();
    var healthBar = this.game.add.sprite(-100, -100, bmd);
    blueVirus.addChild(healthBar)
    this.blueViruses.push(blueVirus);
    this.totalEnemies.push(blueVirus);
    this.setUpPathfinding(blueVirus); //add pathfinding
    blueVirus.kill()
    return blueVirus;
},

EnemyDangerVirus: function(){
    blueVirus = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'DangerVirus');
    blueVirus.anchor.setTo(0.5, 0.5);
    blueVirus.animations.add('attacking', [0,1,2,3], 10, true);
    blueVirus.animations.add('dead', [4, 5, 6, 7, 8, 9,10,11], false);
    blueVirus.animations.play('attacking');
    blueVirus.game.physics.arcade.enable(blueVirus);
    blueVirus.maxHP = 5000;
    blueVirus.HP = 5000;
    blueVirus.type = "virus";
    blueVirus.subType = "danger"
    blueVirus.tinted = false; //Whether or not the enemy has been tinted
    blueVirus.tintCounter = 2; //Determines how long the enemy will be tinted
    blueVirus.speed = 300;
    var bmd = this.game.add.bitmapData(200,10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,180,30);
    bmd.ctx.fillStyle = '#00ff00';
    bmd.ctx.fill();
    var healthBar = this.game.add.sprite(-100, -100, bmd);
    blueVirus.addChild(healthBar)
    this.blueViruses.push(blueVirus);
    this.totalEnemies.push(blueVirus);
    this.setUpPathfinding(blueVirus); //add pathfinding
    blueVirus.kill()
    return blueVirus;
},

    EnemyParasite: function(){
        parasite = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'Parasite');
        parasite.anchor.setTo(0.5, 0.5);
        parasite.animations.add('crawling', [0,1], 7, true);
        parasite.animations.add('attacking', [2,3], 7, true);
        parasite.animations.add('dead', [4, 5, 6, 7, 8, 9], false);
        parasite.animations.play('attacking');
        parasite.game.physics.arcade.enable(parasite);
        parasite.maxHP = 2500;
        parasite.HP = 2500;
        parasite.type = "parasite";
        parasite.subType = "slow";
        parasite.tinted = false; //Whether or not the enemy has been tinted
        parasite.tintCounter = 2; //Determines how long the enemy will be tinted
        parasite.speed = 50;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        parasite.addChild(healthBar)
        this.totalEnemies.push(parasite);
        this.parasites.push(parasite);
        this.setUpPathfinding(parasite); //add pathfinding
        parasite.kill();

        return parasite; 
    },

    EnemyFastParasite: function(){
        parasite = TopDownGame.game.add.sprite(1600, 256, 'FastParasite');
        parasite.anchor.setTo(0.5, 0.5);
        parasite.animations.add('attacking', [0,1,2,3], 13, true);
        parasite.animations.add('dead', [4, 5, 6, 7, 8, 9, 10, 11], false);
        parasite.animations.play('attacking');
        parasite.game.physics.arcade.enable(parasite);
        parasite.maxHP = 1500;
        parasite.HP = 1500;
        parasite.type = "parasite";
        parasite.subType = "fast";
        parasite.tinted = false; //Whether or not the enemy has been tinted
        parasite.tintCounter = 2; //Determines how long the enemy will be tinted
        parasite.speed = 550;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        parasite.addChild(healthBar)
        this.totalEnemies.push(parasite);
        this.parasites.push(parasite);
        this.setUpPathfinding(parasite); //add pathfinding
        parasite.kill();

        return parasite; 
    },

    EnemyDangerParasite: function(){
        parasite = TopDownGame.game.add.sprite(1600, 256, 'DangerParasite');
        parasite.anchor.setTo(0.5, 0.5);
        parasite.animations.add('attacking', [0,1,2,3,4,5], 10, true);
        parasite.animations.add('dead', [6,7,8,9,10,11,12,13,14], false);
        parasite.animations.play('attacking');
        parasite.game.physics.arcade.enable(parasite);
        parasite.maxHP = 5000;
        parasite.HP = 5000;
        parasite.type = "parasite";
        parasite.subType = "danger";
        parasite.tinted = false; //Whether or not the enemy has been tinted
        parasite.tintCounter = 2; //Determines how long the enemy will be tinted
        parasite.speed = 400;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        parasite.addChild(healthBar)
        this.totalEnemies.push(parasite);
        this.parasites.push(parasite);
        this.setUpPathfinding(parasite); //add pathfinding
        parasite.kill();

        return parasite; 
    },

    EnemyGreenBacteria: function(){
        greenBacteria = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'GreenBacteria');
        greenBacteria.anchor.setTo(0.5, 0.5);
        greenBacteria.animations.add('moving', [0,1], 7, true);
        greenBacteria.animations.add('walkSideways', [2,3], 7, true);
        greenBacteria.animations.add('walkBackwards', [4,5], 7, true);
        greenBacteria.animations.add('attacking', [6,7], 7, true);
        greenBacteria.animations.add('dead', [8, 9, 10, 11], 7, false);
        greenBacteria.animations.play('attacking');
        greenBacteria.game.physics.arcade.enable(greenBacteria);
        greenBacteria.maxHP = 500;
        greenBacteria.HP = 500;
        greenBacteria.type = "bacteria";
        greenBacteria.subType = "normal";
        greenBacteria.tinted = false; //Whether or not the enemy has been tinted
        greenBacteria.tintCounter = 2; //Determines how long the enemy will be tinted
        greenBacteria.speed = -350;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        greenBacteria.addChild(healthBar)
        this.totalEnemies.push(greenBacteria);
        this.bacterias.push(greenBacteria);
        this.setUpPathfinding(greenBacteria);
        greenBacteria.kill();
        
        return greenBacteria; 
    },
    EnemyDangerBacteria: function(){
        greenBacteria = TopDownGame.game.add.sprite(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600), 'DangerBacteria');
        greenBacteria.anchor.setTo(0.5, 0.5);
        greenBacteria.animations.add('attacking', [0,1], 7, true);
        greenBacteria.animations.add('dead', [2,3,4,5,6,7,8,9,10,11], 10, false);
        greenBacteria.animations.play('attacking');
        greenBacteria.game.physics.arcade.enable(greenBacteria);
        greenBacteria.maxHP = 3000;
        greenBacteria.HP = 3000;
        greenBacteria.type = "bacteria";
        greenBacteria.subType = "danger";
        greenBacteria.tinted = false; //Whether or not the enemy has been tinted
        greenBacteria.tintCounter = 2; //Determines how long the enemy will be tinted
        greenBacteria.speed = 350;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        greenBacteria.addChild(healthBar)
        this.totalEnemies.push(greenBacteria);
        this.bacterias.push(greenBacteria);
        this.setUpPathfinding(greenBacteria);
        greenBacteria.kill();
        
        return greenBacteria; 
    },


    //This function generates a super cancer cell as a stationary boss
    SuperCancerCell: function(){
        cancerSpawn = TopDownGame.game.add.sprite(1664, 356, 'SuperCancerCell');
        cancerSpawn.anchor.setTo(0.5, 0.5);
        cancerSpawn.animations.add('attacking', [0,1,2,3,4,5,6,7,8,9], 7, true);
        cancerSpawn.animations.add('dead', [10, 11, 12 ,13, 14, 15, 16], 10, false);
        cancerSpawn.animations.play('attacking');
        TopDownGame.game.physics.arcade.enable(cancerSpawn);
        cancerSpawn.body.immovable = true;
        cancerSpawn.maxHP = 100000;
        cancerSpawn.HP = 100000;
        cancerSpawn.type = "bossCancer"; //determines the type of enemy
        cancerSpawn.tinted = false; //Whether or not the enemy has been tinted
        cancerSpawn.tintCounter = 2; //Determines how long the enemy will be tinted
        cancerSpawn.speed = 0;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        cancerSpawn.addChild(healthBar)
        this.cancerCells.push(cancerSpawn);
        this.totalEnemies.push(cancerSpawn);
        this.BossBullets();
        cancerSpawn.kill();
        return cancerSpawn;
    },

    //This function generates a boss parasite
    BossParasite: function(){
        bossParasite = TopDownGame.game.add.sprite(1664, 356, 'BossParasite');
        bossParasite.anchor.setTo(0.5, 0.5);
        bossParasite.animations.add('attacking', [0,1,2,3], 13, true);
        bossParasite.animations.add('dead', [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], 10, false);
        bossParasite.animations.play('attacking');
        TopDownGame.game.physics.arcade.enable(bossParasite);
        bossParasite.body.immovable = true;
        bossParasite.maxHP = 850000;
        bossParasite.HP = 850000;
        //this.game.add.tween(cancerSpawn).to({y: 200}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        bossParasite.type = "bossParasite"; //determines the type of enemy
        bossParasite.tinted = false; //Whether or not the enemy has been tinted
        bossParasite.tintCounter = 2; //Determines how long the enemy will be tinted
        bossParasite.speed = 0;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        bossParasite.addChild(healthBar)
        this.parasites.push(bossParasite)
        this.totalEnemies.push(bossParasite);
        this.BacteriaBullets();
        bossParasite.kill();
        return bossParasite;
    },

    BossVirus: function(){
        bossVirus = TopDownGame.game.add.sprite(2764, 356, 'BossVirus');
        bossVirus.anchor.setTo(0.5, 0.5);
        bossVirus.animations.add('attacking', [0,1], 7, true);
        bossVirus.animations.add('dead', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 10, false);
        bossVirus.animations.play('attacking');
        TopDownGame.game.physics.arcade.enable(bossVirus);
        bossVirus.maxHP = 300000;
        bossVirus.HP = 300000;
        this.game.add.tween(bossVirus).to({x: 500}, 10000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        bossVirus.type = "bossVirus"; //determines the type of enemy
        bossVirus.tinted = false; //Whether or not the enemy has been tinted
        bossVirus.tintCounter = 2; //Determines how long the enemy will be tinted
        bossVirus.speed = 0;
        var bmd = this.game.add.bitmapData(200,10);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,180,30);
        bmd.ctx.fillStyle = '#00ff00';
        bmd.ctx.fill();
        var healthBar = this.game.add.sprite(-100, -100, bmd);
        bossVirus.addChild(healthBar)
        this.blueViruses.push(bossVirus)
        this.totalEnemies.push(bossVirus);
        this.VirusBullets();
        bossVirus.kill()
        return bossVirus;
    },

    //This function creates a group of bullets and assigns it to each enemy. They are linked to the enemy by array Index, so must be created in order.
    EnemyBullets: function(){
        cancerBullets = this.game.add.group();
        cancerBullets.enableBody = true;
        cancerBullets.physicalBodyType = Phaser.Physics.ARCADE;
        cancerBullets.createMultiple(50, 'CancerBullet');
        cancerBullets.setAll('checkWorldBounds', true);
        cancerBullets.setAll('outOfBoundsKill', true);
        cancerBullets.NextFire = 0;
        cancerBullets.FireRate = 650;
        cancerBullets.user = "cancer"; //This determines the wielder of the bullet, it's a spawn
        cancerBullets.damage = 50; //Deals 50 damage
        this.enemyBullets.push(cancerBullets);
        return cancerBullets;
    },

    //This is a faster bullet made for the boss
    BossBullets: function(){
        cancerBullets = this.game.add.group();
        cancerBullets.enableBody = true;
        cancerBullets.physicalBodyType = Phaser.Physics.ARCADE;
        cancerBullets.createMultiple(50, 'CancerBullet');
        cancerBullets.setAll('checkWorldBounds', true);
        cancerBullets.setAll('outOfBoundsKill', true);
        cancerBullets.NextFire = 0;
        cancerBullets.FireRate = 500;
        cancerBullets.user = "bossCancer"; //This determines the wielder of the bullet, it's a boss
        cancerBullets.damage = 50; //Deals 50 damage
        this.enemyBullets.push(cancerBullets);
        return cancerBullets;
    },

    //These define the bullets made for virus
    VirusBullets: function(){
        virusBullets = this.game.add.group();
        virusBullets.enableBody = true;
        virusBullets.physicalBodyType = Phaser.Physics.ARCADE;
        virusBullets.createMultiple(50, 'VirusBullet');
        virusBullets.setAll('checkWorldBounds', true);
        virusBullets.setAll('outOfBoundsKill', true);
        virusBullets.NextFire = 0;
        virusBullets.FireRate = 1350;
        virusBullets.user = "virus"; //This determines the wielder of the bullet
        virusBullets.damage = 50; //Deals 50 damage
        this.enemyBullets.push(virusBullets);
        return virusBullets;
    },

    DangerVirusBullets: function(){
        virusBullets = this.game.add.group();
        virusBullets.enableBody = true;
        virusBullets.physicalBodyType = Phaser.Physics.ARCADE;
        virusBullets.createMultiple(10, 'VirusBullet');
        virusBullets.setAll('checkWorldBounds', true);
        virusBullets.setAll('outOfBoundsKill', true);
        virusBullets.NextFire = 0;
        virusBullets.FireRate = 5;
        virusBullets.user = "dangerVirus"; //This determines the wielder of the bullet
        virusBullets.damage = 50; //Deals 50 damage
        this.enemyBullets.push(virusBullets);
        return virusBullets;
    },

    BacteriaBullets: function(){
        bacteriaBullets = this.game.add.group();
        bacteriaBullets.enableBody = true;
        bacteriaBullets.physicalBodyType = Phaser.Physics.ARCADE;
        bacteriaBullets.createMultiple(50, 'BacteriaBullet');
        bacteriaBullets.setAll('checkWorldBounds', true);
        bacteriaBullets.setAll('outOfBoundsKill', true);
        bacteriaBullets.NextFire = 0;
        bacteriaBullets.FireRate = 1350;
        bacteriaBullets.user = "bacteria"; //This determines the wielder of the bullet
        bacteriaBullets.damage = 150; //Deals 150 damage
        this.enemyBullets.push(bacteriaBullets);
        return bacteriaBullets;
    },

    GreenBacteriaBullets: function(){
        bacteriaBullets = this.game.add.group();
        bacteriaBullets.enableBody = true;
        bacteriaBullets.physicalBodyType = Phaser.Physics.ARCADE;
        bacteriaBullets.createMultiple(1, 'GreenBacteriaBullet');
        bacteriaBullets.setAll('checkWorldBounds', true);
        bacteriaBullets.setAll('outOfBoundsKill', true);
        bacteriaBullets.NextFire = 0;
        bacteriaBullets.FireRate = 1350;
        bacteriaBullets.user = "dangerBacteria"; //This determines the wielder of the bullet
        bacteriaBullets.damage = 150; //Deals 150 damage
        this.enemyBullets.push(bacteriaBullets);
        return bacteriaBullets;
    },

    //These will be used for enemies that has no bullets
    NoBullets: function(){
        noBullets = this.game.add.group();
        this.enemyBullets.push(noBullets);
        return noBullets;
    },

    generateCancer: function(){ //ALSO USE THE SAME FUNCTION TO GENERATE ALL STUFF FOR BOSSES
        var cancerlimit = 3;
        var viruslimit = 2;
        var parasitelimit = 3;

        var cancersummoned = 0;
        var virussummoned = 0;
        var parasitesummoned = 0;
        if(this.cancerBossGenerated == true){
            this.generateCancerSpawnCounter--;
        }
        if(this.generateCancerSpawnCounter == 0 && this.cancerBossDefeated == false){
            for(var i = 0; i < this.totalEnemies.length; i++){
                if(this.totalEnemies[i].type == 'cancer' && this.totalEnemies[i].alive == false && cancersummoned < cancerlimit){
                    if(TopDownGame.game.rnd.integerInRange(0,1) == 0){
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(1000, 2400), TopDownGame.game.rnd.integerInRange(256, 600));
                    }
                    else{
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(1000, 2400), TopDownGame.game.rnd.integerInRange(1800, 2500)); 
                    }
                    this.totalEnemies[i].speed = 550;
                    this.totalEnemies[i].HP = 500;
                    cancersummoned ++;
                }
            }
            
            cancersummoned = 0;
            this.generateCancerSpawnCounter = 1000; //generate and reset
        }

        if(this.parasiteBossGenerated == true){ //Parasite Boss will generate parasite
            this.generateParasiteCounter--;
        }
        if(this.generateParasiteCounter == 0 && this.parasiteBossDefeated == false){
            for(var i = 0; i < this.totalEnemies.length; i++){
                if(this.totalEnemies[i].type == 'parasite' && this.totalEnemies[i].subType == 'fast' && this.totalEnemies[i].alive == false && parasitesummoned < parasitelimit){
                    this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600))
                    this.totalEnemies[i].HP = 1500;
                    this.totalEnemies[i].speed = 750;
                    parasitesummoned++;
                }
            }
            parasitesummoned = 0
            this.generateParasiteCounter = 300;
        }

        if(this.virusBossGenerated == true){ //Parasite Boss will generate parasite
            this.generateVirusCounter--;
        }
        if(this.generateVirusCounter == 0 && this.virusBossDefeated == false ){
            for(var i = 0; i < this.totalEnemies.length; i++){
                if(this.totalEnemies[i].type == 'virus' && this.totalEnemies[i].subType == 'danger' && this.totalEnemies[i].alive == false && virussummoned < viruslimit){
                    this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                    this.totalEnemies[i].HP = 1500;
                    this.totalEnemies[i].speed = 150;
                    virussummoned ++;
                }
            }
            virussummoned = 0;
            this.generateVirusCounter = 1000;
        }



    },

    //This method calculates the distasnce between player and enemy
    ManhattanDistance: function(x, y, player){
        var endX = player.world.x;
        var endY = player.world.y;
        var distance = Math.abs(endX - x) + Math.abs(endY - y);
        return distance;
    },

    //This method will spawn the next wave
    NextWave: function(){

        var counter = 0;
        for(var i = 0; i < this.totalEnemies.length; i++) {
            if (this.totalEnemies[i].alive == false){
                counter++;
            }
            this.enemiesDead = counter;
        }

        this.enemiesLeft = this.totalEnemies.length - this.enemiesDead;

        if (this.enemiesLeft == 0) {

            if (this.currentWave == 0 && this.waveCounter == 300) {
                this.waveCounter--;
                skill_menu_open = true;
                game_paused = true;
                this.game.physics.arcade.isPaused = true;
            
                if (this.game.selectedLevel == "Level1") {
                    this.lockAllAbilities();
                    this.unlockAbilities(1); //bobross
                    new_skill_menu_bg = this.game.add.tileSprite(860, 1136, 1440, 1440, 'pause_bg');
                    new_skill_title =   this.game.add.tileSprite(1580, 1350, 612, 69, 'new_skill_title');
                    new_skill_title.anchor.setTo(0.5, 0.5);
                    new_sprite = this.game.add.sprite(1580, 1600, 'WhiteBloodCell');
                    new_sprite.tint = 0.2 * 0xffffff;
                    new_sprite.animations.add('idleForward', [77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94], 7, true);
                    new_sprite.play("idleForward", 18, -1);
                    new_sprite.anchor.setTo(0.5, 0.5);
                    blue_wave_text = this.game.add.tileSprite(1580, 1800, 466, 61, 'ally_text');
                    blue_wave_text.anchor.setTo(0.5, 0.5);
                    sp_text = this.game.add.tileSprite(1580, 1950, 126, 42, '1000sp');
                    sp_text.anchor.setTo(0.5, 0.5);
                    p_key_text = this.game.add.tileSprite(1580, 2000, 282, 45, 'f_act');
                    p_key_text.anchor.setTo(0.5, 0.5);
                    p_skill_text = this.game.add.tileSprite(1580, 2100, 639, 65, 'ally_h');
                    p_skill_text.anchor.setTo(0.5, 0.5);
                    ok_button = this.game.add.button(1580, 2400, 'ok1', function() {
                        this.game.physics.arcade.isPaused = false;
                        new_skill_menu_bg.destroy();
                        new_skill_title.destroy();
                        new_sprite.destroy();
                        sp_text.destroy();
                        p_key_text.destroy();
                        p_skill_text.destroy();
                        blue_wave_text.destroy();
                        ok_button.destroy();
                        skill_menu_open = false;
                        game_paused = false;
                    });
                    ok_button.onInputOver.add(function() { ok_button.loadTexture("ok2"); }, this);
                    ok_button.onInputOut.add(function() { ok_button.loadTexture("ok1"); }, this);
                    ok_button.anchor.setTo(0.5, 0.5);
                }
                else if (this.game.selectedLevel == "Level2") {
                    this.lockAllAbilities();
                    this.unlockAbilities(2); //bobross
                    new_skill_menu_bg = this.game.add.tileSprite(860, 1136, 1440, 1440, 'pause_bg');
                    new_skill_title =   this.game.add.tileSprite(1580, 1350, 612, 69, 'new_skill_title');
                    new_skill_title.anchor.setTo(0.5, 0.5);
                    new_sprite = this.game.add.sprite(1580, 1650, "Whip");
                    new_sprite.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 40, true);
                    new_sprite.play('resolving', 19, -1);
                    new_sprite.anchor.setTo(0.5, 0.5);
                    sp_text = this.game.add.tileSprite(1580, 2100, 110, 41, '300sp');
                    sp_text.anchor.setTo(0.5, 0.5);
                    p_key_text = this.game.add.tileSprite(1580, 2150, 400, 39, 'r_act');
                    p_key_text.anchor.setTo(0.5, 0.5);
                    p_skill_text = this.game.add.tileSprite(1580, 2250, 512, 45, 'whip_h');
                    p_skill_text.anchor.setTo(0.5, 0.5);
                    blue_wave_text = this.game.add.tileSprite(1580, 2000, 141, 75, 'whip');
                    blue_wave_text.anchor.setTo(0.5, 0.5);
                    ok_button = this.game.add.button(1580, 2400, 'ok1', function() {
                        this.game.physics.arcade.isPaused = false;
                        new_skill_menu_bg.destroy();
                        new_skill_title.destroy();
                        new_sprite.destroy();
                        sp_text.destroy();
                        p_key_text.destroy();
                        p_skill_text.destroy();
                        blue_wave_text.destroy();
                        ok_button.destroy();
                        skill_menu_open = false;
                        game_paused = false;
                    });
                    ok_button.onInputOver.add(function() { ok_button.loadTexture("ok2"); }, this);
                    ok_button.onInputOut.add(function() { ok_button.loadTexture("ok1"); }, this);
                    ok_button.anchor.setTo(0.5, 0.5);
                }
                else if (this.game.selectedLevel == "Level3") {
                    this.lockAllAbilities();
                    this.unlockAbilities(3); //bobross
                    new_skill_menu_bg = this.game.add.tileSprite(860, 1136, 1440, 1440, 'pause_bg');
                    new_skill_title =   this.game.add.tileSprite(1580, 1350, 612, 69, 'new_skill_title');
                    new_skill_title.anchor.setTo(0.5, 0.5);
                    new_sprite = this.game.add.sprite(1580, 1675, 'BlueWave');
                    new_sprite.anchor.setTo(0.5, 0.5);
                    new_sprite.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9,10,11], 13, true);
                    new_sprite.play("resolving", 11, -1);
                    blue_wave_text = this.game.add.tileSprite(1580, 1950, 296, 61, 'blue_wave_text');
                    blue_wave_text.anchor.setTo(0.5, 0.5);
                    sp_text = this.game.add.tileSprite(1580, 2100, 110, 41, '500sp');
                    sp_text.anchor.setTo(0.5, 0.5);
                    p_key_text = this.game.add.tileSprite(1580, 2150, 283, 50, 'e_act');
                    p_key_text.anchor.setTo(0.5, 0.5);
                    p_skill_text = this.game.add.tileSprite(1580, 2250, 712, 49, 'wave_h');
                    p_skill_text.anchor.setTo(0.5, 0.5);
                    ok_button = this.game.add.button(1580, 2400, 'ok1', function() {
                        this.game.physics.arcade.isPaused = false;
                        new_skill_menu_bg.destroy();
                        new_skill_title.destroy();
                        new_sprite.destroy();
                        sp_text.destroy();
                        p_key_text.destroy();
                        p_skill_text.destroy();
                        blue_wave_text.destroy();
                        ok_button.destroy();
                        skill_menu_open = false;
                        game_paused = false;
                    });
                    ok_button.onInputOver.add(function() { ok_button.loadTexture("ok2"); }, this);
                    ok_button.onInputOut.add(function() { ok_button.loadTexture("ok1"); }, this);
                    ok_button.anchor.setTo(0.5, 0.5);
                }
                else if (this.game.selectedLevel == "Level4") {
                    this.lockAllAbilities();
                    this.unlockAbilities(4); //bobross
                    new_skill_menu_bg = this.game.add.tileSprite(860, 1136, 1440, 1440, 'pause_bg');
                    new_skill_title =   this.game.add.tileSprite(1580, 1350, 558, 68, 'new_attack_mode');
                    new_skill_title.anchor.setTo(0.5, 0.5);
                    a1 = this.game.add.tileSprite( 1480, 1700, 64, 64, 'AntibodyBullet')
                    a2 = this.game.add.tileSprite( 1580, 1600, 64, 64, 'AntibodyBullet')
                    a3 = this.game.add.tileSprite( 1680, 1700, 64, 64, 'AntibodyBullet')
                    a1.anchor.setTo(0.5, 0.5);
                    a2.anchor.setTo(0.5, 0.5);
                    a3.anchor.setTo(0.5, 0.5);
                    a1.angle -= 135;
                    a2.angle -= 90;
                    a3.angle -= 45;
                    blue_wave_text = this.game.add.tileSprite(1580, 1900, 369, 70, 'scattershot');
                    blue_wave_text.anchor.setTo(0.5, 0.5);
                    p_skill_text = this.game.add.tileSprite(1580, 2100, 523, 50, 'shot_h');
                    p_skill_text.anchor.setTo(0.5, 0.5);
                    ok_button = this.game.add.button(1580, 2400, 'ok1', function() {
                        this.game.physics.arcade.isPaused = false;
                        new_skill_menu_bg.destroy();
                        new_skill_title.destroy();
                        p_skill_text.destroy();
                        blue_wave_text.destroy();
                        a1.destroy();
                        a2.destroy();
                        a3.destroy();
                        ok_button.destroy();
                        skill_menu_open = false;
                        game_paused = false;
                    });
                    ok_button.onInputOver.add(function() { ok_button.loadTexture("ok2"); }, this);
                    ok_button.onInputOut.add(function() { ok_button.loadTexture("ok1"); }, this);
                    ok_button.anchor.setTo(0.5, 0.5);
                }
                else if (this.game.selectedLevel == "Level5") {
                    this.lockAllAbilities();
                    this.unlockAbilities(5); //bobross
                    new_skill_menu_bg = this.game.add.tileSprite(860, 1136, 1440, 1440, 'pause_bg');
                    new_skill_title =   this.game.add.tileSprite(1580, 1350, 612, 69, 'new_skill_title');
                    new_skill_title.anchor.setTo(0.5, 0.5);
                    new_sprite = this.game.add.sprite(1580, 1800, 'Void');
                    new_sprite.anchor.setTo(0.5, 0.5);
                    new_sprite.animations.add('resolving', [0,1,2,3,4,5,6,7,8,9], 13, true);
                    new_sprite.play('resolving', 10, -1);
                    blue_wave_text = this.game.add.tileSprite(1580, 2150, 187, 61, 'lasers');
                    blue_wave_text.anchor.setTo(0.5, 0.5);
                    sp_text = this.game.add.tileSprite(1580, 2250, 110, 41, '300sp');
                    sp_text.anchor.setTo(0.5, 0.5);
                    p_key_text = this.game.add.tileSprite(1580, 2300, 398, 39, 't_act');
                    p_key_text.anchor.setTo(0.5, 0.5);
                    p_skill_text = this.game.add.tileSprite(1580, 2400, 363, 47, 'lasers_h');
                    p_skill_text.anchor.setTo(0.5, 0.5);
                    ok_button = this.game.add.button(1580, 2500, 'ok1', function() {
                        this.game.physics.arcade.isPaused = false;
                        new_skill_menu_bg.destroy();
                        new_skill_title.destroy();
                        new_sprite.destroy();
                        sp_text.destroy();
                        p_key_text.destroy();
                        p_skill_text.destroy();
                        blue_wave_text.destroy();
                        ok_button.destroy();
                        skill_menu_open = false;
                        game_paused = false;
                    });
                    ok_button.onInputOver.add(function() { ok_button.loadTexture("ok2"); }, this);
                    ok_button.onInputOut.add(function() { ok_button.loadTexture("ok1"); }, this);
                    ok_button.anchor.setTo(0.5, 0.5);
                }
            }

            if (!game_paused && !pause_menu_up) 
                this.waveCounter--; 
            
                if (this.waveCounter == 0) {

                this.currentWave++;
                skillPoints += 100;

                if(this.game.selectedLevel == "Level1" ||
                this.game.selectedLevel == "Level2" ||
                this.game.selectedLevel == "Level3" ||
                this.game.selectedLevel == "Level4"){
                    if (this.player.HP <= 400){
                        this.player.HP += 100; //adds 100 HP 
                    }
                }

                if(this.game.selectedLevel == "Level1") {
                    if(this.currentWave == 1) this.generateWave(1,1,1,0,0,0,0,0);
                    else if(this.currentWave == 2) this.generateWave(0,2,2,0,0,0,0,0); 
                    else if(this.currentWave == 3) this.generateWave(2,2,2,0,0,0,0,0);
                    else if(this.currentWave == 4) this.generateWave(2,2,2,2,0,0,0,0);
                    else if(this.currentWave == 5) this.generateWave(3,2,4,0,0,0,0,0);
                    else if(this.currentWave == 6) this.generateWave(2,4,2,2,0,0,0,0);
                    else if(this.currentWave == 7) this.generateWave(0,0,4,0,5,0,0,0);
                    else if(this.currentWave == 8) this.generateWave(1,1,2,0,2,0,0,0);
                    else if(this.currentWave == 9) this.generateWave(1,1,2,0,2,1,0,0);
                    else if(this.currentWave == 10) this.generateWave(0,0,2,0,2,2,1,0);
                    else if(this.currentWave == 11) this.generateWave(1,1,2,2,2,1,1,0);
                    else {
                        this.game.selectedLevel = "Level2";
                        this.currentWave = 0;
                        this.blockedLayer.destroy();
                        this.blockedLayer = this.map.createLayer(this.game.selectedLevel);
                        this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel); 
                        this.player.x = 1580;
                        this.player.y = 1856;
                        this.setPathfindingMap(this.game.selectedLevel);
                        this.resetUI();
                    }
                }

                else if(this.game.selectedLevel == "Level2") {
                    if(this.currentWave == 1) this.generateWave(1,1,1,0,0,0,0,0);
                    else if(this.currentWave == 2) this.generateWave(2,2,2,0,2,1,0,0);
                    else if(this.currentWave == 3) this.generateWave(0,0,0,0,4,2,1,0);
                    else if(this.currentWave == 4) this.generateWave(0,2,2,2,1,1,1,1);
                    else if(this.currentWave == 5) this.generateWave(0,4,2,0,4,2,1,0);
                    else if(this.currentWave == 6) this.generateWave(2,3,1,1,2,2,1,0);
                    else if(this.currentWave == 7) this.generateWave(0,0,2,0,2,2,1,2);
                    else if(this.currentWave == 8) this.generateWave(0,2,2,0,2,0,1,2);
                    else if(this.currentWave == 9) this.generateWave(0,1,2,0,1,2,1,2);
                    else if(this.currentWave == 10) this.generateWave(0,4,0,0,0,0,4,0);
                    else if(this.currentWave == 11) {
                        this.generateWave(0,0,0,0,0,0,0,0);
                        if(this.cancerBossGenerated == false) {
                            this.resetCancerBoss();
                            this.cancerBossGenerated = true;
                        }
                    }
                    else {
                        this.game.selectedLevel = "Level3";
                        this.currentWave = 0;
                        this.blockedLayer.destroy();
                        this.blockedLayer = this.map.createLayer(this.game.selectedLevel);
                        this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel); 
                        this.player.x = 1580;
                        this.player.y = 1856;
                        this.setPathfindingMap(this.game.selectedLevel);
                        this.resetUI();
                    }
                }

                else if(this.game.selectedLevel == "Level3") {
                    if(this.currentWave == 1) this.generateWave(1,1,0,0,1,1,0,1);
                    else if(this.currentWave == 2) this.generateWave(1,0,0,0,1,0,0,1);
                    else if(this.currentWave == 3) this.generateWave(1,0,0,0,1,0,1,1);
                    else if(this.currentWave == 4) this.generateWave(1,0,0,0,1,1,1,1);
                    else if(this.currentWave == 5) this.generateWave(1,0,0,0,1,0,1,1);
                    else if(this.currentWave == 6) this.generateWave(1,0,0,0,2,0,1,1);
                    else if(this.currentWave == 7) this.generateWave(1,0,0,0,2,2,1,1);
                    else if(this.currentWave == 8) this.generateWave(2,0,2,0,2,0,1,1);
                    else if(this.currentWave == 9) this.generateWave(2,0,2,0,2,2,1,2);
                    else if(this.currentWave == 10) this.generateWave(2,0,0,0,0,0,6,0);
                    else if(this.currentWave == 11) {
                        this.generateWave(0,0,0,0,0,0,0,0);
                        if(this.virusBossGenerated == false) {
                            this.resetVirusBoss();
                            this.virusBossGenerated = true;
                        }
                    }
                    else {
                        this.game.selectedLevel = "Level4";
                        this.currentWave = 0;
                        this.blockedLayer.destroy();
                        this.blockedLayer = this.map.createLayer(this.game.selectedLevel);
                        this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel); 
                        this.player.x = 1580;
                        this.player.y = 1856;
                        this.setPathfindingMap(this.game.selectedLevel);
                        this.resetUI();
                    }
                }

                else if(this.game.selectedLevel == "Level4") {
                    if(this.currentWave == 1) this.generateWave(1,0,0,0,0,0,0,0);
                    else if(this.currentWave == 2) this.generateWave(0,2,0,0,0,0,0,0);
                    else if(this.currentWave == 3) this.generateWave(0,0,3,0,0,0,0,0);
                    else if(this.currentWave == 4) this.generateWave(0,0,0,0,0,0,6,1);
                    else if(this.currentWave == 5) this.generateWave(0,1,4,0,2,2,0,1);
                    else if(this.currentWave == 6) this.generateWave(0,0,2,0,3,0,0,1);
                    else if(this.currentWave == 7) this.generateWave(0,1,2,0,4,0,0,1);
                    else if(this.currentWave == 8) this.generateWave(0,0,4,0,4,1,0,1);
                    else if(this.currentWave == 9) this.generateWave(0,1,2,0,4,2,0,1);
                    else if(this.currentWave == 10) this.generateWave(0,0,4,0,4,3,0,0);
                    else if(this.currentWave == 11) {
                        this.generateWave(0,0,0,0,0,0,0,0);
                        if(this.parasiteBossGenerated == false){
                            this.resetParasiteBoss();
                            this.parasiteBossGenerated = true;
                        }
                    }
                    else {
                        this.game.selectedLevel = "Level5";
                        this.currentWave = 0;
                        this.blockedLayer.destroy();
                        this.blockedLayer = this.map.createLayer(this.game.selectedLevel);
                        this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel); 
                        this.player.x = 1580;
                        this.player.y = 1856;
                        this.setPathfindingMap(this.game.selectedLevel);
                        this.resetUI();
                    }
                }

                else if(this.game.selectedLevel == "Level5") {
                    if(this.currentWave == 1) {
                        skillPoints += 1000;
                        this.generateWave(0,0,0,0,0,0,0,0);
                        this.cancerBossGenerated = false;
                        if(this.cancerBossGenerated == false) {
                            for (var i = 0; i < this.totalEnemies.length; i++){
                                if (this.totalEnemies[i].type == "bossCancer"){
                                    this.totalEnemies[i].reset(1550, 950);
                                }
                            }
                            this.cancerBossGenerated = true;
                        }
                    }
                    else if (this.currentWave == 2) {
                        this.generateWave(0,0,0,0,0,0,0,0);
                        this.virusBossGenerated = false;
                        if(this.virusBossGenerated == false) {
                            for (var i = 0; i < this.totalEnemies.length; i++){
                                if (this.totalEnemies[i].type == "bossVirus"){
                                    this.totalEnemies[i].reset(1550, 950);
                                }
                            }
                            this.virusBossGenerated = true;
                        }
                    }
                    else if (this.currentWave == 3) {
                        this.generateWave(0,0,0,0,0,0,0,0);
                        this.parasiteBossGenerated = false;
                        if(this.parasiteBossGenerated == false){
                                                        for (var i = 0; i < this.totalEnemies.length; i++){
                                if (this.totalEnemies[i].type == "bossParasite"){
                                    this.totalEnemies[i].reset(1550, 950);
                                }
                            }
                            this.parasiteBossGenerated = true;
                        }
                    }
                    else {
                        this.win_game_text = this.game.add.text(960, 450, "YOU WIN!", { font: "100px Arial", fill: "#ffffff", align: "center"})
                        this.win_game_text.anchor.setTo(0.5, 0.5);
                        this.win_game_text.fixedToCamera = true;
                    }
                }
                this.waveCounter = 300;
            }
        }

        if (this.heart.alive == false){
            alert('You lose - organ was overtaken');
            this.leave = true;
        }
    },

    //This function will create the enemies for wave 1
    generateFirstWave: function(){
        for (var i = 0; i < 11; i++){ //Creating 2 viruses
            this.EnemyBlueVirus();
            this.VirusBullets();
            this.EnemyDangerVirus();
            this.DangerVirusBullets();
        }

        for (var i = 0; i < 11; i++){ //Creating 2 cancer
        this.EnemyCancerCell();
        this.EnemyBullets();
        }

        //Create 3 parasites
        //Note that using the bullet mapping, we assign noBullet to parasite
        for (var i = 0; i < 11; i++){
        this.EnemyParasite();
        this.NoBullets();
        }
       
        for (var i = 0; i < 11; i++){
        this.EnemyGreenBacteria();
        this.BacteriaBullets();
        this.EnemyDangerBacteria();
        this.GreenBacteriaBullets();
        }

        for (var i = 0; i < 11; i++){
            this.EnemyFastParasite();
            this.NoBullets();
            this.EnemyDangerParasite();
            this.NoBullets();
        }

        this.SuperCancerCell();
        this.BossVirus();
        this.BossParasite();

    },

    //This function checks whether or not the player is invincible and then activates a timer for invincibility
    checkInvincible: function(){
        if(invincible == true && this.blueWave.alive == false){ //If the player is currently invincible and bluewave is not active
            invincibilityCounter --;
            if(invincibilityCounter < 0){
                invincibilityCounter = 60;
                invincible = false;
            }
        }
    },

    //This function takes care of enemy AI
    performAI: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){

            if(this.player.alive == true && this.totalEnemies[i].alive == true){
                this.totalEnemies[i].body.velocity.set(0);

                if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "slow"){//AI for Parasite, go torwards heart
                    this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                }

                if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "fast"){//AI for Parasite, go torwards heart
                    this.totalEnemies[i].rotation = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                }

                if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "danger"){//AI for Parasite, go torwards player
                    if (this.ManhattanDistance(this.totalEnemies[i].world.x, this.totalEnemies[i].world.y, this.heart) < 1000){
                        this.totalEnemies[i].rotation = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }
                    else{
                    this.totalEnemies[i].rotation = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.player.x, this.player.y, this.totalEnemies[i].speed);
                    }
                }

                //Performing boss's gravity manipulation AI
                if(this.totalEnemies[i].type == "bossParasite"){
                    if (this.totalEnemies[i].HP < 500000 && this.totalEnemies[i].HP >= 400000 ){
                        this.player.body.gravity.y = 30000;
                        this.windActivated = true;
                       
                    }
                    if (this.totalEnemies[i].HP < 400000 && this.totalEnemies[i].HP >= 250000){
                        this.player.body.gravity.y = 0;
                        this.player.body.gravity.x = 30000;
                       
                    }
                    if (this.totalEnemies[i].HP < 250000 && this.totalEnemies[i].HP >= 100000){
                        this.player.body.gravity.x = -30000;
                      
                    }
                    if (this.totalEnemies[i].HP < 100000 && this.totalEnemies[i].HP >= 1000){
                        this.player.body.gravity.x = 0;
                        this.player.body.gravity.y = -30000;
                        
                    }
                    if (this.totalEnemies[i].HP <= 500){
                        this.player.body.gravity.y = 0;
                        this.windActivated = false;
                    }
                    

                }

                if(this.totalEnemies[i].type == 'bossVirus'){

                    if(this.totalEnemies[i].HP < 200000 && this.totalEnemies[i].HP >= 80000 && this.player.alive == true){
                        this.virusHoleAttack();
                    }

                    if(this.totalEnemies[i].HP < 80000 && this.player.alive == true){
                        this.virusHoleAttack2();
                    }

                    if(this.totalEnemies[i].HP < 35000 && this.player.alive == true){
                        this.player.body.gravity.x = 0;
                        this.player.body.gravity.y = -30000;
                        this.windActivated = true;
                    }

                    if(this.totalEnemies[i].HP < 1000){
                        this.player.body.gravity.y = 0;
                        this.windActivated = false;
                    }

                    
                }

                if(this.totalEnemies[i].type == "bossCancer"){
                    if(this.totalEnemies[i].HP < 80000 ){
                        this.player.locked = true;
                        this.player.lockedTimer--;
                    }


                    if(this.totalEnemies[i].HP < 500 || this.player.lockedTimer <= 0){
                        this.player.locked = false;
                    }
                }

                if (this.ManhattanDistance(this.totalEnemies[i].world.x, this.totalEnemies[i].world.y, this.player) < 2500){
                    if (this.totalEnemies[i].type == "virus" && this.totalEnemies[i].subType == "normal"){ //This makes sure that only spawns can move
                        this.totalEnemies[i].rotation  = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.player.x, this.player.y, this.totalEnemies[i].speed);
                    }
                    if (this.totalEnemies[i].type == "virus" && this.totalEnemies[i].subType == "danger"){ //This makes sure that only spawns can move
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.player.x, this.player.y, this.totalEnemies[i].speed);
                    }

                    if(this.totalEnemies[i].type == "cancer"){  //moves cancer cells
                        //this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.player.x, this.player.y, this.totalEnemies[i].speed);
                        if(Phaser.Point.equals(this.player.position, this.player.previousPosition)){
                            console.log("updating cancer")
                            this.updatePath(this.totalEnemies[i]);
                        }
                        else{
                            console.log("moving cancer");
                            this.move_sprite(this.totalEnemies[i], this.player.position);
                        }

                    }

                    if(this.totalEnemies[i].type == "bacteria" && this.totalEnemies[i].subType == "normal"){    //moves bacteria cells
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.player.x, this.player.y, this.totalEnemies[i].speed);
                    }

                }
            }
            else if(this.player.alive == false){
                    if (this.totalEnemies[i].type == "virus" && this.totalEnemies[i].subType == "normal"){//Same as above comment
                        this.totalEnemies[i].rotation  = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }

                    if (this.totalEnemies[i].type == "virus" && this.totalEnemies[i].subType == "danger"){//Same as above comment
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }

                    if (this.totalEnemies[i].type == "cancer"){//Same as above comment
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                        
                    }

                    if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "slow"){//AI for Parasite
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }

                    if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "fast"){//AI for Parasite
                        this.totalEnemies[i].rotation = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }

                    if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "danger"){//AI for Parasite
                        this.totalEnemies[i].rotation = this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, this.totalEnemies[i].speed);
                    }

                    if(this.totalEnemies[i].type == "bacteria"){//Bacteria will move to the heart at an incredible speed
                        this.game.physics.arcade.moveToXY(this.totalEnemies[i], this.heart.x, this.heart.y, 900);
                    }

            }

            else if (this.totalEnemies[i].alive == false){
                this.totalEnemies[i].body.velocity.set(0,0);
            }
           
        }   
    },

    //Check if player is overlapping with cancer Cell, AND cancer cell is alive, player takes damage
    enemyTouchPlayer: function(){
        
        if(this.player.alive == true){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if (this.checkOverlap(this.player, this.totalEnemies[i]) && this.totalEnemies[i].alive == true && this.player.alive == true){
                if(invincible == false && this.totalEnemies[i].type == "bacteria"){
                    this.player.HP -= 100;
                    this.player.animations.play('takeDamage');
                    invincible = true;
                }

                 if (invincible == false && this.totalEnemies[i].type != "bacteria"){
                    this.player.HP -= 50;
                    this.player.animations.play('takeDamage');
                    invincible = true;

                }

            }

            if(this.player.HP <= 0){ 
                this.player.animations.play('dead');
                this.player.alive = false;
            }

        }
    }
    
    },

    /*enemyTouchAlly: function(){
        for (var i = 0; i < this.totalAllies.length; i++){
        
            for (var j = 0; j < this.totalEnemies.length; j++){
                if (this.checkOverlap(this.totalAllies[i], this.totalEnemies[j]) && this.totalEnemies[j].alive == true && this.totalAllies[i].alive == true && 
                this.totalAllies[i].dying == false){
                    if(this.totalAllies[i].invincible == false){
                    this.totalAllies[i].HP -= 50;
                    this.totalAllies[i].animations.play('takeDamage');
                    this.totalAllies[i].invincible = true;
                    }
                    
                }

            }

            if(this.totalAllies[i].HP <= 0 && this.totalAllies[i].dying == false){
                this.totalAllies[i].dying = true;
                this.totalAllies[i].animations.play('dead', 7, false, true); 
                this.totalAllies[i].speed = 0;
                
            }
        }
        
    },*/

    updateAllyAnimation: function(){
        for(var i = 0; i < this.totalAllies.length; i++){
            if(this.totalAllies[i].invincible == true){
                this.totalAllies[i].invincibilityCounter--;
            }

            if(this.totalAllies[i].invincibilityCounter == 0){
                this.totalAllies[i].invincible = false;
                this.totalAllies[i].invincibilityCounter = 50;
            }

            if(this.totalAllies[i].body.velocity.x > 0 && Math.abs(this.totalAllies[i].body.velocity.x) > Math.abs(this.totalAllies[i].body.velocity.y)){
                this.totalAllies[i].animations.play('moveRight');
              }
              if(this.totalAllies[i].body.velocity.x < 0 && Math.abs(this.totalAllies[i].body.velocity.x) > Math.abs(this.totalAllies[i].body.velocity.y)){
                this.totalAllies[i].animations.play('moveLeft');
              }
              if(this.totalAllies[i].body.velocity.y > 0 && Math.abs(this.totalAllies[i].body.velocity.y) > Math.abs(this.totalAllies[i].body.velocity.x)){
                this.totalAllies[i].animations.play('moveForward');
              }
              if(this.totalAllies[i].body.velocity.y < 0 && Math.abs(this.totalAllies[i].body.velocity.y) > Math.abs(this.totalAllies[i].body.velocity.x)){
                this.totalAllies[i].animations.play('moveBack');
              }

        }
    },

    

    respawnPlayer: function(){
    //Check if player is dead, if dead, respawn with full HP
        if (this.player.alive == false && this.counter == 200*this.numberOfDeaths){
            this.numberOfDeaths++;
            this.respawnCountDown = 200*this.numberOfDeaths;
            this.player.reset(1580,1856);
            this.player.animations.play('idleForward');
            this.player.alive = true;
            this.player.HP = 500;

        }

    //If the player is not alive, increment the counter
        if(this.player.alive == false){
            this.counter++
            this.respawnCountDown--;
        }

    //counter should be reset to 0 when the player is alive
        if(this.player.alive == true){
            this.counter = 0;
            this.respawnCountDown = 200*this.numberOfDeaths;
        }
    },

    resetTint: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if (this.totalEnemies[i].tinted == true){ //If the enemy is tinted, decrease the tinted Counter
                this.totalEnemies[i].tintCounter--;
            }
    
            if(this.totalEnemies[i].tintCounter == 0){//Once the counter is up, remove the tint
                this.totalEnemies[i].tint = 0xffffff;
                this.totalEnemies[i].tintCounter = 5; //And then reset the counter
                this.totalEnemies[i].tinted = false;
            }
        }

        for (var i = 0; i < this.totalAllies.length; i++){
            if (this.totalAllies[i].tinted == true){ //If the enemy is tinted, decrease the tinted Counter
                this.totalAllies[i].tintCounter--;
            }
    
            if(this.totalAllies[i].tintCounter == 0){//Once the counter is up, remove the tint
                this.totalAllies[i].tint = 0xffffff;
                this.totalAllies[i].tintCounter = 5; //And then reset the counter
                this.totalAllies[i].tinted = false;
            }
        }
        
    },

    resetOrganTint: function(){
        if (this.heart.tinted == true){
            this.heart.tintCounter--;
        }

        if(this.heart.tintCounter == 0){
            this.heart.tint = 0xffffff;
            this.heart.tintCounter = 5;
            this.heart.tinted = false;
        }
    },
    //creates the inital health blocks and spawns them around the bottom of the screen
    createHealth: function(){
        //var camBounds = this.game.camera.bounds;
        //console.log('player starts at x=' + this.player.world.x + ', y=' + this.player.world.y);
        var startx = this.calcXForHealth();              //this is the startingpoint of the leftmost health block
        var starty = this.calcYForHealth();
        //spawned in the center of the world for now. Need to move and have it move with camera.
        for(var i=0; i<10; i++){
            healthArray[i] = this.game.add.sprite(170 + (i*52), 1800, 'full bar');    //health blocks are 92 pixels, so place them 6 pixels apart
            healthArray[i].fixedToCamera = true;
        }
        this.playerMaxHealth = this.player.HP;

        //health text first
        var text = this.game.add.text(10, 1815, 'Health:', { font: "50px Arial", fill: "#ffffff", align: "center"});
        text.anchor.setTo(0, 0);
        text.fixedToCamera = true;
        
    },

    //creates the ability icons
    createAbilityIcons: function(){
        var abilities = ['e abiilty','r abiilty', 't abiilty', 'f abiilty', 'g abiilty'];
        for(var i=0; i<5; i++){
          abilityIcons[i] = this.game.add.sprite(700 +(i*106), 1800, abilities[i]);
          abilityIcons[i].fixedToCamera = true;
          abilityIcons[i].tint = 0.4 * 0xFFFFFF;
        }  
    },

    //calculates the starting x for the heath blocks
    calcXForHealth: function(){
        return this.player.world.x - (98*5);
    },

    //calculates the starting y for the health blocks
    calcYForHealth: function(){
        return this.player.world.y + 635;
    },

    //updates the number of full blocks and moves the healthbar position to keep it centered.
    drawHealth: function(){
        //calculate percentage
        //console.log('camera width: ' + this.game.camera.width);
        var percentHealth = Math.floor((this.player.HP / this.playerMaxHealth) * 100);
        //console.log('percent health left : ' + percentHealth);
        //calculate number of full blocks
        var numFullBlocks = Math.floor(percentHealth / 10);
        var needHalfBar = false;
        var modResult = percentHealth % 10;
        if((modResult >= 1) && (modResult <= 5)){   //between 1-5, we need a half block
            needHalfBar = true;
        }        
        for(var i=0; i<healthArray.length; i++){
            if(numFullBlocks > 0){
                healthArray[i].loadTexture('full bar');
                numFullBlocks--;
                //console.log('bar ' + i + ' is a full bar');
            }
            else if(needHalfBar){
                healthArray[i].loadTexture('half bar');
                needHalfBar = false;
                //console.log('bar ' + i + ' is a half bar');
            }
            else {
                healthArray[i].loadTexture('empty bar');
                //console.log('bar ' + i + ' is an empty bar');
            }
        }

    },

    //creates the bottom gui bar
    createBottomBar: function(){
        bottomMenuBar = this.game.add.sprite(this.game.centerX, 1850, 'gui bar');
        bottomMenuBar.anchor.setTo(0, 0.5);
        bottomMenuBar.fixedToCamera = true;
    },

    //calculates the starting y for top gui bar
    calcYForTopGui: function(){
        return this.player.world.y - 835 - 54;  //total offset is 889
    },

    //creates the top gui bar
    createTopBar: function(){
        topMenuBar = this.game.add.sprite(this.game.centerX, 64, 'gui bar');
        topMenuBar.anchor.setTo(0, 0.6);
        console.log('topMenuBar.world.x = ' + topMenuBar.world.x);
        console.log('topMenuBar.world.y = ' + topMenuBar.world.y);
        topMenuBar.fixedToCamera = true; //MANUALLY SET GUI BAR AND FIX TO CAMERA
    },
    
    //create the bounus damage box
    createBonusDamageBox: function(){
        bonusDamageBox = this.game.add.sprite(80, 200, 'bonus damage box');
        bonusDamageBox.anchor.setTo(0.5, 0.5);
        bonusDamageBox.fixedToCamera = true;
    },

    //sets up the sprite to be shown in the bonus damage box
    createUpBonusDamageSprite: function(){

        bonusDamageEnemy = this.game.add.sprite(80, 200, bonusDamageEnemyTexture);
        
        bonusDamageEnemy.anchor.setTo(0.5, 0.5);
        bonusDamageEnemy.fixedToCamera = true;
    },

    //updates and moves the sprite to be shown in the bonus damage box
    updateBonusDamageSprite: function(){
        if (bonusDamageEnemyTexture != null && bonusDamageEnemyTexture.height > 128){
            bonusDamageEnemy.loadTexture(bonusDamageEnemyTexture);  //change the texture
            bonusDamageEnemy.scale.setTo(0.25, 0.25);
        }
        else if (bonusDamageEnemyTexture != null){
            bonusDamageEnemy.loadTexture(bonusDamageEnemyTexture);  //change the texture
            bonusDamageEnemy.scale.setTo(1, 1);
        }
    },

    //create a trap
    createATrap: function(){
        console.log("trap was created");
        var trap = this.game.add.sprite(0, 0, 'trap');
        trap.anchor.setTo(0.5, 0.5);
        trap.visible = false;
        trap.active = false;
        //console.log(trap.active);
        traps.push(trap);
    },

    //spawn a trap
    spawnATrap: function(trap){
        console.log("entered spawnATrap");
        trap.x = this.input.activePointer.worldX;
        trap.y = this.input.activePointer.worldY;
        for(var i=0; i<30; i++){
            trap.moveDown();
        }
        trap.visible = true;
        trap.active = true;
        //console.log(trap.active);
        this.game.physics.arcade.enable(trap);
        
    },

    //trap deals damage
    activateTrap: function(enemySprite, trap){
        console.log("trap activated");
        if(trap.active){    //only activate if trap is active
            enemySprite.HP -= 150; //halves HP
            if(enemySprite.tinted == false){ //If the enemy is not currently tinted
                enemySprite.tint = 0.4 * 0xffffff;
                enemySprite.tinted = true;
            }
            //place trap on cooldown
            this.trapCooldown(trap);
        }
    },

    //does trap cooldown
    trapCooldown: function(trap){
        trap.active = false;    //tap is now on cooldown
        //tint the trap to show it's off
        trap.tint = 0.4 * 0xffffff;
        this.game.time.events.add(5000, this.resetTrap, this);
    },

    //resets the trap
    resetTrap: function(){
        traps[0].active = true; //trap is active again
        traps[0].tint = 0xffffff;      //untint
    },

    //resets some values
    resetState: function(){
        bonusDamageEnemy = null;
        bonusDamageEnemyTexture = null;
        currentEnemy = null;
        targetEnemy = null;
        traps[0].visible = false;
        traps[0].active = false;
        traps[0].x = 0;
        traps[0].y = 0;
        activeTrap = false;
        skillPoints = 0;
        bonusMultiplier = 1;
    },

    whiteBloodCellAlly: function(){
    ally = this.game.add.sprite(this.player.world.x, this.player.world.y, 'WhiteBloodCell');
    
    //Sets the player anchor to 0.5, 0.5 (center)
    ally.anchor.setTo(0.5,0.5)

    //ADDING THE DIFFERENT ANIMATIONS OF THE WHITE BLOOD CELL
    ally.animations.add('attackBack', [0,1,2,3,4,5,6,7,8,9], 7, true);
    ally.animations.add('attackForward', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 7, true);
    ally.animations.add('attackLeft', [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], 7, true);
    ally.animations.add('attackRight', [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 7, true);
    ally.animations.add('dead', [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], 7, false);
    ally.animations.add('idleBack', [59, 60, 61, 62, 63,64,65,66,67,68,69,70,71,72,73,74,75,76], 7, true);
    ally.animations.add('idleForward', [77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94], 7, true);
    ally.animations.add('idleLeft', [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112], 7, true);
    ally.animations.add('idleRight', [113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130], 7, true);
    ally.animations.add('moveBack', [131, 132, 133, 134, 135, 136, 137, 138, 139, 140], 7, true);
    ally.animations.add('moveForward', [141, 142, 143, 144, 145, 146, 147, 148, 149, 150], 7, true);
    ally.animations.add('moveLeft', [151, 152, 153, 154, 155, 156, 157, 158, 159, 160],7,true);
    ally.animations.add('moveRight', [161, 162, 163, 164, 165, 166, 167, 168, 169, 170], 7, true);
    ally.animations.add('takeDamage', [171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181], 7, false);

    ally.animations.play('idleForward');
    ally.game.physics.arcade.enable(ally);
    ally.tint = 0.2 * 0xffffff;
    ally.speed = 750;
    ally.HP = 1000;
    ally.maxHP = 1000;
    ally.type = "ally";
    ally.invincibilityCounter = 50;
    ally.tinted = false;
    ally.tintCounter = 2;
    ally.invincible = false;
    ally.dying = false;
    var bmd = this.game.add.bitmapData(200,10);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,180,30);
    bmd.ctx.fillStyle = "#00ff00";
    bmd.ctx.fill();
    var healthBar = this.game.add.sprite(-100, -100, bmd);
    ally.addChild(healthBar);
    ally.kill();
    this.AllyBullets();
    this.totalAllies.push(ally); //We will push this to as an ally
    },

    summonAlly: function(){
        if(this.totalAllies[0].alive == false){
        this.totalAllies[0].children[0].width = 200*this.totalAllies[0].HP/this.totalAllies[0].maxHP;
        this.totalAllies[0].HP = 1000;
        this.totalAllies[0].dying = false;
        this.totalAllies[0].reset(this.player.world.x - 50, this.player.world.y - 50);
        this.totalAllies[0].animations.play('idleForward');
        this.totalAllies[0].speed = 750;
        }
    },

    AllyBullets: function(){
 
        allyBullets = this.game.add.group();
        allyBullets.enableBody = true;
        allyBullets.physicalBodyType = Phaser.Physics.ARCADE;
        allyBullets.createMultiple(50, 'AntibodyBullet');
        allyBullets.setAll('checkWorldBounds', true);
        allyBullets.setAll('outOfBoundsKill', true);
        allyBullets.NextFire = 0;
        allyBullets.FireRate = 100;
        allyBullets.user = "ally"; //This determines the wielder of the bullet
        allyBullets.damage = 50; //Deals 50 damage
        this.allyBullets.push(allyBullets);
        return allyBullets;

    },

    reapplySprite: function(){
        for(var i = 0; i < this.totalEnemies.length; i++){
            if(this.totalEnemies[i].alive == false && this.totalEnemies[i].visible == false){
                this.totalEnemies[i].animations.play('attacking', 7, true);
                if(this.totalEnemies[i].type == 'cancer'){
                    this.totalEnemies[i].speed = 550;
                }
                if(this.totalEnemies[i].type == 'bacteria'){
                    this.totalEnemies[i].speed = -350;
                }
                if(this.totalEnemies[i].type == 'virus'){
                    this.totalEnemies[i].speed = 150;
                }
                if(this.totalEnemies[i].type == 'parasite'){
                    this.totalEnemies[i].speed = 50;
                }
            }
        }
    },

    killAllEnemies: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if(this.totalEnemies[i].alive == true && this.totalEnemies[i].visible == true){
                this.totalEnemies[i].HP = 0;
                this.totalEnemies[i].tint = 0xffffff; //Resets the tint
                this.totalEnemies[i].alive = false;
                this.totalEnemies[i].play('dead',7, false, true);
                this.windActivated = false;
                this.player.body.gravity.x = 0;
                this.player.body.gravity.y = 0;
            }

            
        }
    },

    activateBlueWave: function(){
        this.blueWave.reset(this.player.x, this.player.y);
        this.blueWave.animations.play('resolving');
        this.player.invincible = true;
        

        
    },

    blueWaveCollision: function(enemy, attack){
        enemy.HP -= 10;
        if (enemy.HP <= 0) {
            enemy.children[0].width = 0;
        }
        else {
            enemy.children[0].width = 200*enemy.HP/enemy.maxHP;
        }
        if(enemy.tinted == false){ //If the enemy is not currently tinted
            enemy.tint = 0.4 * 0xffffff;
            enemy.tinted = true;
        }

        if (enemy.HP <= 0){
            enemy.tint = 0xffffff; //Resets the tint
            enemy.alive = false;
            enemy.play('dead',7, false, true);
        }
    },

    blueWaveFollow: function(){

        if(this.blueWave.alive == true){
            this.blueWaveCounter--;
            this.player.HP = 500;
            this.blueWave.x = this.player.x;
            this.blueWave.y = this.player.y;
        }
        if(this.blueWaveCounter <= 0){
            this.blueWave.kill();
            this.blueWaveCounter = 300;
        }
    },

    activateWhip: function(){
        var x = this.input.activePointer.worldX;
        var y = this.input.activePointer.worldY;
        this.whip.reset(x,y);
        
    },

    whipCollision: function(enemy, attack){
        attack.animations.play('resolving', 35, false, false);
        enemy.HP -= 15;
        if (enemy.HP <= 0) {
            enemy.children[0].width = 0;
        }
        else {
            enemy.children[0].width = 200*enemy.HP/enemy.maxHP;
        }
        if(enemy.tinted == false){ //If the enemy is not currently tinted
            enemy.tint = 0.4 * 0xffffff;
            enemy.tinted = true;
        }

        if (enemy.HP <= 0){
            enemy.tint = 0xffffff; //Resets the tint
            enemy.alive = false;
            enemy.play('dead',7, false, true);
        }
    },

    whipFollow: function(){

        if(this.whip.alive == true){
            this.whipCounter--;
        }
        if(this.whipCounter <= 0){
            this.whip.kill();
            this.whipCounter = 1000;
        }
    },

    activateVoid: function(){
        var x = this.input.activePointer.worldX;
        var y = this.input.activePointer.worldY;
        this.void.reset(x,y);
        this.void.animations.play('resolving', 13, false, true);
    },

    voidCollision: function(enemy, attack){
        enemy.HP -= 100;
        if (enemy.HP <= 0) {
            enemy.children[0].width = 0;
        }
        else {
            enemy.children[0].width = 200*enemy.HP/enemy.maxHP;
        }
        if(enemy.tinted == false){ //If the enemy is not currently tinted
            enemy.tint = 0.4 * 0xffffff;
            enemy.tinted = true;
        }

        if (enemy.HP <= 0){
            enemy.tint = 0xffffff; //Resets the tint
            enemy.alive = false;
            enemy.play('dead',7, false, true);
        }
    },

    placeMucusTrap: function(){
        var x = this.input.activePointer.worldX;
        var y = this.input.activePointer.worldY;
        this.mucusTrap.reset(x,y);
        this.mucusTrap.animations.play('dormant');
    },

    mucusTrapCollision: function(enemy, attack){ //Temp Test
        this.mucusTrapCounter--;
        if(this.mucusTrapCounter <= 0){
        attack.animations.play('resolving', 20, false, true);
        enemy.speed = 5;
        if(enemy.tinted == false){ //If the enemy is not currently tinted
            enemy.tint =  0x008000;
            enemy.tinted = true;
        }
        }
    
    },

    resetMucusCounter: function(){
        if(this.mucusTrap.alive == false){
            this.mucusTrapCounter = 300;
        }

    },

    parasiteTeethAttack: function(){
        if(this.parasiteBossGenerated == true && this.parasiteBossDefeated == false){
            for(var i = 0; i < this.parasiteTeeths.length; i++){
                if(this.parasiteTeeths[i].alive == false){
                this.parasiteTeeths[i].fired = false;
                this.parasiteTeeths[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), 256);
                this.parasiteTeeths[i].animations.play('resolving');
                }
                if(this.parasiteTeeths[i].alive == true && this.player.alive == true && this.parasiteTeeths[i].fired == false){
                    this.parasiteTeeths[i].rotation = this.game.physics.arcade.moveToObject(this.parasiteTeeths[i], this.player, 550);
                    this.parasiteTeeths[i].fired = true;
                }
            }
        }

    },

    checkBossDefeatStatus: function(){
        for(var i = 0; i< this.totalEnemies.length; i++){
            if(this.totalEnemies[i].type == 'bossCancer'){
                if(this.totalEnemies[i].alive == false){
                    this.cancerBossDefeated = true;
                }
                else{
                    this.cancerBossDefeated = false;
                }
            }

            if(this.totalEnemies[i].type == 'bossParasite'){
                if(this.totalEnemies[i].alive == false){
                    this.parasiteBossDefeated = true
                }
                else{
                    this.parasiteBossDefeated = false;
                }
            }

            if(this.totalEnemies[i].type == 'bossVirus'){
                if(this.totalEnemies[i].alive == false){
                    this.virusBossDefeated = true;
                }
                else{
                    this.virusBossDefeated = false;
                }
            }


        }
    },

    checkWind: function(){
        if(this.windActivated == true && this.warningSet == false){
            this.warning.reset(960, 500);
            this.warning.fixedToCamera = true;
            this.warning.animations.play('resolving');
            this.warningSet = true;
        }
        if(this.windActivated == false && this.player.locked == false){
            this.warningSet = false;
            this.warning.kill();
        }
    },

    checkLocked: function(){
        if(this.player.locked == true && this.warningSet == false){
            this.warning.reset(960, 500);
            this.warning.fixedToCamera = true;
            this.warning.animations.play('resolving');
            this.warningSet = true;
            this.gunDisabled.reset(960, 780);
            this.gunDisabled.fixedToCamera = true;
        }
        if(this.player.locked == false && this.windActivated == false){
            this.warningSet = false;
            this.warning.kill();
            this.gunDisabled.kill();
        }
        
    },

    checkPressure: function(){
        if(this.player.body.gravity.x == 30000){
            this.pressureRight.reset(960, 780);
            this.pressureRight.fixedToCamera = true;
        }
        if(this.player.body.gravity.x != 30000){
            this.pressureRight.kill();
        }

        if(this.player.body.gravity.x == -30000){
            this.pressureLeft.reset(960, 780);
            this.pressureLeft.fixedToCamera = true;
        }
        if(this.player.body.gravity.x != -30000){
            this.pressureLeft.kill();
        }

        if(this.player.body.gravity.y == 30000){
            this.pressureDown.reset(960, 780);
            this.pressureDown.fixedToCamera = true;
        }
        if(this.player.body.gravity.y != 30000){
            this.pressureDown.kill();
        }

        if(this.player.body.gravity.y == -30000){
            this.pressureUp.reset(960, 780);
            this.pressureUp.fixedToCamera = true;
        }
        if(this.player.body.gravity.y != -30000){
            this.pressureUp.kill();
        }

    },

    virusHoleAttack: function(){
        if(this.virusBossGenerated == true && this.virusBossDefeated == false){
        if(this.virusHole.fired == false){
        this.virusHole.reset(TopDownGame.game.rnd.integerInRange(200, 2000), 200)
        this.virusHole.animations.play('resolving', 14, false, true);
        this.game.physics.arcade.moveToObject(this.virusHole, this.player, 350);
        this.virusHole.fired = true;
        }

        if(this.virusHole.alive == false){
            this.virusHole.fired = false;
        }
    }
        
    },

    virusHoleAttack2: function(){
        if(this.virusBossGenerated == true && this.virusBossDefeated == false){
        if(this.virusHole.fired == false){
        this.virusHole.reset(TopDownGame.game.rnd.integerInRange(200, 2000), TopDownGame.game.rnd.integerInRange(200, 500))
        this.virusHole.animations.play('resolving', 14, false, true);
        this.game.physics.arcade.moveToObject(this.virusHole, this.player, 550);
        this.virusHole.fired = true;
        }

        if(this.virusHole.alive == false){
            this.virusHole.fired = false;
        }
    }
        
    },

    virusHoleAttackHeart: function(){
        if(this.virusBossGenerated == true && this.virusBossDefeated == false && this.player.alive == false ||
           this.cancerBossGenerated == true && this.cancerBossDefeated == false && this.player.alive == false ||
           this.parasiteBossGenerated == true && this.parasiteBossDefeated == false && this.player.alive == false){
            if(this.virusHole.fired == false){
            this.virusHole.reset(this.heart.x, this.heart.y);
            this.virusHole.animations.play('resolving', 14, false, true);
            this.virusHole.fired = true;
            }
    
            if(this.virusHole.alive == false){
                this.virusHole.fired = false;
            }
        }
    },


    shake: function(){
        if(this.windActivated == true){
        this.game.camera.shake(0.002, 1000);
        }
    },

    playBossTheme: function(){
        if((this.cancerBossGenerated == true && this.cancerBossDefeated == false)||
           (this.virusBossDefeated == false && this.virusBossGenerated == true)){
            this.mainTheme.stop();
            this.boss1theme.resume();
            if(!this.boss1theme.isPlaying){
                this.boss1theme.play()
            }
        }

        else if(this.parasiteBossGenerated == true && this.parasiteBossDefeated == false){
            this.mainTheme.stop();
            this.boss2theme.resume();
            if(!this.boss2theme.isPlaying){
                this.boss2theme.play()
            }
        }

        else{
            this.boss1theme.stop();
            this.boss2theme.stop();
            if(!this.mainTheme.isPlaying){
                this.mainTheme.play();
            }
        }
        
    },

    //pathfinding algorithms
    setUpPathfinding: function(sprite){
        sprite.path = [];
        sprite.path_step = -1;
    },

    //call this function in update
    updatePath: function(sprite){
        var next_position, velocity;
        
        if(sprite.path.length > 0){
            next_position = sprite.path[sprite.path_step];

            if(!this.reached_target_position(sprite, next_position)){
                velocity = new Phaser.Point(next_position.x - sprite.position.x,
                                            next_position.y - sprite.position.y);
                velocity.normalize();
                sprite.body.velocity.x = velocity.x * sprite.speed;
                sprite.body.velocity.y = velocity.y * sprite.speed;
            }
            else{
                sprite.position.x = next_position.x;
                sprite.position.y = next_position.y;
                if(sprite.path_step < sprite.path.length -1){
                    sprite.path_step++;
                }
                else{
                    sprite.path = [];
                    sprite.path_step = -1;
                    sprite.body.velocity.x = 0;
                    sprite.body.velocity.y = 0;
                }
            }
        }
    },

    reached_target_position: function(sprite, target_position){
        console.log("sprite's position is " + sprite.position + " wants to go to " + target_position);
        var distance;
        distance = Phaser.Point.distance(sprite.position, target_position);
        console.log("distance is " + distance);
        return distance < 20;
    },

    move_to: function(sprite, target_position){
        this.pathfinding.find_path(sprite.position, target_position, this.move_through_path, sprite);
    },

    move_through_path: function(path){
        if(path !== null){
            this.path = path;
            this.path_step = 0;
        }
        else{
            this.path = [];
        }
    },

    //call this method to move the sprite to the target position
    move_sprite: function(sprite, target_position){
        this.move_to(sprite, target_position);
    },
    
    stopMusic: function(a,b,c){
        a.stop();
        b.stop();
        c.stop();
    },


    generateWave: function(cancerAmount, virusAmount, parasiteAmount, bacteriaAmount, fastParasiteAmount, dangerParasiteAmount, dangerVirusAmount, dangerBacteriaAmount){
       
        var cancerSummoned = 0;//Tracks amount summoned
        var virusSummoned = 0;
        var parasiteSummoned = 0;
        var bacteriaSummoned = 0;
        var fastParasiteSummoned = 0;
        var dangerParasiteSummoned = 0;
        var dangerVirusSummoned = 0;
        var dangerBacteriaSummoned = 0;

                for (var i = 0; i < this.totalEnemies.length; i++) { //Respawn the enemies randomly and equipt them with bullets
                    
                    this.totalEnemies[i].children[0].width = 200;

                    if(this.totalEnemies[i].type == "cancer" && cancerSummoned < cancerAmount){
                        this.totalEnemies[i].HP = 500;
                        if(TopDownGame.game.rnd.integerInRange(0,1) == 0){
                            this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                        }
                        else{
                            this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(2200, 2800));
                        }
                        cancerSummoned++;
                    }

                    if(this.totalEnemies[i].type == "virus" && virusSummoned < virusAmount && this.totalEnemies[i].subType == "normal"){
                        this.totalEnemies[i].HP = 2500;
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                        virusSummoned++;
                    }

                    if(this.totalEnemies[i].type == "virus" && dangerVirusSummoned < dangerVirusAmount && this.totalEnemies[i].subType == "danger"){
                        this.totalEnemies[i].HP = 5000;
                        this.totalEnemies[i].speed = 300;
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                        dangerVirusSummoned++;
                    }

                    if(this.totalEnemies[i].type == "parasite" && parasiteSummoned < parasiteAmount && this.totalEnemies[i].subType == "slow"){
                        this.totalEnemies[i].HP = 2500;
                        if(TopDownGame.game.rnd.integerInRange(0,1) == 0){
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                        }
                        else{
                            this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(2200, 2600)); 
                        }
                        parasiteSummoned++;
                    }

                    if(this.totalEnemies[i].type == "bacteria" && bacteriaSummoned < bacteriaAmount && this.totalEnemies[i].subType == "normal"){
                        this.totalEnemies[i].HP = 500;
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(256, 2800), TopDownGame.game.rnd.integerInRange(256, 600));
                        bacteriaSummoned++;
                    }

                    if(this.totalEnemies[i].type == "bacteria" && dangerBacteriaSummoned < dangerBacteriaAmount && this.totalEnemies[i].subType == "danger"){
                        this.totalEnemies[i].HP = 3000;
                        this.totalEnemies[i].speed = 350;
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(1300, 1800), TopDownGame.game.rnd.integerInRange(1300, 2000));
                        dangerBacteriaSummoned++;
                    }

                    if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "fast" && fastParasiteSummoned < fastParasiteAmount){
                        this.totalEnemies[i].HP = 1500;
                        this.totalEnemies[i].speed = 750;
                        if(TopDownGame.game.rnd.integerInRange(0,1) == 0){
                            this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(100, 300), TopDownGame.game.rnd.integerInRange(1000, 2300));
                        }
                        else{
                            this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(2800, 3000), TopDownGame.game.rnd.integerInRange(1000, 2300));
                        }
                        fastParasiteSummoned++;
                    }

                    if(this.totalEnemies[i].type == "parasite" && this.totalEnemies[i].subType == "danger" && dangerParasiteSummoned < dangerParasiteAmount){
                        this.totalEnemies[i].HP = 5000;
                        this.totalEnemies[i].speed = 400;
                        this.totalEnemies[i].reset(TopDownGame.game.rnd.integerInRange(1000, 1800), 256);
                        dangerParasiteSummoned++;
                    }



                    
                    }
    },

    resetCancerBoss: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if (this.totalEnemies[i].type == "bossCancer"){
                this.totalEnemies[i].reset(1664, 556);
            }
        }
    },

    resetVirusBoss: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if (this.totalEnemies[i].type == "bossVirus"){
                this.totalEnemies[i].reset(2764, 356);
            }
        }
    },

    resetParasiteBoss: function(){
        for (var i = 0; i < this.totalEnemies.length; i++){
            if (this.totalEnemies[i].type == "bossParasite"){
                this.totalEnemies[i].reset(1664, 556);
            }
        }
    },

    updateScore: function(){
        this.text.setText("Skill Points: " + Math.round(skillPoints * 10)/10);
        this.left.setText("Enemies Left: " + this.enemiesLeft)
        this.level.setText("Level: " + this.game.selectedLevel.substr(-1))
        this.wave.setText("Wave: " + this.currentWave);
        this.displayMultiplier.setText("Multiplier: " + Math.round(bonusMultiplier * 10)/10 + "X");
        if(this.waveCounter != 300){
            this.timeUntilNextWave.setText("Until Next Wave: " + this.waveCounter);
        }
        else if (this.waveCounter == 300){
            this.timeUntilNextWave.setText("Defeat All Enemies!");
        }
        if(this.player.alive == false){
            this.playerRespawnTime.setText("Time Left Until Respawn: " + this.respawnCountDown);
        }
        if(this.player.alive == true){
            this.playerRespawnTime.setText("");
        }
        if(this.heart.HP < 1000){
            this.heartDanger.setText("HEART HP LOW!! Heart HP: " + this.heart.HP);
        }
        if(this.heart.HP >= 1000){
            this.heartDanger.setText("");
        }
        
        if(this.shootingMode % 3 == 1){
        this.shooting.setText("Mode: Sniper");
        }
        if(this.shootingMode % 3 == 2){
            this.shooting.setText("Mode: Scatter");
            }
        if(this.shootingMode % 3 == 0){
        this.shooting.setText("Mode: Gun");
        }
    },

    render: function(game){
        //this.game.debug.text(game.time.fps, 40, 40, {font: '40px Arial'});
        if(this.shootingMode % 3 == 1){
        this.game.debug.geom(this.sniperLine);
        }
    },


    checkShootingMode: function(){
        if(this.shootingMode % 3 == 1){
            this.target.reset(this.game.input.activePointer.x + this.game.camera.x, this.game.input.activePointer.y + this.game.camera.y);
            this.sniperLine.fromSprite(this.player, this.target, false);
            this.player.sniperMode = true;
            if (this.game.input.activePointer.isDown && this.player.alive == true && this.player.locked == false){
                this.sniperFire();
            }
    
        }

        if(this.shootingMode % 3 == 2){
            this.player.scatterMode = true;
            if (this.game.input.activePointer.isDown && this.player.alive == true && this.player.locked == false){
                this.scatterFire();
            }
        }

        if (this.shootingMode % 3 != 1){
            this.target.kill();
            this.player.sniperMode = false;
        }

        if (this.shootingMode % 3 != 2){
            this.player.scatterMode = false;
        }
    },

    tutorial: function() {
        this.lockAllAbilities();
        this.unlockAbilities(0);
        switch(this.current_instruction) {
            case -1:
                if (this.instruction_counter == -1) {
                    this.player.x = 1800;
                    this.player.y = 2000;
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#ffffff", align: "center"})
                    this.tutorial_text.setText("Welcome to Immune Invasion!\nYour mission is to protect the heart \nand defeat all invading pathogens!")
                    this.instruction_counter++;
                    this.instruction_counter++;
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 400) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            case 0:
                if (this.instruction_counter == -1) {
                    this.tutorial_text.setStyle({font: "100px Arial", fill: "#ffffff", align: "center"})
                    this.tutorial_text.setText("Move with WASD keys");
                    this.instruction_counter++;
                }
                if (Math.abs(this.player.x - 1800) > 25 && Math.abs(this.player.y - 2000) > 25 && this.instruction_counter == 0) {
                    this.tutorial_text.setStyle({font: "100px Arial", fill: "#00ff00", align: "center"})
                    this.instruction_counter++;
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 150) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            case 1:
                if (this.instruction_counter == -1) {
                    this.tutorial_text.setText("Left click mouse to shoot antibodies!\nHold down button for continuous fire!\nShooting the heart restores \nthe heart's health!");
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#ffffff", align: "center"})
                    this.instruction_counter++;
                }
                if (this.game.input.activePointer.isDown && this.instruction_counter == 0) {
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#00ff00", align: "center"})
                    this.instruction_counter++;
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 150) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            case 2:
                if (this.instruction_counter == -1) {
                    this.tutorial_text.setText("Click space key to change the attack mode!\nSniper mode is slower but does more damage.\nUse any attack mode that's fun for you!");
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#ffffff", align: "center"})
                    this.instruction_counter++;
                }
                if (this.spaceBar.isDown && this.instruction_counter == 0) {
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#00ff00", align: "center"})
                    this.instruction_counter++;
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 150) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            case 3:
                if (this.instruction_counter == -1) {
                    skillPoints = 500;
                    this.tutorial_text.setText("Press G and aim with your \nmouse to use a skill!\nThe mucus trap slows down \nenemies coming towards you.\nSkills require SP (bottom right) \nwhich can be obtained by killing enemies. \nKeep playing to unlock new skills!");
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#ffffff", align: "center"})
                    this.instruction_counter++;
                }
                if (this.G.isDown && this.instruction_counter == 0) {
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#00ff00", align: "center"})
                    this.instruction_counter++;
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 150) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            case 4:
                if (this.instruction_counter == -1) {
                    this.tutorial_text.setText("Defeat the enemy with your \n antibodies and skills! Attacking \nthe same type of enemy \ndeals bonus damage to them!");
                    this.tutorial_text.setStyle({font: "75px Arial", fill: "#ffffff", align: "center"});
                    this.generateWave(4, 0, 0, 0, 0, 0, 0, 0);
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 0) {
                    var counter = 0;
                    for(var i = 0; i < this.totalEnemies.length; i++){
                        if (this.totalEnemies[i].alive == false){
                            counter++;
                        }
                        this.enemiesDead = counter;
                        this.enemiesLeft = this.totalEnemies.length - this.enemiesDead;
                    }
                    if (this.enemiesLeft == 0) {
                        this.tutorial_text.setStyle({font: "75px Arial", fill: "#00ff00", align: "center"})
                        this.instruction_counter++;
                    }
                }
                if (this.instruction_counter > 0) {
                    this.instruction_counter++;
                }
                if (this.instruction_counter == 150) {
                    this.current_instruction++;
                    this.instruction_counter = -1;
                }
                break;
            default:
                if (this.instruction_counter == -1) {
                    this.tutorial_text.setText("CONGRATULATIONS! \n YOU'VE COMPLETED THE TUTORIAL!\nGet ready to defeat all enemies!");
                }
                if (this.instruction_counter == 200) {
                    this.player.x = 1580;
                    this.player.y = 1856;
                    this.tutorial_text.destroy();
                    this.game.selectedLevel = "Level1";
                    this.blockedLayer.destroy();
                    this.blockedLayer = this.map.createLayer(this.game.selectedLevel);
                    this.map.setCollisionBetween(1, 625, true, this.game.selectedLevel); 
                    this.setPathfindingMap(this.game.selectedLevel);
                    this.resetUI();
                }
                else {
                    this.instruction_counter++;
                }

        }
    },

    healthBarForce: function(){
        for(var i = 0; i < this.totalEnemies.length; i++){
            this.totalEnemies[i].children[0].angle = -this.totalEnemies[i].angle;
        }
    },

    exit: function(){
        if(this.leave == true){
        this.resetState();
        this.state.start('MainMenu');
        this.stopMusic(this.mainTheme, this.boss1theme, this.boss2theme);
        }
    },

    setPathfindingMap: function(levelName){
        for(var i=0; i<this.map.layers.length; i++){
            if(this.map.layers[i].name == levelName){
                this.pathfinding.changeMap(this.map.layers[i].data);
                break;
            }
        }
    },

    resetUI: function() {
        topMenuBar.destroy();
        bottomMenuBar.destroy();
        bonusDamageBox.destroy();
        for (var i=0; i<abilityIcons.length; i++) {
            abilityIcons[i].destroy();
        }
        for (var i=0; i<healthArray.length; i++) {
            healthArray[i].destroy();
        }
        this.createTopBar();
        this.createBottomBar();
        this.createBonusDamageBox();
        this.createAbilityIcons();
        this.createHealth();
        this.text.destroy();
        this.level.destroy();
        this.wave.destroy();
        this.left.destroy();
        this.shooting.destroy();
        this.timeUntilNextWave.destroy();
        this.playerRespawnTime.destroy();
        this.heartDanger.destroy();
        this.displayMultiplier.destroy();
        this.text = this.game.add.text(1600, 1830, "Skill Points: " + skillPoints, {
            font: "50px Arial",
            fill: "#42f4e8",
            align: "center"
        });
        this.level = this.game.add.text(350, 64, "Level: " + this.game.selectedLevel.substr(-1), {
            font: "40px Arial",
            fill: "#000000",
            align: "center"
        });
        this.wave = this.game.add.text(575, 64, "Wave: " + this.currentWave, {
            font: "40px Arial",
            fill: "#000000",
            align: "center"
        });
    
        this.left = this.game.add.text(850, 64, "Enemies Left: " + this.enemiesLeft, {
            font: "40px Arial",
            fill: "#000000",
            align: "center"
        });
    
        this.shooting = this.game.add.text(1160, 64, "Shooting Mode: Antibody Gun", {
            font: "40px Arial",
            fill: "#000000",
            align: "center"
        });
    
        this.timeUntilNextWave = this.game.add.text(1560, 64, "Next Wave:", {
            font: "40px Arial",
            fill: "#000000",
            align: "center"
        });
    
        this.playerRespawnTime = this.game.add.text(960, 960, "Time Until Respawn:", {
            font: "100px Arial",
            fill: "#00ff00",
            align: "center"
        });
    
        this.heartDanger = this.game.add.text(960, 400, "HEART HP LOW!", {
            font: "60px Arial",
            fill: "#00ff00",
            align: "center"
        });
    
        this.displayMultiplier = this.game.add.text(138, 300, "Current Multiplier:", {
            font: "40px Arial",
            fill: "#00ff00",
            align: "center"
        });
    
        this.text.anchor.setTo(0.5, 0.5);
        this.text.fixedToCamera = true;
        this.shooting.anchor.setTo(0.5,0.5);
        this.shooting.fixedToCamera = true;
        this.level.anchor.setTo(0.5, 0.5);
        this.level.fixedToCamera = true;
        this.wave.anchor.setTo(0.5, 0.5);
        this.wave.fixedToCamera = true;
        this.left.anchor.setTo(0.5, 0.5);
        this.left.fixedToCamera = true;
        this.playerRespawnTime.anchor.setTo(0.5, 0.5);
        this.playerRespawnTime.fixedToCamera = true;
        this.heartDanger.anchor.setTo(0.5, 0.5);
        this.heartDanger.fixedToCamera = true;
        this.timeUntilNextWave.anchor.setTo(0.5, 0.5);
        this.timeUntilNextWave.fixedToCamera = true;
        this.displayMultiplier.anchor.setTo(0.5, 0.5);
        this.displayMultiplier.fixedToCamera = true;
    },

    unlockAbilities: function(levelNum){
        for(var i=0; i<levelNum+1; i++){
            var ability;
            switch (i){
                case 0: //sniper and mucus trap
                    abilities["mucus trap"] = true;
                    ability = "sniper";
                    abilityIcons[4].tint = 0xFFFFFF;
                    break;
                case 1: //ally
                    ability = "ally";
                    abilityIcons[3].tint = 0xFFFFFF;
                    break;
                case 2: //tentacle (whip)
                    ability = "whip";
                    abilityIcons[1].tint = 0xFFFFFF;
                    break;
                case 3: //blue wave
                    ability = "blue wave";
                    abilityIcons[0].tint = 0xFFFFFF;
                    break;
                case 4: //scatter
                    ability = "scatter";
                    break;
                case 5: //laser (void)
                    ability = "void";
                    abilityIcons[2].tint = 0xFFFFFF;
                    break;
            }
            abilities[ability] = true;
        }

    },
    
    lockAllAbilities: function(){
        for(var i=0; i<5; i++){
            switch(i){
                case 0: //ally
                    ability = "ally";
                    //abilityIcons[3].tint = 0.4 *0xFFFFFF;
                    break;
                case 1: //tentacle (whip)
                    ability = "whip";
                   // abilityIcons[1].tint = 0.4 *0xFFFFFF;
                    break;
                case 2: //blue wave
                    ability = "blue wave";
                    //abilityIcons[0].tint = 0.4 *0xFFFFFF;
                    break;
                case 3: //scatter
                    ability = "scatter";
                    break;
                case 4: //laser (void)
                    ability = "void";
                    //abilityIcons[2].tint = 0.4 * 0xFFFFFF;
                    break;
            }
            abilities[ability] = false;
        }

    }
};



