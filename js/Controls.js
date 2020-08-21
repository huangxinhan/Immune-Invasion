var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.Controls = function(game){};

var counter = 0;
var counter2 = 0;

TopDownGame.Controls.prototype = {

    create:function(game) {

        game.stage.backgroundColor = "#dedede";
    

        controlstitle = game.add.tileSprite(game.camera.x + (game.width/2), 150, 207, 63,"controlstitle");
        controlstitle.anchor.setTo(0.5, 0.5);

        controls_bg = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2), 1440, 1440,"controls_bg");
        controls_bg.anchor.setTo(0.5, 0.5);

        keys = game.add.sprite(game.camera.x + (game.width/2)-400, game.camera.y-300 + (game.height/2),"keys_sprite");
        keys.animations.add('playthrough', [0, 1, 2, 3], 1, true);
        keys.animations.play('playthrough');
        keys.anchor.setTo(0.5, 0.5);

        wbc = game.add.sprite(game.camera.x + (game.width/2)+150, game.camera.y-300 + (game.height/2), "WhiteBloodCell");
        wbc.anchor.setTo(0.5, 0.5);
        wbc.animations.add('moveBack', [131, 132, 133, 134, 135, 136, 137, 138, 139, 140], 7, true);
        wbc.animations.add('moveForward', [141, 142, 143, 144, 145, 146, 147, 148, 149, 150], 7, true);
        wbc.animations.add('moveLeft', [151, 152, 153, 154, 155, 156, 157, 158, 159, 160],7,true);
        wbc.animations.add('moveRight', [161, 162, 163, 164, 165, 166, 167, 168, 169, 170], 7, true);

        wasd_text = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2)-100, 303, 39,"wasd_text");
        wasd_text.anchor.setTo(0.5, 0.5);

        var mainMenuButton = game.add.button(game.camera.x + (game.width/2), 1750, 'mainmenu', function() { game.state.start("MainMenu"); });
        mainMenuButton.anchor.setTo(0.5, 0.5);
        mainMenuButton.onInputOver.add(function() { mainMenuButton.loadTexture("mainmenu2"); }, this);
        mainMenuButton.onInputOut.add(function() { mainMenuButton.loadTexture("mainmenu"); }, this);

        mouse = game.add.sprite(game.camera.x + (game.width/2)-400, game.camera.y + (game.height/2)+300,"mouse_sprite");
        mouse.animations.add('playthrough', [0, 1], 1, true);
        mouse.animations.play('playthrough');
        mouse.anchor.setTo(0.5, 0.5);


        wbc2 = game.add.sprite(game.camera.x + (game.width/2), game.camera.y+300 + (game.height/2), "WhiteBloodCell");
        wbc2.anchor.setTo(0.5, 0.5);
        wbc2.animations.add('attack', [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 7, true);
        wbc2.animations.play('attack');

        antibody_bullet = game.add.image(game.camera.x+60 + (game.width/2), wbc2.centerY+20, "AntibodyBullet");    
        antibody_bullet.anchor.setTo(0.5, 0.5);

        click_text = game.add.tileSprite(game.camera.x + (game.width/2), game.camera.y + (game.height/2)+450, 683, 39,"click_text");
        click_text.anchor.setTo(0.5, 0.5);
        
    },

    update:function(game) {

        if (counter2 <= 120) {
            if (counter2 == 0) {
                antibody_bullet.centerX = game.camera.x+60 + (game.width/2);
            }
            else {
                antibody_bullet.centerX += 5;
            }
            counter2++;
        }
        else {
            counter2 = 0;   
        }

        if (counter < 60) {
            if (counter == 0) {
                wbc.animations.play('moveBack');
            }
            wbc.centerY -= 3;
            counter++;
        }
        else if (counter < 120) {
            if (counter == 60) {
                wbc.animations.play('moveRight');
            }
            wbc.centerX += 3;
            counter++;
        }
        else if (counter < 180) {
            if (counter == 120) {
                wbc.animations.play('moveForward');
            }
            wbc.centerY += 3;
            counter++;
        }
        else if (counter < 240) {
            if (counter == 180) {
                wbc.animations.play('moveLeft');
            }
            wbc.centerX -= 3;
            counter++;
        }
        else {
            counter = 0;
        }

    }

}

