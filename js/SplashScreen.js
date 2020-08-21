var TopDownGame = TopDownGame || {};

TopDownGame.SplashScreen = function(game){};

var counter = 0;

TopDownGame.SplashScreen.prototype = {
    
    create:function(game) {
        background = game.add.tileSprite(0, 0, 1920, 1920, "SplashScreenBackground");
        game.input.onDown.add(startMenu, this);

        cts = game.add.sprite(game.world.centerX, 500, "clicktostart")
        cts.anchor.setTo(0.5, 0.5);
        cts.animations.add("flash");
        cts.animations.play("flash", 2, true);

        wbc = game.add.sprite(2000, 1352, "WhiteBloodCell");
        wbc.anchor.setTo(0.5, 0.5);
        wbc.animations.add('idleLeft', [95, 96, 97, 98, 99, 100, 101, 107, 108, 109, 110, 111, 112], 7, true);
        wbc.animations.add('moveLeft', [151, 152, 153, 154, 155, 156, 157, 158, 159, 160],7,true);
        wbc.animations.add('moveRight', [161, 162, 163, 164, 165, 166, 167, 168, 169, 170], 7, true);

        antibody_bullet1 = game.add.image(1350, wbc.centerY-20, "AntibodyBullet");
        antibody_bullet1.scale.x = -1;
        antibody_bullet1.visible = false;

        antibody_bullet2 = game.add.image(1350, wbc.centerY-20, "AntibodyBullet");
        antibody_bullet2.scale.x = -1;
        antibody_bullet2.visible = false;

        antibody_bullet3 = game.add.image(1350, wbc.centerY-20, "AntibodyBullet");
        antibody_bullet3.scale.x = -1;
        antibody_bullet3.visible = false;

        enemy1 = game.add.sprite(-100, 1352, "CancerCell");
        enemy1.anchor.setTo(0.5, 0.5);
        enemy1.scale.x = -1;
        enemy1.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy1.animations.play('moving');

        enemy2 = game.add.sprite(-100, 1352, "CancerCell");
        enemy2.anchor.setTo(0.5, 0.5);
        enemy2.scale.x = -1;
        enemy2.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy2.animations.play('moving');

        enemy3 = game.add.sprite(-100, 1352, "CancerCell");
        enemy3.anchor.setTo(0.5, 0.5);
        enemy3.scale.x = -1;
        enemy3.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy3.animations.play('moving');

        enemy4 = game.add.sprite(-100, 1352, "CancerCell");
        enemy4.anchor.setTo(0.5, 0.5);
        enemy4.scale.x = -1;
        enemy4.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy4.animations.play('moving');

        enemy5 = game.add.sprite(-100, 1352, "CancerCell");
        enemy5.anchor.setTo(0.5, 0.5);
        enemy5.scale.x = -1;
        enemy5.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy5.animations.play('moving');

        enemy6 = game.add.sprite(-100, 1352, "CancerCell");
        enemy6.anchor.setTo(0.5, 0.5);
        enemy6.scale.x = -1;
        enemy6.animations.add('moving', [0,1,2,3,4,5,6,7,8,9], 5, true);
        enemy6.animations.play('moving');
    },

    update:function() {
        if (counter < 150) {
            if (counter == 0) {
                wbc.centerX = 2000;
                wbc.animations.play('moveLeft');
                enemy1.centerX = -100;
                enemy1.visible = true;
            }
            wbc.centerX -= 4;
            enemy1.centerX += 5;
            counter++;
        }
        else if (counter < 248) {
            if (counter == 150) {
                antibody_bullet1.centerX = 1350;
                antibody_bullet1.visible = true;
            }
            else if (counter == 160) {
                antibody_bullet2.centerX = 1350;
                antibody_bullet2.visible = true;
            }
            else if (counter == 170) {
                antibody_bullet3.centerX = 1350;
                antibody_bullet3.visible = true;
            }
            else if (counter == 215) {
                antibody_bullet1.visible = false;
            }
            else if (counter == 225) {
                antibody_bullet2.visible = false;
            }
            else if (counter == 235) {
                antibody_bullet3.visible = false;
            }
            else if (counter == 236) {
                enemy1.visible = false;
            }
            antibody_bullet1.centerX -= 10;
            antibody_bullet2.centerX -= 10;
            antibody_bullet3.centerX -= 10;
            counter++;
        }
        else if (counter < 370) {
            wbc.centerX -= 5;
            if (counter == 290) {
                enemy2.centerX = -100;
                enemy3.centerX = -100;
                enemy4.centerX = -100;
                enemy5.centerX = -100;
                enemy6.centerX = -100;
            }
            if (counter > 290) {
                enemy2.centerX += 8;
            }
            if (counter > 310) {
                enemy3.centerX += 8;
            }
            if (counter > 330) {
                enemy4.centerX += 8;
            }
            if (counter > 350) {
                enemy5.centerX += 8;
            }
            if (counter > 370) {
                enemy6.centerX += 8;
            }
            counter++;
        }
        else if (counter < 650) {
            if (counter == 370) {
                wbc.animations.play("moveRight");
            }
            wbc.centerX += 8;
            enemy2.centerX += 8;
            enemy3.centerX += 8;
            enemy4.centerX += 8;
            enemy5.centerX += 8;
            enemy6.centerX += 8;
            counter++;
        }
        else {
            counter = 0;
        }
    }
}

function startMenu() {
    this.state.start("MainMenu");
}
