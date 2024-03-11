let game;
let gameOptions = {
    gemSize: 100,
    fallSpeed: 100,
    destroySpeed: 200,
    boardOffset: {
        x: 100,
        y: 50
    }
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 900,
            height: 900
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}
 
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.spritesheet("gems", "assets/sprites/gems.png", {
            frameWidth: gameOptions.gemSize,
            frameHeight: gameOptions.gemSize
        });
        this.load.spritesheet("arrows", "assets/sprites/arrows.png", {
            frameWidth: gameOptions.gemSize * 3,
            frameHeight: gameOptions.gemSize * 3
        });
    }
    create(){
        this.canPick = true;
        this.dragging = false;
        this.draw3 = new Draw3({
            rows: 8,
            columns: 7,
            items: 6
        });
        this.draw3.generateField();
        this.drawField();
        this.input.on("pointerdown", this.gemSelect, this);
        this.input.on("pointermove", this.drawPath, this);
        this.input.on("pointerup", this.removeGems, this);
    }
    drawField(){
        this.poolArray = [];
        this.arrowArray = [];
        for(let i = 0; i < this.draw3.getRows(); i ++){
            this.arrowArray[i] = [];
            for(let j = 0; j < this.draw3.getColumns(); j ++){
                let posX = gameOptions.boardOffset.x + gameOptions.gemSize * j + gameOptions.gemSize / 2;
                let posY = gameOptions.boardOffset.y + gameOptions.gemSize * i + gameOptions.gemSize / 2
                let gem = this.add.sprite(posX, posY, "gems", this.draw3.valueAt(i, j));
                let arrow = this.add.sprite(posX, posY, "arrows");
                arrow.setDepth(2);
                arrow.visible = false;
                this.arrowArray[i][j] = arrow;
                this.draw3.setCustomData(i, j, gem);
            }
        }
    }
    gemSelect(pointer){
        if(this.canPick){
            let row = Math.floor((pointer.y - gameOptions.boardOffset.y) / gameOptions.gemSize);
            let col = Math.floor((pointer.x - gameOptions.boardOffset.x) / gameOptions.gemSize);
            if(this.draw3.validPick(row, col)){
                this.canPick = false;
                this.draw3.putInChain(row, col)
                this.draw3.customDataOf(row, col).alpha = 0.5;
                this.dragging = true;
            }
        }
    }
    drawPath(pointer){
        if(this.dragging){
            let row = Math.floor((pointer.y - gameOptions.boardOffset.y) / gameOptions.gemSize);
            let col = Math.floor((pointer.x - gameOptions.boardOffset.x) / gameOptions.gemSize);
            if(this.draw3.validPick(row, col)){
                let distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.draw3.customDataOf(row, col).x, this.draw3.customDataOf(row, col).y);
                if(distance < gameOptions.gemSize * 0.4){
                    if(this.draw3.continuesChain(row, col)){
                        this.draw3.customDataOf(row, col).alpha = 0.5;
                        this.draw3.putInChain(row, col);
                        this.displayPath()
                    }
                    else{
                        if(this.draw3.backtracksChain(row, col)){
                            let removedItem = this.draw3.removeLastChainItem();
                            this.draw3.customDataOf(removedItem.row, removedItem.column).alpha = 1;
                            this.hidePath();
                            this.displayPath();
                        }
                    }
                }
            }
        }
    }
    removeGems(){
        if(this.dragging){
            this.hidePath();
            this.dragging = false;
            if(this.draw3.getChainLength() < 3){
                let chain = this.draw3.emptyChain();
                chain.forEach(function(item){
                    this.draw3.customDataOf(item.row, item.column).alpha = 1;
                }.bind(this));
                this.canPick = true;
            }
            else{
                let gemsToRemove = this.draw3.destroyChain();
                let destroyed = 0;
                gemsToRemove.forEach(function(gem){
                    this.poolArray.push(this.draw3.customDataOf(gem.row, gem.column))
                    destroyed ++;
                    this.tweens.add({
                        targets: this.draw3.customDataOf(gem.row, gem.column),
                        alpha: 0,
                        duration: gameOptions.destroySpeed,
                        callbackScope: this,
                        onComplete: function(event, sprite){
                            destroyed --;
                            if(destroyed == 0){
                                this.makeGemsFall();
                            }
                        }
                    });
                }.bind(this));
            }
        }
    }
    makeGemsFall(){
        let moved = 0;
        let fallingMovements = this.draw3.arrangeBoardAfterChain();
        fallingMovements.forEach(function(movement){
            moved ++;
            this.tweens.add({
                targets: this.draw3.customDataOf(movement.row, movement.column),
                y: this.draw3.customDataOf(movement.row, movement.column).y + movement.deltaRow * gameOptions.gemSize,
                duration: gameOptions.fallSpeed * Math.abs(movement.deltaRow),
                callbackScope: this,
                onComplete: function(){
                    moved --;
                    if(moved == 0){
                        this.canPick = true;
                    }
                }
            })
        }.bind(this));
        let replenishMovements = this.draw3.replenishBoard();
        replenishMovements.forEach(function(movement){
            moved ++;
            let sprite = this.poolArray.pop();
            sprite.alpha = 1;
            sprite.y = gameOptions.boardOffset.y + gameOptions.gemSize * (movement.row - movement.deltaRow + 1) - gameOptions.gemSize / 2;
            sprite.x = gameOptions.boardOffset.x + gameOptions.gemSize * movement.column + gameOptions.gemSize / 2,
            sprite.setFrame(this.draw3.valueAt(movement.row, movement.column));
            this.draw3.setCustomData(movement.row, movement.column, sprite);
            this.tweens.add({
                targets: sprite,
                y: gameOptions.boardOffset.y + gameOptions.gemSize * movement.row + gameOptions.gemSize / 2,
                duration: gameOptions.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function(){
                    moved --;
                    if(moved == 0){
                        this.canPick = true;
                    }
                }
            });
        }.bind(this))
    }
    displayPath(){
        let path = this.draw3.getPath();
        path.forEach(function(item){
            this.arrowArray[item.row][item.column].visible = true;
            if(!this.draw3.isDiagonal(item.direction)){
                this.arrowArray[item.row][item.column].setFrame(0);
                this.arrowArray[item.row][item.column].angle = 90 * Math.log2(item.direction);
            }
            else{
                this.arrowArray[item.row][item.column].setFrame(1);
                this.arrowArray[item.row][item.column].angle = 90 * (item.direction - 9 + ((item.direction < 9) ? (item.direction / 3) - 1 - item.direction % 2 : 0));
            }
        }.bind(this))
    }
    hidePath(){
        this.arrowArray.forEach(function(item){
            item.forEach(function(subItem){
                subItem.visible = false;
                subItem.angle = 0;
            })
        })
    }
}
 
