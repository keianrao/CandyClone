
const cBoard = {
	props: [ "state" ],
	methods: {
		candyAt(x, y) {
			return this.state.candies[x + " " + y];
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

