var game;
let score = 0;
let scoreText;
let match_Count = 0;
let total_Count = 6;
let game_over_screen;
let replay_button;
let shuffleArray;
let shuffleArrayPos;
window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: 500,
        height: 800,
        backgroundColor: 0xd0d0d0,
        scene: [BootScene, PlayGameScene],
        /*scene: {
            preload: BootScene,
            create: PlayGameScene
        },*/
        scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                //width: 800,
                //height: 600
            }
    }

    game = new Phaser.Game(config);
    window.focus();
}

class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

         preload (){
            this.load.image('bg', 'assets/bg_500_800.png');
            this.load.image('header', 'assets/Shadow_Game_Title.png');
            this.load.image('game_over_screen', 'assets/game_over_screen.png');
            this.load.image('replay_button', 'assets/replay_button.png');
            
            for (var i = 0; i < 6; i++)
            {
                this.load.image('a_'+i, 'assets/a_'+i+'.png');
                this.load.image('a_s_'+i, 'assets/s_'+i+'.png');
                this.load.image('s_'+i, 'assets/s_'+i+'.png');
            }
        }

        create() {
            this.scene.start("PlayGameScene");
        }
}

class PlayGameScene extends Phaser.Scene {
    constructor() {
        super("PlayGameScene");
    }

 create (){

     score = 0;
     match_Count = 0;
     total_Count = 6;

    var my_bg = this.add.image(250, 400, 'bg');
    var header = this.add.image(game.config.width / 2, 32, 'header');
    
     shuffleArray = [];
     shuffleArrayPos =[];


    var x = 100;
    var y = 150;

    for (var i = 0; i < 6; i++)
    {
        
        //add shadow
        var block_shadow = this.add.image(x, y, 'a_s_'+i).setScale(0.5);



        //add draggable images
         var block = this.add.image(x, y,'a_'+i).setInteractive();       
         this.input.setDraggable(block);
         block.setScale(0.5);

         block.block_ID = i;
         block.flag = true;

         //var target_block = this.add.image(x+200,y,'s_'+i).setInteractive();
         //this.input.setDraggable(target_block);
         //target_block.setScale(0.5);

         //y+=100;

    //  A drop zone----------------
    var zone = this.add.image(x+300, y,'s_'+i).setInteractive();
    shuffleArray[i] = zone;
    shuffleArrayPos[i] = y;
    y+=100;
    zone.flag=true;
    zone.setScale(0.5);
    zone.input.dropZone = true;
    zone.target_ID = i;

    this.input.on('dragstart', function (pointer, gameObject) {

        this.children.bringToTop(gameObject);

    }, this);

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

    });

    this.input.on('dragenter', function (pointer, gameObject, dropZone) {
        if(dropZone.flag == true){
        //zone.setTint(0x00ff00);
        dropZone.setTint(0x00ff00);
        }

    });

    this.input.on('dragleave', function (pointer, gameObject, dropZone) {

        //zone.clearTint();
        dropZone.clearTint();

    });

    this.input.on('drop', function (pointer, gameObject, dropZone) {

        console.log(gameObject.block_ID+'====='+dropZone.target_ID);

        if(gameObject.flag == true){
            

            if(gameObject.block_ID == dropZone.target_ID){

                gameObject.x = dropZone.x;
                gameObject.y = dropZone.y;
                gameObject.setScale(0.5);
                gameObject.flag = false;
                gameObject.input.enabled = false;
                dropZone.flag = false;
                
                //zone.clearTint();
                dropZone.clearTint();

                score += 100;
                scoreText.setText('Score: ' + score);
                match_Count++;
                    if(match_Count == total_Count){

                        game_over_screen.alpha = 1;
                        replay_button.alpha = 1;

                        /*this.time.addEvent({
                            delay: 5000,
                            callbackScope: this,
                            callback: function() {
                                this.scene.start('PlayGameScene');
                                

                            },
                        });*/
                        //timedEvent = this.time.delayedCall(3000, onEvent, [], this);

                    }
        }
        else{
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
            dropZone.clearTint();
        }

    }

    });

    this.input.on('dragend', function (pointer, gameObject, dropped) {

        if (!dropped)
        {
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
        }

    });

    //for loop ends here---
    }

    //score
    scoreText = this.add.text(50+game.config.width / 3, 70, 'Score: 0', { fontSize: '16px', fill: '#000' });
    game_over_screen = this.add.image(game.config.width / 2, 400, 'game_over_screen');
    replay_button = this.add.image(game.config.width / 2, 500, 'replay_button').setInteractive();
    game_over_screen.alpha = 0;
    replay_button.alpha = 0;
    replay_button.setScale(0.1);

        replay_button.on('pointerdown', function (pointer) {

            this.scene.scene.start('PlayGameScene');

        });

        //console.log(shuffleArray);
        //console.log(shuffleArray[0]);
        Phaser.Utils.Array.Shuffle(shuffleArrayPos);
        //console.log(shuffleArray);

        for(var i=0; i<6; i++){
           shuffleArray[i].y = shuffleArrayPos[i];
        }


}
}
