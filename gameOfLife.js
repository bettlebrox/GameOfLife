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
		return x+"_"+y;
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
			this.setLiveCell(livePositions[position].x, livePositions[position].y);
		}
	},
	getLiveCells:function(){
		return this.liveCells;
	},
	setLiveCell:function(x, y){
		var cell = new LiveCell();
		cell.init(x, y);
		this.liveCells[cell.hash()] = cell;
	},
	tick:function(){
		this.ngLiveCells = [];
		this.canidateCells = [];
		this._tickCells(this.liveCells, this.ngLiveCells);
		this._tickCells(this.canidateCells, this.ngLiveCells);
		this.liveCells = this.ngLiveCells;
	}
}

