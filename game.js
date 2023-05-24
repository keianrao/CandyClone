
log = document.getElementById("log");
//log.println = string => log.innerText += string + "\n";
log.println = string => log.innerText = string + "\n" + log.innerText;
log.println("Ready.");

cTile = {
	props: {
		x: Number,
		y: Number,
		type: String,
		state: String
	},
	computed: {
		classes() {
			return this.state;
		},
	},
	template: `
		<div class="tile" :class="classes">
			<img :src="type + '.png'">
			{{ x }}, {{ y }}
		</div>
	`
};

cBoard = {
	methods: {
		lookupType(x, y) {
			let type = this.board[x + ", " + y];
			type = type.split(" ")[0];
			return type;
		},
		lookupState(x, y) {
			let type = this.board[x + ", " + y];
			let state =
				(type.includes(" src") ? "src" : "")
				+ (type.includes(" dest") ? "dest" : "");
			return state;
		},
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
			let empty = y => this.lookupType(x, y) == "empty";
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
		},
		generateRandomType() {
			let roll = Math.floor(Math.random() * 3);
			let type = ["empty", "blue", "orange"][roll];
			return type;
		}
	},
	data() {
		let board = {};
		for (let y = 1; y <= 10; ++y)
		for (let x = 1; x <= 10; ++x) {
			board[x + ", " + y] = this.generateRandomType();
		}

		let ys = [], xs = [];
		for (let y = 1; y <= 10; ++y) ys.push(y);
		for (let x = 1; x <= 10; ++x) xs.push(x);
		
		return {
			board: board,
			changeQueue: [],
			ys: ys, xs: xs
		};
	},
	components: {
		Tile: cTile
	},
	template: `
		<div class="board">
			<div v-for="y in ys">
				<Tile v-for="x in xs"
					:x="x" :y="y"
					:type="lookupType(x, y)"
					:state="lookupState(x, y)" />
			</div>
		</div>
	`
};

cEffects = {
	template: `
		<canvas class="effects"></canvas>
	`
};

cGame = {
	data() {
		let horizontal3 = {
			right: [
				["same", "any"],
				["same", "any"],
				["diff", "any"]
			],
			product: "empty"
		};
		let vertical3 = {
			bottom: [
				["same", "any"],
				["same", "any"],
				["diff", "any"]
			],
			product: "empty"
		};
		let horizontal4 = {
			bottom: [
				["same", "any"],
				["same", "any"],
				["same", "any"],
				["diff", "any"]
			],
			product: "same striped"
		};
		let vertical4 = {
			bottom: [
				["same", "any"],
				["same", "any"],
				["same", "any"],
				["diff", "any"]
			],
			product: "same striped"
		};
		return {
			patterns: [
				horizontal3,
				vertical3,
				horizontal4,
				vertical4
			]
		};
	},
	computed: {
		classes() {
			return {
				debug: true
			};
		}
	},
	methods: {
		window(x, y) {
			let board = this.$refs["board"];
			
			function walk(dx, dy) {
				let returnee = [];
				for (let n = 1; true; ++n) {
					let xNext = x + (n * dx);
					let yNext = y + (n * dy);
					let oob = xNext < 1 || xNext > 10 || yNext < 1 || yNext > 10;
					if (oob) break;
					let next = board.lookupType(xNext, yNext);
					if (next[0] == "empty") break;
					if (n > 1) {
						let same_colour = next[0] == returnee[0];
						if (!same_colour) break;
					}
					returnee.push(next);
				}
				return returnee;
			};
			return {
				x: x, y: y,
				core: board.lookupType(x, y),
				right: walk(+1, 0),
				bottom: walk(0, +1)
				// I don't bother with top and left because I check
				// for patterns from top-left down to bottom-right,
				// so I would always trigger top-left corner of any
				// pattern first. 
			};
		},
		match(window, patterns) {
			function direction_match(direction_name, pattern) {
				let direction_in_pattern = pattern[direction_name];
				let direction_in_window = window[direction_name];
				
				let ok = true;
				for (let o = 0; o < pattern[direction_name].length; ++o) {	
					let required = direction_in_pattern[o];
					let present = direction_in_window[o];

					if (present == undefined) {
						ok &=
							required[0] == "diff"
							&& required[1] == "any";
						continue;						
					}
					if (required[0] == "same")
						ok &= present[0] == window.core[0];
					if (required[0] == "diff")
						ok &= present[0] != window.core[0];
					if (required[1] == "striped")
						ok &= present[1] == "striped";
				}

				return ok;
			}

			let chosen = null;
			for (let pattern of patterns) {
				if (pattern.right)
					if (!direction_match("right", pattern)) continue;
				if (pattern.bottom)
					if (!direction_match("bottom", pattern)) continue;
				chosen = pattern;
			}
			return chosen;
		},
		victory() {
			return false;
		},
		async explode() {
			// For each triggered candy
			// Identify their zone of destruction
			// Eliminate candies in the zone
			return false;
		},
		async combine() {
			let board = this.$refs["board"];

			for (let y = 1; y <= 10; ++y)
			for (let x = 1; x <= 10; ++x) {
				let combination = this.match(this.window(x, y), this.patterns);
				if (!combination) continue;
				// We need to determine deletion region
			}
			await board.performChanges();

			return false;
		},
		async gravity() {
			let board = this.$refs["board"];
			let gravity = false;
			
			for (let x = 1; x <= 10; ++x)
			for (let ye = 10; ye >= 1; --ye)
			{
				// For every column, starting from bottom..
				// (This is an imperative algorithm that is
				// unsuitable for our two-step transition,
				// as upper droppees have outdated information
				// of what will be below them. We should just
				// handle a column of candies as a packable group.

				if (board.lookupType(x, ye) != "empty") continue;

				let empty = ys => board.lookupType(x, ys) == "empty";
				let ys;
				for (ys = ye - 1; ys >= 1 && empty(ys); --ys);

				if (ys >= 1)
				{
					console.log("Moving " + x + ", " + ys + " to " + ye + "(" + board.lookupType(x, ye) + ")");
					board.move(x, ys, x, ye);
					// Possibly remove candy from play
					gravity = true;
				}
			}
			await board.performChanges();

			return gravity;
		},
		async generate() {
			let board = this.$refs.board;
			let generate = false;

			for (let x = 1; x <= 10; ++x) {
				for (let stopped = false; !stopped; ) {
					let type = board.generateRandomType();
					stopped = !board.dropFromAbove(x, type);
					if (!stopped) generate = true;
				}
			}
			await board.performChanges();

			return generate;
		},
		async evaluateLoop() {
			do {
				let changed = false;
				//changed |= this.combine();
				//console.log("COMBINE " + changed);
				changed |= await this.gravity();
				if (!changed) break;
			} while (true);
		},
	},
	mounted() {
		this.evaluateLoop();
	},
	components: {
		Board: cBoard,
		Effects: cEffects
	},
	template: `
		<Board :class="classes" ref="board" />
		<Effects :class="classes" />
	`
};

Vue.createApp(cGame).mount("#game");

