
log = document.getElementById("log");
//log.println = string => log.innerText += string + "\n";
log.println = string => log.innerText = string + "\n" + log.innerText;
log.println("Ready.");


function createState() {
	let returnee = {};	

	returnee.candies = {};
	for (let y = 1; y <= 10; ++y)
	for (let x = 1; x <= 10; ++x) {
		let candy = {
			x: x,
			y: y,
			colour: random(["empty", "blue", "orange"]),
			state: "stable"
		};
		returnee.candies[x + " " + y] = candy;
	}
	
	returnee.patterns = createPatterns();

	returnee.highlights = [];

	return returnee;
}

function createPatterns() {
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
	return [
		horizontal3,
		vertical3,
		horizontal4,
		vertical4
	];
}

function droppees(candies) {
	function canDrop(tile) {
		if (tile.colour == "empty") return false;
		for (let y = tile.y + 1; y <= 10; ++y) {
			let dest = candies[tile.x + " " + y];
			if (dest && dest.colour == "empty") return true;
		}
	}
	return dictFilter(candies, canDrop);
}

function dropTarget(tile, candies) {
	let returnee = null;
	for (let y = tile.y + 1; y <= 10; ++y) {
		let dest = candies[tile.x + " " + y];
		if (!dest || dest.colour != "empty") break;
		returnee = dest;
	}
	return returnee;
}

function drops(candies) {
	let returnee = [];

	let hypothetical = JSON.parse(JSON.stringify(candies));

	for (let y = 10; y >= 1; --y)
	for (let x = 1; x <= 10; ++x) {
		let src = candies[x + " " + y];
		let dest = dropTarget(src, hypothetical);
		if (dest) {
			returnee.push([src, dest]);
			eat(hypothetical, [src, dest]);
		}
	}

	return returnee;
};

function eat(candies, drop) {
	let src = candies[drop[0].x + " " + drop[0].y];
	let dest = candies[drop[1].x + " " + drop[1].y];
	dest.colour = src.colour;
	dest.state = src.state;
	src.colour = "empty";
	src.state = "stable";
}

function dictFilter(dict, predicate) {
	function consider(acc, key) {
		let value = dict[key];
		if (predicate(value)) acc.push(value);
		return acc;
	};
	return Object.keys(dict).reduce(consider, []);
}

function random(options) {
	return options[Math.floor(Math.random() * options.length)];
}


const cGame = {
	data() {
		return {
			state: createState()
		};
	},
	computed: {
		globalClasses() {
			return {
				debug: true
			};
		}
	},
	methods: {
		/*
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
		*/
	},
	mounted() {
		//this.evaluateLoop();
		this.state.highlights = droppees(this.state.candies);
		for (let drop of drops(this.state.candies))
			eat(this.state.candies, drop);
	},
	components: {
		Board: cBoard,
		Effects: cEffects
	},
	template: `
		<Board :class="globalClasses"
			:state="this.state" />
		<Effects :class="globalClasses"
			:state="this.state" />
	`
};


Vue.createApp(cGame).mount("#game");

