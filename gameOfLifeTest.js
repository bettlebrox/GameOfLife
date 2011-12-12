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
			this.board.init([{"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},
								{"x":1,"y":2},{"x":2,"y":2},{"x":3,"y":2},
									{"x":1,"y":3},{"x":2,"y":3}]);
			this.board.tick();
			assertLiveCell(this.board, 1, 1);
			assertLiveCell(this.board, 3, 1);
			assertLiveCell(this.board, 1, 3);
			assertDeadCell(this.board, 2, 1);
			assertDeadCell(this.board, 1, 2);
			assertDeadCell(this.board, 2, 2);
			assertDeadCell(this.board, 3, 2);
			assertDeadCell(this.board, 2, 3);
		});
		test("Board unusual reproduction", function(){
			this.board.init([{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4},
								{"x":2,"y":5}]);
			this.board.tick();
			assertLiveCell(this.board, 2, 3);
			assertLiveCell(this.board, 2, 4);
			assertLiveCell(this.board, 1, 3);
			assertLiveCell(this.board, 1, 4);
			assertLiveCell(this.board, 3, 3);
			assertLiveCell(this.board, 3, 4);
			assertDeadCell(this.board, 2, 2);
			assertDeadCell(this.board, 2, 5);
			assertDeadCell(this.board, -1, 3);
			assertDeadCell(this.board, 4, 3);
		});
		
		test("Board Lives - Rule 2", function(){
			this.board.init([{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3}]);
			this.board.tick();
			assertLiveCell(this.board, 1, 2);
			assertDeadCell(this.board, 1, 1);
			assertDeadCell(this.board, 1, 3);
			this.board.init([{"x":1,"y":1},{"x":2,"y":1},{"x":1,"y":2}]);
			this.board.tick();
			assertLiveCell(this.board, 1, 1);
			assertLiveCell(this.board, 1, 2);
			assertLiveCell(this.board, 2, 1);
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
