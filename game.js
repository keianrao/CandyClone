
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
	methods: {
		victory() {
			return false;
		},
		destroy() {
			// For each triggered candy
			// Identify their zone of destruction
			// Eliminate candies in the zone
			// Return true if destruction happened
			return false;
		},
		combine(userXVec, userYVec) {
			let board = this.$refs["board"];
			
			let horizontal = function(x, y) {
				let deletees = [
					{ x: x + 0, y: y, type: board.lookup(x + 0, y) },
					{ x: x + 1, y: y, type: board.lookup(x + 1, y) },
					{ x: x + 2, y: y, type: board.lookup(x + 2, y) },
				];
				let anyEmpty = deletees.some(d => d.type == "empty");
				let allEqual = deletees.every(d => d.type == deletees[0].type);
 
				let yes = allEqual && !anyEmpty;
				let replacement = {
					x: userXVec == -1 ? (x + 2) : x,
					y: y,
					type: deletees[0].type
				};
				let priority = (userXVec != 0) ? 1 : 0; 

				return [yes, replacement, deletees, priority];
			};
			let vertical = function(x, y) {
				let deletees = [
					{ x: x, y: y + 0, type: board.lookup(x, y + 0) },
					{ x: x, y: y + 1, type: board.lookup(x, y + 1) },
					{ x: x, y: y + 2, type: board.lookup(x, y + 2) },
				];
				let anyEmpty = deletees.some(d => d.type == "empty");
				let allEqual = deletees.every(d => d.type == deletees[0].type); 
				
				let yes = allEqual && !anyEmpty;
				let replacement = {
					x: x,
					y: userYVec == -1 ? (y + 2) : y,
					type: deletees[0].type
				};
				let priority = (userYVec != 0) ? 1 : 0; 
				
				return [yes, replacement, deletees, priority];
			};
			let combinations = [horizontal, vertical];

			valids = [];
			highestPriority = 0;
			for (let y = 1; y <= 10; ++y)
			for (let x = 1; x <= 10; ++x)
			for (let combination of combinations)
			{
				let candidate = combination(x, y);
				if (candidate[0]) {
					valids.push(candidate);
					if (candidate[3] > highestPriority)
						highestPriority = candidate[3];
				}
			}
			
			// Select the best ones
			chosen = [];
			for (let priority = highestPriority; priority >= 0; --priority)
			{
				let competitors = valids.filter(
					candidate => candidate[3] == priority);
				if (competitors.length == 0) continue;
				let roll = Math.floor(Math.random() * competitors.length);
				chosen.push(competitors[roll]);
			}

			// Combine them
			for (let result of chosen)
			{
				for (let deletee of result[2])
					board.mergeDelete(
						deletee.x, deletee.y,
						result[1].x - deletee.x,
						result[1].y - deletee.y);
				board.install(result[1].x, result[1].y, result[1].type);
			}
			
			return chosen.length > 0;
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
		evaluateLoop(userXVec, userYVec) {
			while (true) {
				let changed = false;
				changed |= this.destroy();				
				if (changed) continue;
				changed |= this.combine(userXVec, userYVec);
				changed |= this.gravity();
				changed |= this.generate();
				if (changed) {
					userXVec = userYVec = 0;
					continue;
				};
				break;
			}
		},
	},
	mounted() {
		this.evaluateLoop();
	},
	computed: {
		classes() {
			return {
				debug: true
			}
		}
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

