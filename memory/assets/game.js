// game.js - final memory game javascript file
// memory game by David O'Donnel - davidodonnel.com
var game;

// there are 6 animals
// you can change this to be 1 to 6
let numAnimals = 4; 			// 4 is about the right size for my memory :)
let maxImageWidth = 256/2;
let maxImageHeight = 320/2;
let offsetX = 10;
let gameHeight = maxImageHeight * 3.5;
let totalPairs = 6;
let game_over_screen;

window.onload = function() {
	// the largest image is the cardBack 
	// 		256x320 - large enough to hold our animals
	let w = maxImageWidth * numAnimals;

	// add in the border offset for each side
	w += (offsetX * 2);

	// You can change the height value but you need to make sure 
	// 		it's at least tall enough to hold a row of cards 
	// 		above and below the mid-point
	var config = {
		width: w,
		height: gameHeight,
		backgroundColor: 0xd0d0d0,
		parent: 'gameDiv',
		scene: [BootScene, PlayGameScene],
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

	preload() {
		// Dave O made these with photoShop
		this.load.image('bg', 'assets/backgrounds/background.png');
		this.load.image('header', 'assets/images/header.png');
		this.load.image('cardBack', 'assets/images/cardBack.png');
		this.load.image('cardBase', 'assets/images/cardBase.png');
		this.load.image('game_over_screen', 'assets/images/game_over_screen.png');

		// I got these images from:
		// 		http://opengameart.com	
		// 		CoMiGo - https://comigo.itch.io/
		this.load.image('cat', 'assets/images/cat.png');
		this.load.image('chick', 'assets/images/chick.png');
		this.load.image('fox', 'assets/images/fox.png');
		this.load.image('mouse', 'assets/images/mouse.png');
		this.load.image('pig', 'assets/images/pig.png');
		this.load.image('rabbit', 'assets/images/rabbit.png');

		// I got these clips from http://opengameart.com
		this.load.audio('yay', 'assets/sounds/round_end.wav');
		this.load.audio('awe', 'assets/sounds/death.wav');
	}

	create() {
		this.scene.start("PlayGameScene");
	}
}

class PlayGameScene extends Phaser.Scene {
	constructor() {
		super("PlayGameScene");
	}

	create() {
		this.numMatches = 0;		// did we match all of the cards?
		this.canMove = true;		// not if we are doing a 'tween'
		this.chosenCards = [];		// holds the 2 cards being compared

		let x = game.config.width / 2;
		let y = 32;		// this is one half the height of the header image
		this.add.image(400, 300, 'bg');

		this.add.image(x, y, 'header');

		


		// I am only loading 4 of the animals :)
		//let animalArray = ['cat', 'chick', 'pig', 'rabbit', 'cat', 'chick'];
		let animalArray = ['cat','cat', 'chick','chick', 'pig','pig', 'rabbit','rabbit', 'fox','fox', 'mouse','mouse'];

		// create a 'shuffle' array before adding sprites
		// this is a simple way to 'visualize' the board 
		// 		and the values it will hold.
		let a=0;
		let shuffleArray = [];
		for (let row = 0; row < 3; row++) {
			shuffleArray[row] = [];

			for (let col = 0; col < animalArray.length/3; col++) {
				// the value we will use to compare later
				let animalValue = animalArray[a];
				shuffleArray[row][col] = animalValue;
				a++;
			}
		}

		// now do a simple shuffle
		
		for (let n = 0; n < 100; n++) {
			let rowA = Phaser.Math.Between(0, 1);
			let colA = Phaser.Math.Between(0, numAnimals-1);


			let rowB = Phaser.Math.Between(0, 1);
			let colB = Phaser.Math.Between(0, numAnimals-1);

			let rowC = Phaser.Math.Between(0, 2);
			let colC = Phaser.Math.Between(0, numAnimals-1);

			let temp = shuffleArray[rowA][colA];
			shuffleArray[rowA][colA] = shuffleArray[rowB][colB];
			shuffleArray[rowB][colB] = temp;
			shuffleArray[rowB][colB] = shuffleArray[rowC][colC];
			shuffleArray[rowC][colC] = temp;




		}

		// create an array that will hold our board values
		this.boardArray = [];

		// the first one will be at coordinate x:266, y:160
		x = game.config.width / 2;
		y = ((game.config.height / 2) - (maxImageHeight / 2))-50;

		for (let row = 0; row < 3; row++) {
			this.boardArray[row] = [];

			for (let col = 0; col < numAnimals; col++) {
				// each animal value was assigned to a random 
				// position on the board.
				let theAnimalValue = shuffleArray[row][col];

				// calculate the x offset for each image
				// 		the anchor point is at the image center
				x = offsetX + (maxImageWidth * col) + (maxImageWidth / 2);

				let cardBase = this.add.image(x, y, 'cardBase');
					cardBase.setScale(0.5);
				let cardBack = this.add.image(x, y, 'cardBack');
				cardBack.setScale(0.5);
				cardBack.alpha = 1;
				cardBack.depth = 20;

				let animal = this.add.image(x, y, theAnimalValue);
				animal.setScale(0.5);
				animal.depth = 10;

				// create an anonymous object for each member of our boardArray
				// 		we are adding the cardBack sprite because we 
				// 		will be modifying values during game play.
				//
				// 		we are NOT adding the animal image 
				this.boardArray[row][col] = {
					animalSelected: false,
					animalValue: shuffleArray[row][col],
					cardBackSprite: cardBack,
				}
			}

			// now increment our y coordinate value
			y += maxImageHeight;
		}

		game_over_screen = this.add.image(game.config.width / 2, 300, 'game_over_screen');
		game_over_screen.depth = 30;
		game_over_screen.alpha = 0;

		// create a function to handle our mouseClick or touch events
		this.input.on('pointerdown', this.handleMouseDown, this);

		this.yaySound = this.sound.add('yay', { volume: 0.5, });
		this.aweSound = this.sound.add('awe');
	}

	handleMouseDown(mousePointer) {
		// if we are still in 'tween' mode 
		if (!this.canMove) {
			return;
		}

		let w = maxImageWidth;

		// determine where the user clicked on our game canvas
		// 		the x coord will start at 0 and continue for the width of 
		// 			the game canvas
		// 		but y coord will start at the middle of the game canvas
		let row = Math.floor(mousePointer.y / (gameHeight / 2.5));
		let col = Math.floor((mousePointer.x - offsetX) / w);

		//console.log( Math.floor(mousePointer.y / (gameHeight / 3)));
		// make sure row selected is valid
		//row = row < 0 ? row = 0 : row;
		//row = row = 1 ? row = 1 : row;
		//row = row = 2 ? row = 2 : row;

		col = col < 0 ? col = 0 : col;
		col = col > 5 ? col = 5 : col;

		let obj = this.boardArray[row][col];

		// if this animal is already displayed 
		if (obj.animalSelected == true) {
			return;
		}

		// make the cardBackSprite of the selectd object  transparent
		obj.cardBackSprite.alpha = 0;
		obj.animalSelected = true;

		// save the selected object
		this.chosenCards.push(obj);

		if (this.chosenCards.length > 1) {
			this.canMove = false;

			// compare the card values
			let g1 = this.chosenCards[0].animalValue;
			let g2 = this.chosenCards[1].animalValue;

			if (g1 == g2) {
				// match
				this.yaySound.play();

				this.chosenCards.length = 0;
				this.numMatches++;
				this.canMove = true;
			} else {
				// no match
				this.aweSound.play();

				this.time.addEvent({
					delay: 2000,
					callbackScope: this,
					callback: function() {
						for (let n = 0; n < this.chosenCards.length; n++) {
							this.chosenCards[n].cardBackSprite.alpha = 1;

							this.chosenCards[n].animalSelected = false;
						}

						this.chosenCards.length = 0;
						this.canMove = true;
					},
				});
			}
			//console.log(this.numMatches);
		}

		if (this.numMatches == totalPairs) {
			console.log(this.numMatches);
			// game over - restart new game
			game_over_screen.alpha = 1;
			this.time.addEvent({
				delay: 5000,
				callbackScope: this,
				callback: function() {
					this.scene.start('PlayGameScene');
				},
			});
		}
	}
}