class Draw3{
 
    // constructor, simply turns obj information into class properties and creates
    // an array called "chain" which will contain chain information
    constructor(obj){
        if(obj == undefined){
            obj = {}
        }
        this.rows = (obj.rows != undefined) ? obj.rows : 8;
        this.columns = (obj.columns != undefined) ? obj.columns : 7;
        this.items = (obj.items != undefined) ? obj.items : 6;
        this.chain = [];
    }
 
    // returns the number of rows in board
    getRows(){
        return this.rows;
    }
 
    // returns the number of columns in board
    getColumns(){
        return this.columns;
    }
 
    // generates the game field
    generateField(){
        this.gameArray = [];
        for(let i = 0; i < this.getRows(); i ++){
            this.gameArray[i] = [];
            for(let j = 0; j < this.getColumns(); j ++){
                let randomValue = Math.floor(Math.random() * this.items);
                this.gameArray[i][j] = {
                    value: randomValue,
                    isEmpty: false,
                    row: i,
                    column: j
                }
            }
        }
    }
 
    // returns true if the item at (row, column) is a valid pick
    validPick(row, column){
        return row >= 0 && row < this.getRows() && column >= 0 && column < this.getColumns() && this.gameArray[row] != undefined && this.gameArray[row][column] != undefined;
    }
 
    // returns the value of the item at (row, column), or false if it's not a valid pick
    valueAt(row, column){
        if(!this.validPick(row, column)){
            return false;
        }
        return this.gameArray[row][column].value;
    }
 
    // sets a custom data of the item at (row, column)
    setCustomData(row, column, customData){
        this.gameArray[row][column].customData = customData;
    }
 
    // returns the custom data of the item at (row, column)
    customDataOf(row, column){
        return this.gameArray[row][column].customData;
    }
 
    // returns true if the item at (row, column) continues the chain
    continuesChain(row, column){
        return this.getChainValue() == this.valueAt(row, column) && !this.isInChain(row, column) && this.areNext(row, column, this.getLastChainItem().row, this.getLastChainItem().column)
    }
 
    // returns true if the item at (row, column) backtracks the chain
    backtracksChain(row, column){
        return this.getChainLength() > 1 && this.areTheSame(row, column, this.getNthChainItem(this.getChainLength() - 2).row, this.getNthChainItem(this.getChainLength() - 2).column)
    }
 
    // returns the n-th chain item
    getNthChainItem(n){
        return {
            row: this.chain[n].row,
            column: this.chain[n].column
        }
    }
 
    // returns the path connecting all items in chain, as an object containing row, column and direction
    getPath(){
        let path = [];
        if(this.getChainLength() > 1){
            for(let i = 1; i < this.getChainLength(); i++){
                let deltaColumn = this.getNthChainItem(i).column - this.getNthChainItem(i - 1).column;
                let deltaRow = this.getNthChainItem(i).row - this.getNthChainItem(i - 1).row;
                let direction = 0
                direction += (deltaColumn < 0) ? Draw3.LEFT : ((deltaColumn > 0) ? Draw3.RIGHT : 0);
                direction += (deltaRow < 0) ? Draw3.UP : ((deltaRow > 0) ? Draw3.DOWN : 0);
                path.push({
                    row: this.getNthChainItem(i - 1).row,
                    column: this.getNthChainItem(i - 1).column,
                    direction: direction
                });
            }
        }
        return path;
    }
 
