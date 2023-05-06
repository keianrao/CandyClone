
log = document.getElementById("log");
log.println = string => log.innerText += string + "\n";
log.println("Ready.");

cTile = {
	data() {
		let roll = Math.floor(Math.random() * 3);
		let type = ["empty", "blue", "orange"][roll];		
		return {
			type: type,
			filename: type + ".png"
		};
	},
	template: `
		<div class="tile">
			<img :src="filename">
			<slot></slot>
		</div>
	`
};

cBoard = {
	data() {
		let ys = [], xs = [];
		for (let y = 1; y <= 10; ++y) ys.push(y);
		for (let x = 1; x <= 10; ++x) xs.push(x);

		return {
			ys: ys, xs: xs
		};
	},
	components: {
		Tile: cTile
	},
	template: `
		<div class="board">
			<div v-for="y in ys">
				<Tile v-for="x in xs">
					{{ x }}, {{ y }}
				</Tile>
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
		
		gravity() {

		}
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
		<Board :class="classes" />
		<Effects :class="classes" />
	`
};

Vue.createApp(cGame).mount("#game");

