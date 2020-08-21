var game;                       //phaser game object
var splashScreen;
var mainMenu;
var levelSelectScreen;
var controlsScreen;
var helpScreen;



class Gui{
    constructor(game){
        this.game = game;   //reference to game object
        //load the jsonfiles here
        //this.splashScreenJSON
        //this.mainMenuJSON
        //this.levelSelectScreenJSON
        //this.constrolsScreenJSON
        //this.helpScreenJSON
    }

    loadGui(){
        EZGUI.Theme.load(["path/to/theme"], function(){

        this.splashScreen = EZGUI.create(splashScreen.JSON, 'theme');
          
        this.mainMenu = EZGUI.create(splashScreenJSON, 'theme');
        this.mainMenu.visible(false);
        
        this.levelSelectScreen = EZGUI.create(levelSelectScreen, 'theme');
        this.levelSelectScreen.visible(false);
        
        this.controlsScreen = EZGUI.create(controlsScreenJSON, 'theme');
        this.controlsScreen.visible(false);
         
        this.helpScreen = EZGUI.create(helpScreenJSON, 'theme');
        this.helpScreen.visible(false);
         
        this.setUpGui();
        })
        
    }

    setupGui(){

    }

}