    // returns an array with basic directions (UP, DOWN, LEFT, RIGHT) given a direction
    getDirections(n){
        let result = [];
        let base = 1;
        while(base <= n){
            if(base & n){
                result.push(base);
            }
            base <<= 1;
        }
        return result;
    }
 
    // returns true if the number represents a diagonal movement
    isDiagonal(n){
        return this.getDirections(n).length == 2;
    }
 
    // returns the last chain item
    getLastChainItem(){
        return this.getNthChainItem(this.getChainLength() - 1);
    }
 
    // returns chain length
    getChainLength(){
        return this.chain.length;
    }
 
    // returns true if the item at (row, column) is in the chain
    isInChain(row, column){
        for(let i = 0; i < this.getChainLength(); i++){
            let item = this.getNthChainItem(i)
            if(this.areTheSame(row, column, item.row, item.column)){
                return true;
            }
        }
        return false;
    }
 
    // returns the value of items in the chain
    getChainValue(){
        return this.valueAt(this.getNthChainItem(0).row, this.getNthChainItem(0).column)
    }
 
    // puts the item at (row, column) in the chain
    putInChain(row, column){
        this.chain.push({
            row: row,
            column: column
        })
    }
 
    // removes the last chain item and returns it
    removeLastChainItem(){
        return this.chain.pop();
    }
 
    // clears the chain and returns the items
    emptyChain(){
        let result = [];
        this.chain.forEach(function(item){
            result.push(item);
        })
        this.chain = [];
        this.chain.length = 0;
        return result;
    }
 
    // clears the chain, set items as empty and returns the items
    destroyChain(){
        let result = [];
        this.chain.forEach(function(item){
            result.push(item);
            this.setEmpty(item.row, item.column)
        }.bind(this))
        this.chain = [];
        this.chain.length = 0;
        return result;
    }
 
    // checks if the items at (row, column) and (row2, column2) are the same
    areTheSame(row, column, row2, column2){
        return row == row2 && column == column2;
    }
 
    // returns true if two items at (row, column) and (row2, column2) are next to each other horizontally, vertically or diagonally
    areNext(row, column, row2, column2){
        return (Math.abs(row - row2) + Math.abs(column - column2) == 1) || (Math.abs(row - row2) == 1 && Math.abs(column - column2) == 1);
    }
 
    // swap the items at (row, column) and (row2, column2) and returns an object with movement information
    swapItems(row, column, row2, column2){
        let tempObject = Object.assign(this.gameArray[row][column]);
        this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
        this.gameArray[row2][column2] = Object.assign(tempObject);
        return [{
            row: row,
            column: column,
            deltaRow: row - row2,
            deltaColumn: column - column2
        },
        {
            row: row2,
            column: column2,
            deltaRow: row2 - row,
            deltaColumn: column2 - column
        }]
    }
 
    // set the item at (row, column) as empty
    setEmpty(row, column){
        this.gameArray[row][column].isEmpty = true;
    }
 
    // returns true if the item at (row, column) is empty
    isEmpty(row, column){
        return this.gameArray[row][column].isEmpty;
    }
 
    // returns the amount of empty spaces below the item at (row, column)
    emptySpacesBelow(row, column){
        let result = 0;
        if(row != this.getRows()){
            for(let i = row + 1; i < this.getRows(); i ++){
                if(this.isEmpty(i, column)){
                    result ++;
                }
            }
        }
        return result;
    }
 
    // arranges the board after a chain, making items fall down. Returns an object with movement information
    arrangeBoardAfterChain(){
        let result = []
        for(let i = this.getRows() - 2; i >= 0; i --){
            for(let j = 0; j < this.getColumns(); j ++){
                let emptySpaces = this.emptySpacesBelow(i, j);
                if(!this.isEmpty(i, j) && emptySpaces > 0){
                    this.swapItems(i, j, i + emptySpaces, j)
                    result.push({
                        row: i + emptySpaces,
                        column: j,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                }
            }
        }
        return result;
    }
 
    // replenishes the board and returns an object with movement information
    replenishBoard(){
        let result = [];
        for(let i = 0; i < this.getColumns(); i ++){
            if(this.isEmpty(0, i)){
                let emptySpaces = this.emptySpacesBelow(0, i) + 1;
                for(let j = 0; j < emptySpaces; j ++){
                    let randomValue = Math.floor(Math.random() * this.items);
                    result.push({
                        row: j,
                        column: i,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                    this.gameArray[j][i].value = randomValue;
                    this.gameArray[j][i].isEmpty = false;
                }
            }
        }
        return result;
    }
}
Draw3.RIGHT = 1;
Draw3.DOWN = 2;
Draw3.LEFT = 4;
Draw3.UP = 8;