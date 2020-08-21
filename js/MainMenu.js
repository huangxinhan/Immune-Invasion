var TopDownGame = TopDownGame || {};

TopDownGame.MainMenu = function(game){};

TopDownGame.MainMenu.prototype = {
    
    create:function(game) {
       
        // add background image
        game.selectedLevel = 'Level1';
        game.stage.backgroundColor = "#dedede";

        //add logo
        logo = game.add.tileSprite(game.camera.x + (game.width/2), 350, 437, 200,"title");
        logo.anchor.setTo(0.5, 0.5);

        //add new game button
        var newGameButton = game.add.button(200, 800, 'newgame', function() { game.selectedLevel = 'TutorialT'; game.state.start("Game"); })
        newGameButton.onInputOver.add(function() { newGameButton.loadTexture("newgame2"); }, this);
        newGameButton.onInputOut.add(function() { newGameButton.loadTexture("newgame"); }, this);

        var levelSelectButton = game.add.button(200, 950, 'levelselect', function() { game.state.start("LevelSelect"); })
        levelSelectButton.onInputOver.add(function() { levelSelectButton.loadTexture("levelselect2"); }, this);
        levelSelectButton.onInputOut.add(function() { levelSelectButton.loadTexture("levelselect"); }, this);
        
        var controlsButton = game.add.button(200, 1100, 'controls', function() { game.state.start("Controls"); })
        controlsButton.onInputOver.add(function() { controlsButton.loadTexture("controls2"); }, this);
        controlsButton.onInputOut.add(function() { controlsButton.loadTexture("controls"); }, this);

        var helpButton = game.add.button(200, 1250, 'help', function() { game.state.start("Help"); })
        helpButton.onInputOver.add(function() { helpButton.loadTexture("help2"); }, this);
        helpButton.onInputOut.add(function() { helpButton.loadTexture("help"); }, this);

        //add sprite
        wbc = game.add.sprite(1300, 1100, "WhiteBloodCell");
        wbc.scale.setTo(8,8);
        wbc.anchor.setTo(0.5, 0.5);
        wbc.animations.add('idleForward', [77,78,79,80,81,82,90,91,92,93,94], 1, true);
        wbc.animations.play("idleForward", 6, true);


        credits = game.add.tileSprite(960, 1800, 685, 37,"credits");
        credits.anchor.setTo(0.5, 0.5);
    },

    update:function() {

    }

}

