var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.Help = function(game){};

TopDownGame.Help.prototype = {

    create:function(game) {
        
        game.stage.backgroundColor = "#dedede";
    

        help_bg = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 1440, 1440,"help_bg");
        help_bg.anchor.setTo(0.5, 0.5);

        help_text = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 731, 248,"help_text");
        help_text.anchor.setTo(0.5, 0.5);
        help_text.scale.x = 1.75;
        help_text.scale.y = 1.75;

        help_title = game.add.tileSprite(game.camera.x + (game.width/2), 150, 122, 71,"help_title");
        help_title.anchor.setTo(0.5, 0.5);


        var mainMenuButton = game.add.button(game.camera.x + (game.width/2), 1750, 'mainmenu', function() { game.state.start("MainMenu"); });
        mainMenuButton.anchor.setTo(0.5, 0.5);
        mainMenuButton.onInputOver.add(function() { mainMenuButton.loadTexture("mainmenu2"); }, this);
        mainMenuButton.onInputOut.add(function() { mainMenuButton.loadTexture("mainmenu"); }, this);

    }

}