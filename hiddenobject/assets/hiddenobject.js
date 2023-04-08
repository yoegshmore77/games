var game;
let score = 0;
let scoreText;
let match_Count = 0;
let total_Count = 6;
let game_over_screen;
let replay_button;
let poseArray = [];
let tick_poseArray =[];
window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        parent: 'hidden-object',
        width: 1024,
        height: 847,
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
            this.load.image('bg_board', 'assets/images/game_board.png');

             this.load.image('spark0', 'assets/images/red-particle.png');
             this.load.image('spark1', 'assets/images/white-flare-particle.png');

            //this.load.image('header', 'assets/Shadow_Game_Title.png');
            this.load.image('game_over_screen', 'assets/images/game_over_screen.png');
            this.load.image('replay_button', 'assets/images/replay_button.png');
            
            for (var i = 0; i < 15; i++)
            {
                this.load.image('hot_'+i, 'assets/images/hotspot_'+i+'.png');
                this.load.image('tick_'+i, 'assets/images/Right_Tick.png');
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
     total_Count = 15;

    //var my_bg = this.add.image(game.config.width / 2, game.config.height / 2, 'bg_board').setOrigin(0.5,0.5);
    //var header = this.add.image(game.config.width / 2, 32, 'header');
    var my_bg = this.add.image(0, 0, 'bg_board').setOrigin(0,0);

    
     poseArray = [];
     tick_poseArray =[];

     poseArray = [[866, 545],[300, 127],[351, 221],[547, 438],[428, 384],[611, 123],[591,257],[0,556],[120,614],[619,521],[474,114],[807,383],[315,386],[887,271],[630,1]];
     tick_poseArray = [[50, 773],[147, 773],[231, 762],[317, 779],[394, 792],[453,750],[513,773],[578,760],[607,797],[680,773],[761,773],[828,749],[835,808],[898,773],[971,785]]; 
    //console.log(poseArray[0][1]);



    for (var i = 0; i < 15; i++)
    {
        var hot = this.add.image(poseArray[i][0], poseArray[i][1], 'hot_'+i).setOrigin(0,0).setInteractive();
        hot.flag = true;

        hot.alpha = 0.00001;
        var tick = this.add.image(tick_poseArray[i][0], tick_poseArray[i][1], 'tick_'+i).setOrigin(0,0);
        tick.setScale(0.05);
        tick.alpha = 0;
        hot.tick_name = tick;
        


    //for loop ends here---


    }

        //-----click object check-------------------------

    // this.input.on('pointerdown', function (pointer, gameObject) {
    this.input.on('gameobjectdown', (pointer, gameObject,dropZone) => {
        //console.log(gameObject.flag);
        //console.log(gameObject.x);
        //console.log(gameObject.y);

        //this.children.bringToTop(gameObject);
        //gameObject.setTint(0x00ff00);

    });
    this.input.on('gameobjectup', (pointer, gameObject,dropZone) => {
        console.log(gameObject.flag);
            //console.log(pointer);
            //this.scene.scene.start('PlayGameScene');
            //gameObject.clearTint();

            showParticle(gameObject.x+gameObject.width/2 ,gameObject.y + gameObject.height/2);

                gameObject.input.enabled = false;
                gameObject.alpha = 0;
                gameObject.tick_name.alpha = 1;
                score += 100;
                scoreText.setText('Score: ' + score);
                match_Count++;
                    if(match_Count == total_Count){

                        game_over_screen.alpha = 1;
                        replay_button.alpha = 1;

                    }

    });

    //score
    scoreText = this.add.text((game.config.width /2)-350, 10, 'Score: 0', { fontSize: '32px', fill: '#000' });
    game_over_screen = this.add.image(game.config.width / 2, 400, 'game_over_screen');
    replay_button = this.add.image(game.config.width / 2, 550, 'replay_button').setInteractive();
    game_over_screen.alpha = 0;
    replay_button.alpha = 0;
    replay_button.setScale(0.2);
    game_over_screen.setScale(2);

        replay_button.on('pointerdown', function (pointer) {
         //   alert('clicked');
            this.scene.scene.start('PlayGameScene');

        });

        
        //------Emitter
        

        var emitter0 = this.add.particles('spark0').createEmitter({
            x: 400,
            y: 300,
            speed: { min: -400, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'SCREEN',
            //active: false,
            lifespan: 600,
            gravityY: 200,
            quantity: 0,
            duration: 5
        });

        var emitter1 = this.add.particles('spark1').createEmitter({
            x: 400,
            y: 300,
            speed: { min: -400, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'SCREEN',
            //active: false,
            lifespan: 300,
            gravityY: 200,
            quantity: 0,
            duration: 5
        });
    
        
        emitter0.quantity.propertyValue = 0;
        emitter1.quantity.propertyValue = 0;

        function showParticle(x,y){
            console.log('---------emitter called');
            emitter0.setPosition(x, y);
            emitter1.setPosition(x, y);
            //console.log(emitter1.quantity.propertyValue);
            //console.log(emitter1.quantity);
            emitter0.quantity.propertyValue = 100;
            emitter1.quantity.propertyValue = 200;
            emitter0.explode();
            emitter1.explode();


        }



    }
}
