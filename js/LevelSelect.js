var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.LevelSelect = function(game){};

TopDownGame.LevelSelect.prototype = {

    create:function(game) {

        game.stage.backgroundColor = "#dedede";
    
        levelSelectTitle = game.add.tileSprite(game.camera.x + (game.width/2), 250, 301, 52,"levelselecttitle");
        levelSelectTitle.anchor.setTo(0.5, 0.5);

        var tutorialButton = game.add.button(384, 600, 'tutorialbutton', function() { game.selectedLevel = 'TutorialT'; game.state.start("Game"); });
        tutorialButton.anchor.setTo(0.5, 0.5);
        tutorialButton.scale.set(0.75, 0.75);
        tutorialButton.onInputOver.add(function() { tutorialButton.scale.set(1, 1); }, this);
        tutorialButton.onInputOut.add(function() { tutorialButton.scale.set(0.75, 0.75); }, this);

        var level1Button = game.add.button(960, 600, 'level1buttonTemp', function() { game.selectedLevel = 'Level1'; game.state.start("Game"); });
        level1Button.anchor.setTo(0.5, 0.5);
        level1Button.scale.set(0.75, 0.75);
        level1Button.onInputOver.add(function() { level1Button.scale.set(1, 1); }, this);
        level1Button.onInputOut.add(function() { level1Button.scale.set(0.75, 0.75); }, this);


        var level2Button = game.add.button(1536, 600, 'level2buttonTemp', function() { game.selectedLevel = 'Level2'; game.state.start("Game"); });
        level2Button.anchor.setTo(0.5, 0.5);
        level2Button.scale.set(0.75, 0.75);
        level2Button.onInputOver.add(function() { level2Button.scale.set(1, 1); }, this);
        level2Button.onInputOut.add(function() { level2Button.scale.set(0.75, 0.75); }, this);


        var level3Button = game.add.button(384, 1100, 'level3buttonTemp', function() { game.selectedLevel = 'Level3'; game.state.start("Game"); });
        level3Button.anchor.setTo(0.5, 0.5);
        level3Button.scale.set(0.75, 0.75);
        level3Button.onInputOver.add(function() { level3Button.scale.set(1, 1); }, this);
        level3Button.onInputOut.add(function() { level3Button.scale.set(0.75, 0.75); }, this);

        var level4Button = game.add.button(960, 1100, 'level4buttonTemp', function() { game.selectedLevel = 'Level4'; game.state.start("Game"); });
        level4Button.anchor.setTo(0.5, 0.5);
        level4Button.scale.set(0.75, 0.75);
        level4Button.onInputOver.add(function() { level4Button.scale.set(1, 1); }, this);
        level4Button.onInputOut.add(function() { level4Button.scale.set(0.75, 0.75); }, this);

        var level5Button = game.add.button(1536, 1100, 'level5buttonTemp', function() { game.selectedLevel = 'Level5'; game.state.start("Game"); });
        level5Button.anchor.setTo(0.5, 0.5);
        level5Button.scale.set(0.75, 0.75);
        level5Button.onInputOver.add(function() { level5Button.scale.set(1, 1); }, this);
        level5Button.onInputOut.add(function() { level5Button.scale.set(0.75, 0.75); }, this);

        var mainMenuButton = game.add.button(game.camera.x + (game.width/2), 1550, 'mainmenu', function() { game.state.start("MainMenu"); });
        mainMenuButton.anchor.setTo(0.5, 0.5);
        mainMenuButton.onInputOver.add(function() { mainMenuButton.loadTexture("mainmenu2"); }, this);
        mainMenuButton.onInputOut.add(function() { mainMenuButton.loadTexture("mainmenu"); }, this);
    }

}