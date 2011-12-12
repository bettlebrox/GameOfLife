Cell = {
	init:function(x, y){
		this.x = x;
		this.y = y;
	},
	getPosition:function(){
		return {"x":this.x, "y":this.y};
	},
	hash:function(){
		return Cell.Hash(this.x, this.y);
	},
	Hash:function(x, y){
		return x+","+y;
	},
	tick:function(numLiveNeighbours){
		 var cell;
		 cell = this.getNextGeneration(numLiveNeighbours);
		 cell.init(this.x, this.y);
		 return cell;
	}
	
}
DeadCell = function(){
	this.numLiveNeighbours = 0;
}
DeadCell.prototype = {
	getNextGeneration:function(numLiveNeighbours){
		 if(!numLiveNeighbours){
			 var numLiveNeighbours = this.numLiveNeighbours;
		 }
		 if(numLiveNeighbours==3){
		 	return new LiveCell();
		 }else{
			return new DeadCell();
		 }
	},
	incrementNeighbours:function(){
		this.numLiveNeighbours++;
	}
}
$.extend(DeadCell.prototype, Cell);

LiveCell = function(){}
LiveCell.prototype = {
	getNextGeneration:function(numLiveNeighbours){
		if(numLiveNeighbours<2){
			return new DeadCell();
		}else if (numLiveNeighbours<=3){
			return new LiveCell();
		}else{
			return new DeadCell();
		}
	}
}
$.extend(LiveCell.prototype, Cell);

Board = function(){
	/**
	 * returns the count of neighbours of live cell x,y
	 * adds/increments the count of neighbouring canidate cells
	 */
	this._tickLiveCell = function(cell){
		var count =0;
		var x = cell.getPosition().x;
		var y = cell.getPosition().y;
		for(var i=x-1; i<=x+1; i++){
			for(var j=y-1; j<=y+1; j++){
				if(!(i==x&&j==y)){
					if(this._getCell(this.liveCells, i, j)){
						//i,j is a live neighbour
						count++;
					}else{
						//i,j is a canidate cell
						this._incrementCanidateCell(i,j);
					}
				}
			}
		}
		return cell.tick(count);
	};
	this._getCell = function(cells, x, y){
		return cells[Cell.Hash(x,y)];
	}
	/**
	 * Increment the count of neighbours of the dead cell x, y
	 */
	this._incrementCanidateCell = function(x, y){
		var hash = Cell.Hash(x, y);
		if(!this.canidateCells[hash]){
			this.canidateCells[hash] = new DeadCell();
			this.canidateCells[hash].init(x, y);
		}
		this.canidateCells[hash].incrementNeighbours();
	},
	this._tickCells = function(cells, ngCells){
		for(var cell in cells){
			var ngCell;
			if(cells[cell] instanceof LiveCell){
				ngCell = this._tickLiveCell(cells[cell]);
			}else{
				ngCell = cells[cell].tick();
			}
			if(ngCell instanceof LiveCell){
				ngCells[ngCell.hash()] = ngCell;
			}
		}
	}

}
Board.prototype = {
	init:function(livePositions){
		this.liveCells = [];
		this.canidateCells = [];
		for(position in livePositions){
			var cell = new LiveCell();
			cell.init(livePositions[position].x, livePositions[position].y);
			this.liveCells[cell.hash()] = cell;
		}
	},
	getLiveCells:function(){
		return this.liveCells;
	},
	tick:function(){
		this.ngLiveCells = [];
		this._tickCells(this.liveCells, this.ngLiveCells);
		this._tickCells(this.canidateCells, this.ngLiveCells);
		this.liveCells = this.ngLiveCells;
	}
}

function assertExistsAndCorrectPosition(cell, x, y){
	ok(cell, "cell exists!");
	equal(cell.getPosition()["x"], x, "cell has correct x position");
	equal(cell.getPosition()["y"], y, "cell has correct y position");
}

function assertLiveCell(board, x, y){
	ok(board.getLiveCells()[Cell.Hash(x, y)] instanceof LiveCell, "cell is alive");
}

function assertDeadCell(board, x, y){
	ok(!board.getLiveCells()[Cell.Hash(x, y)], "cell is not alive");
}


$("document").ready(function(){
		module("GameOfLife", {
			setup: function(){
				this.cell  = new LiveCell();
				this.cell.init(1,1);
				this.board = new Board();
		   }
		});

		test("Board", function(){
			this.board.init([{"x":1,"y":1},{"x":2,"y":3}]);
			ok(this.board, "this.board exists!");
			assertLiveCell(this.board, 1, 1);
			assertLiveCell(this.board, 2, 3);
			assertDeadCell(this.board, 4, 5);
		});
		
		test("Board Under Population - Rule 1", function(){
			this.board.init([{"x":1,"y":1}]);
			this.board.tick();
			ok(this.board, "this.board exists!");
			deepEqual(this.board.getLiveCells(), [], "has correct live cells");
			assertDeadCell(this.board, 1, 1);
		});
		
		test("Board Lives - Rule 2", function(){
			this.board.init([{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3}]);
			this.board.tick();
			assertLiveCell(this.board, 1, 2);
			assertDeadCell(this.board, 1, 1);
			assertDeadCell(this.board, 1, 3);
		});
		
		test("Board Overcrowding - Rule 3", function(){
			this.board.init([{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3}, {"x":2,"y":2}]);
			this.board.tick();
			assertLiveCell(this.board, 1, 2);
		});
		
		test("Board Reproduction - Rule 4 ", function(){
			this.board.init([{"x":1,"y":1},{"x":1,"y":3},{"x":3,"y":1}]);
			this.board.tick();
			assertLiveCell(this.board,2,2);
		});
				
		test("LiveCell", function(){
			assertExistsAndCorrectPosition(this.cell, 1, 1);
		});
		test("LiveCell Under Population - Rule 1", function(){
			var newCell = this.cell.tick(0);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof DeadCell, "cell dies from under population");
			var newCell = this.cell.tick(1);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof DeadCell, "cell dies from under population");
			var newCell = this.cell.tick(2);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof LiveCell, "cell lives");
		});
		test("LiveCell Lives - Rule 2", function(){
			var newCell = this.cell.tick(2);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof LiveCell, "cell lives");
			var newCell = this.cell.tick(3);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof LiveCell, "cell lives");

		});
		test("LiveCell OverCrowding - Rule 3", function(){
			var newCell = this.cell.tick(4);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof DeadCell, "cell dies");
			var newCell = this.cell.tick(5);
			assertExistsAndCorrectPosition(newCell, this.cell.getPosition()["x"], this.cell.getPosition()["y"]);
			ok(newCell instanceof DeadCell, "cell dies");

		});
		test("DeadCell Reproduction - Rule 4", function(){
			var cell = new DeadCell();
			cell.init(2,2);
			assertExistsAndCorrectPosition(cell, 2, 2);
			var newCell = cell.tick(2);
			ok(newCell instanceof DeadCell, "cell stays dead");
			newCell = cell.tick(3);
			ok(newCell instanceof LiveCell, "cell is born");
			newCell = cell.tick(4);
			ok(newCell instanceof DeadCell, "cell stays dead");

		});
			
	});
