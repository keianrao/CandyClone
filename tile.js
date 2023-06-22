
const cTile = {
	props: [ "x", "y", "candy", "highlighted" ],
	computed: {
		classes() {
			return (
				this.candy.state
				+ (this.highlighted ? " highlighted" : ""));
		},
	},
	template: `
		<div v-if="!candy" class="empty">
			{{ x }}, {{ y }}
		</div>
		<div v-else class="tile" :class="classes">
			<img :src="candy.colour + '.png'">
			{{ x }}, {{ y }}
		</div>
	`
};

