var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.Preload = function(){};

TopDownGame.Preload.prototype = {
  preload: function() {
    this.game.time.advancedTiming = true;
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);
    //load game assets
    this.load.tilemap('Levels', 'assets/tilemaps/Levels.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/Tileset/TileSet Immune Invasion.png');

    //Loads the white blood cell sprite sheet, cancer cell sprite sheet, and bullets
    this.load.spritesheet('WhiteBloodCell','assets/images/White Blood Cell/WHITE_BLOOD_CELL/White_Blood_Cell.png', 128, 128, 196);
    this.load.spritesheet('CancerCell', 'assets/images/Cancer Cell/ATTACK_FORWARD/Cancer Cell ATTACK_FORWARD.png', 128, 128, 16);
    this.load.spritesheet('SuperCancerCell', 'assets/images/Cancer Cell/Cancer Cell Boss/Cancer Cell Boss Idle.png',640, 640, 17);
    this.load.spritesheet('BlueVirus', 'assets/images/Virus/Blue Virus.png',128, 128, 10);
    this.load.spritesheet('Parasite', 'assets/images/Parasite/Parasite.png', 256, 256, 10);
    this.load.spritesheet('GreenBacteria', 'assets/images/Bacteria/Green Bacteria.png', 128, 128, 12);
    this.load.spritesheet('DangerBacteria', 'assets/images/Bacteria/Danger Bacteria.png', 192, 192, 12);
    this.load.spritesheet('BossParasite', 'assets/images/Parasite/Parasite Boss.png', 640, 640, 25);
    this.load.spritesheet('ParasiteTeeth', 'assets/images/Parasite/Parasite Teeth.png',256, 256, 14);
    this.load.spritesheet('BossVirus', 'assets/images/Virus/Boss Virus.png', 128, 128, 18);
    this.load.spritesheet('VirusHole', 'assets/images/Virus/Virus Hole.png', 384, 384, 21);
    this.load.spritesheet('VerticalBeam', 'assets/images/Virus/AOE Straight.png', 200, 3200, 4);
    this.load.spritesheet('HorizontalBeam', 'assets/images/Virus/AOE Side.png', 3200, 200, 4);
    this.load.spritesheet('FastParasite', 'assets/images/Parasite/Fast Parasite.png', 160, 160, 12);
    this.load.spritesheet('DangerParasite', 'assets/images/Parasite/Danger Parasite.png', 256, 256, 15);
    this.load.spritesheet('DangerVirus', 'assets/images/Virus/Danger Virus.png',192, 192, 11);
  
    this.load.image('CancerBullet', 'assets/images/Cancer Cell Bullet/Cancer Cell Bullet.png');
    this.load.image('BossBullet', 'assets/images/Cancer Cell/Super Cancer Cell/BossBullet.png');
    this.load.image('AntibodyBullet','assets/images/Antibody Bullet/Antibody Bullet.png');
    this.load.image('VirusBullet', 'assets/images/Virus/Virus Bullet.png');
    this.load.image('BacteriaBullet', 'assets/images/Bacteria/Bacteria Bullets.png');
    this.load.image('GreenBacteriaBullet', 'assets/images/Bacteria/Green Bacteria Bullet.png');
    

    //Loads the heart organ
    this.load.spritesheet('Heart','assets/images/Organs/Heart/Heart.png', 128, 128, 4);

    //loads AOE attacks
    this.load.spritesheet('BlueWave', 'assets/images/AOE/Blue Wave.png', 384, 384, 12);
    this.load.spritesheet('Whip', 'assets/images/AOE/Whip.png', 512, 512, 19);
    this.load.spritesheet('Void', 'assets/images/AOE/Void.png', 640, 640, 10);
    this.load.spritesheet('MucusTrap', 'assets/images/Traps/Mucus Trap.png', 896, 896, 17);
    this.load.spritesheet('Warning', 'assets/images/AOE/Warning 256.png',256, 256, 6);
    this.load.spritesheet('SniperExplosion', 'assets/images/AOE/Sniper Explosion.png',128, 128, 5);
    this.load.image('Pressure Up', 'assets/images/AOE/Pressure Up.png');
    this.load.image('Pressure Down', 'assets/images/AOE/Pressure Down.png');
    this.load.image('Pressure Left', 'assets/images/AOE/Pressure Left.png');
    this.load.image('Pressure Right', 'assets/images/AOE/Pressure Right.png');
    this.load.image('Gun Disabled', 'assets/images/AOE/Gun Disabled.png');
    this.load.image('Target', 'assets/images/AOE/Target.png');
    this.load.image('SniperBullet', 'assets/images/AOE/Sniper.png');

    //loads images for splash screen
    this.load.image('SplashScreenBackground', 'assets/images/SplashScreen/splashscreen_background.png');
    this.load.spritesheet('clicktostart', 'assets/images/SplashScreen/click_to_start.PNG', 220, 66, 2);

    //load images for main menu
    this.load.image('title',  'assets/images/MainMenu/title.PNG');
    this.load.image('newgame', 'assets/images/MainMenu/newgame.PNG');
    this.load.image('newgame2', 'assets/images/MainMenu/newgame2.PNG');
    this.load.image('levelselect', 'assets/images/MainMenu/levelselect.PNG');
    this.load.image('levelselect2', 'assets/images/MainMenu/levelselect2.PNG');
    this.load.image('help', 'assets/images/MainMenu/help.PNG');
    this.load.image('help2', 'assets/images/MainMenu/help2.PNG');
    this.load.image('controls', 'assets/images/MainMenu/controls.PNG');
    this.load.image('controls2', 'assets/images/MainMenu/controls3.png');
    this.load.image('mainmenu', 'assets/images/MainMenu/mainmenu.png');
    this.load.image('mainmenu2', 'assets/images/MainMenu/mainmenu2.PNG');
    this.load.image('mainmenu', 'assets/images/MainMenu/mainmenu.PNG');
    this.load.image('mainmenu2', 'assets/images/MainMenu/mainmenu2.PNG');
    this.load.image('credits', 'assets/images/MainMenu/credits.PNG');

    //load images for level select
    this.load.image('levelselecttitle', 'assets/images/LevelSelect/levelselect_title.PNG');
    this.load.image('tutorialbutton', 'assets/images/LevelSelect/tutorialbutton.png');
    this.load.image('level2buttonTemp', 'assets/images/LevelSelect/level2buttonTemp.png');
    this.load.image('level1buttonTemp', 'assets/images/LevelSelect/level1buttonTemp.png');
    this.load.image('level3buttonTemp', 'assets/images/LevelSelect/level3buttonTemp.png');
    this.load.image('level4buttonTemp', 'assets/images/LevelSelect/level4buttonTemp.png');
    this.load.image('level5buttonTemp', 'assets/images/LevelSelect/level5buttonTemp.png');

    //load images for controls 
    this.load.image('controlstitle', 'assets/images/Controls/control_title.PNG');
    this.load.image('controls_bg', 'assets/images/Controls/controls_bg.png');
    this.load.spritesheet('keys_sprite', 'assets/images/Controls/keys_sprite.png', 384, 256, 4);
    this.load.image('wasd_text', 'assets/images/Controls/wasd_text.PNG');
    this.load.spritesheet('mouse_sprite', 'assets/images/Controls/mouse_sprite.png', 72, 128, 2);
    this.load.image('click_text', 'assets/images/Controls/click_text.PNG');
    

    //load in-game gui images
    //health blocks
    this.load.image('full bar', 'assets/images/GUI/full_bar_half.png');
    this.load.image('half bar', 'assets/images/GUI/half_bar_half.png');
    this.load.image('empty bar', 'assets/images/GUI/empty_bar_half.png');
    //gui bar (same bar should be used for top and bottom)
    this.load.image('gui bar', 'assets/images/GUI/gui_bar.png');
    //bonus damage indicator
    this.load.image('bonus damage box', 'assets/images/GUI/bonus_damage_box.png');

    //load ability images
    this.load.image('e abiilty', 'assets/images/GUI/e_ability_complete.png');
    this.load.image('f abiilty', 'assets/images/GUI/f_ability_complete.png');
    this.load.image('r abiilty', 'assets/images/GUI/r_ability_complete.png');
    this.load.image('t abiilty', 'assets/images/GUI/t_ability_complete.png');
    this.load.image('g abiilty', 'assets/images/GUI/g_ability_complete.png');

    //load the traps
    this.load.image('trap', 'assets/images/Traps/Trap.png');

    //load images for pause screen
    this.load.image('pause_bg', 'assets/images/Pause/pause_background.png');
    this.load.image('pause_title', 'assets/images/Pause/paused_title.png');
    this.load.image('p_mainmenu', 'assets/images/Pause/mainmenu_p.PNG');
    this.load.image('p_mainmenu2', 'assets/images/Pause/mainmenu2_p.PNG');
    this.load.image('p_controls', 'assets/images/Pause/controls_p.PNG');
    this.load.image('p_controls2', 'assets/images/Pause/controls2_p.PNG');
    this.load.image('p_help', 'assets/images/Pause/help_p.PNG');
    this.load.image('p_help2', 'assets/images/Pause/help2_p.PNG');
    this.load.image('p_resume', 'assets/images/Pause/resume_p.PNG');
    this.load.image('p_resume2', 'assets/images/Pause/resume2_p.PNG');
    this.load.image('p_back', 'assets/images/Pause/back_p.PNG');
    this.load.image('p_back2', 'assets/images/Pause/back2_p.PNG');
    this.load.image("p_controls_text", "assets/images/Pause/controls_text_p.PNG");
    this.load.image("p_controls_text2", "assets/images/Pause/controls_text2_p.PNG");
    
    //load images for help
    this.load.image('help_bg', 'assets/images/Help/help_bg.png');
    this.load.image('help_text', 'assets/images/Help/help_text.PNG');
    this.load.image('help_title', 'assets/images/Help/help_title.PNG');

    //load images for popup
    this.load.image('new_skill_title', 'assets/images/Popup/skill_unlock_popup_title.PNG');
    this.load.image('blue_wave_text', 'assets/images/Popup/blue_wave_text.PNG');
    this.load.image('ok1', 'assets/images/Popup/ok1.PNG');
    this.load.image('ok2', 'assets/images/Popup/ok2.PNG');
    this.load.image('ally_text', 'assets/images/Popup/ally_text.PNG');
    this.load.image('whip', 'assets/images/Popup/whip.PNG');
    this.load.image('lasers', 'assets/images/Popup/lasers.PNG');
    this.load.image('new_attack_mode', 'assets/images/Popup/new_attack_mode.PNG');
    this.load.image('scattershot', 'assets/images/Popup/scattershot.PNG');
    this.load.image("100sp", "assets/images/Popup/100sp.PNG");
    this.load.image("1000sp", "assets/images/Popup/1000sp.PNG");
    this.load.image("300sp", "assets/images/Popup/300sp.PNG");
    this.load.image("500sp", "assets/images/Popup/500sp.PNG");
    this.load.image("ally_h", "assets/images/Popup/ally_h.PNG");
    this.load.image("f_act", "assets/images/Popup/f_act.PNG");
    this.load.image("whip_h", "assets/images/Popup/whip_h.PNG");
    this.load.image("r_act", "assets/images/Popup/r_act.PNG");
    this.load.image("wave_h", "assets/images/Popup/wave_h.PNG");
    this.load.image("e_act", "assets/images/Popup/e_act.PNG");
    this.load.image("lasers_h", "assets/images/Popup/lasers_h.PNG");
    this.load.image("t_act", "assets/images/Popup/t_act.PNG");
    this.load.image("shot_h", "assets/images/Popup/shot_h.PNG");

    //loads music
    this.load.audio('Main', 'assets/music/Splatfest MP3.mp3');
    this.load.audio('Boss1', 'assets/music/Octoling Rendezvous  MP3.mp3');
    this.load.audio('Boss2', 'assets/music/Molduga MP3.mp3');

  },
  create: function() {
    this.state.start('SplashScreen');
  }
};