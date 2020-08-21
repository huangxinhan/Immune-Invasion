//This main.js sets up the game and creates the dimensions of the game world

var TopDownGame = TopDownGame || {};
//The game dimensions are currently set at 1920 x 1920 pixels 
TopDownGame.game = new Phaser.Game(1920, 1920, Phaser.GRAPHICS, ''); 

//disable right clicks
document.addEventListener('contextmenu', event => event.preventDefault());

TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('SplashScreen', TopDownGame.SplashScreen);
TopDownGame.game.state.add('MainMenu', TopDownGame.MainMenu);
TopDownGame.game.state.add('LevelSelect', TopDownGame.LevelSelect);
TopDownGame.game.state.add('Controls', TopDownGame.Controls);
TopDownGame.game.state.add('Help', TopDownGame.Help);
TopDownGame.game.state.add('Game', TopDownGame.Game);
TopDownGame.game.state.start('Boot'); 