
const cBoard = {
	props: [ "state" ],
	methods: {
		/*
		async performChanges() {
			let promises = [];
			for (let change of this.changeQueue) {
				if (change.change == "install") {
					let board = this.board;
					let preAction = function() {
						board[change.x + ", " + change.y] += " dest";
					};
					let setupPostAction = function(resolve) { 
						let postAction = function() {
								board[change.x + ", " + change.y] = change.type;
								resolve();
						};
						setTimeout(postAction, 750);
					};
					preAction();
					promises.push(new Promise(setupPostAction));
				}

				if (change.change == "move") {
					let board = this.board;
					let preAction = function() {
						board[change.xe + ", " + change.ye] += " dest";
						board[change.xs + ", " + change.ys] += " src";
					};
					let setupPostAction = function(resolve) {
						let postAction = function() {
							let type = board[change.xs + ", " + change.ys];
							board[change.xe + ", " + change.ye] = type;
							board[change.xs + ", " + change.ys] = "empty";
							resolve();
						};
						setTimeout(postAction, 750);
					}
					preAction();
					promises.push(new Promise(setupPostAction));
				}

				if (change.change == "drop") {
					let board = this.board;
					let preAction = function() {
						board[change.xe + ", " + change.ye] += " dest";
					};
					let setupPostAction = function(resolve) {
						let postAction = function() {
							board[change.xe + ", " + change.ye] = change.type;
							resolve();
						};
						setInterval(postAction, 750);
					}
					preAction();
					promises.push(new Promise(setupPostAction));
				}
			};
			await Promise.all(promises);
		},
		install(x, y, type) {
			this.changeQueue.push({
				change: "install",
				x: x,
				y: y,
				type: type
			});
		},
		move(xs, ys, xe, ye) {
			this.changeQueue.push({
				change: "move",
				xs: xs,
				ys: ys,
				xe: xe,
				ye: ye
			});
		},
		dropFromAbove(x, type) {
			let candy = this.state.candies[x + " " + y];
			let empty = y => candy.colour == "empty";
			let y;
			for (y = 1; y <= 10 && empty(y); ++y);
			if (y == 1) return false;

			this.changeQueue.push({
				change: "drop",
				xe: x,
				ye: y - 1,
				type: type
			});
			return true;
		}
		*/
		candyAt(x, y) {
			return this.state.candies[x + ' ' + y];
		},
		highlightedAt(x, y) {
			return this.state.highlights.includes(this.candyAt(x, y));
		}
	},
	data() {
		return {
			ys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			xs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		};
	},
	components: {
		Tile: cTile
	},
	template: `
		<div class="board">
			<div v-for="y in ys">
				<Tile v-for="x in xs"
					:x="x"
					:y="y"
					:candy="candyAt(x, y)"
					:highlighted="highlightedAt(x, y)" />
			</div>
		</div>
	`
};

