
log = document.getElementById("log");
log.println = string => log.innerText += string + "\n";
log.println("Ready.");

cTile = {
	props: {
		x: Number,
		y: Number,
		type: String
	},
	template: `
		<div class="tile">
			<img :src="type + '.png'">
			{{ x }}, {{ y }}
		</div>
	`
};

cBoard = {
	methods: {
		lookup(x, y) {
			return this.board[x + ", " + y];
		},
		install(x, y, type) {
			this.board[x + ", " + y] = type;
		},
		mergeDelete(x, y, mergeXVec, mergeYVec) {
			this.board[x + ", " + y] = "empty";
		},
		dropFromAbove(x, type) {
			let y;
			for (y = 1; y <= 10; ++y)
				if (this.lookup(x, y) != "empty")
					break;

			if (y == 1) return false;
			this.board[x + ", " + (y - 1)] = type;
			return true;
		},
		move(xs, ys, xe, ye) {
			this.board[xe + ", " + ye] = this.board[xs + ", " + ys];
			this.board[xs + ", " + ys] = "empty";
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
					:type="board[x + ', ' + y] " />
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
					let next = board.lookup(xNext, yNext).split(" ");
					if (next[0] == "empty") break;
					if (n > 1) {
						let same_colour = next[0] == returnee[0];
						if (!same_colour) break;
					}
					returnee.push(next);
				}
				return returnee;
			}
			return {
				x: x, y: y,
				core: board.lookup(x, y).split(" "),
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
		explode() {
			// For each triggered candy
			// Identify their zone of destruction
			// Eliminate candies in the zone
			return false;
		},
		combine() {
			let board = this.$refs["board"];

			for (let y = 1; y <= 10; ++y)
			for (let x = 1; x <= 10; ++x) {
				let combination = this.match(this.window(x, y), this.patterns);
				if (!combination) continue;
				// We need to determine deletion region
			}
		},
		gravity() {
			let board = this.$refs["board"];
			let gravity = false;
			
			for (let x = 1; x <= 10; ++x)
			for (let y = 10; y >= 1; --y)
			{
				let destType = board.lookup(x, y);
				if (destType != "empty") continue;

				let src = null;
				for (let ys = y - 1; ys >= 1; --ys)
				{
					let srcType = board.lookup(x, ys);
					if (srcType != "empty") {
						src = { x: x, y: ys };
						break;
					}
				}
				if (src)
				{
					board.move(src.x, src.y, x, y);
					// Possibly remove candy from play
					gravity = true;
				}
			}

			return gravity;
		},
		generate() {
			let board = this.$refs.board;
			let generate = false;

			for (let x = 1; x <= 10; ++x) {
				for (let stopped = false; !stopped; ) {
					let type = board.generateRandomType();
					stopped = !board.dropFromAbove(x, type);
					if (!stopped) generate = true;
				}
			}

			return generate;
		},
		evaluateLoop() {
			do {
				let changed = false;
				changed |= this.explode();				
				if (changed) continue;
				changed |= this.combine();
				//changed |= this.gravity();
				//changed |= this.generate();
				if (changed) continue;
			} while (false);
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

