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



function computeDrops(candies) {
	let xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let ys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];	
	function computeXDrops(x) {
		function range(n1, n2) {
			let returnee = [];
			for (let n = n1; n <= n2; ++n) returnee.push(n);
			return returnee;
		};
		function zip(array1, array2) {
			let returnee = [];
			let n = Math.min(array1.length, array2.length);
			for (let o = 0; o < n; ++o) {
				returnee.push([array1[o], array2[o]]);
			};
			return returnee;
		};
		function occupied(y) {
			return candies[x + " " + y].colour != "empty"
		}
		let occupiedYs = ys.filter(occupied);
		let destYs = range(11 - occupiedYs.length, 10);
		let xLabels = new Array(10).fill(x);
		let coord = ([x, y]) => x + " " + y;
		let srcs = zip(xLabels, occupiedYs).map(coord);
		let dests = zip(xLabels, destYs).map(coord);
		let returnee = zip(srcs, dests);
		let doesDrop = ([src, dest]) => src != dest;
		return returnee.filter(doesDrop);
	}
	let reverse = array => array.reverse();
	return xs.map(computeXDrops).map(reverse).flat();
	// Reverse so that they are sorted by bottommost first.
}

function resolveDrops(candies, drops) {
	let candyAt = coord => candies[coord];
	return drops.map(coords => coords.map(candyAt));
}


function acceptDrop([src, dest]) {
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

async function sleep(milliseconds) {
	await new Promise(function(resolve) {
		setTimeout(resolve, milliseconds);
	});
}

