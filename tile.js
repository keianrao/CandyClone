
const cTile = {
	props: [ "x", "y", "candy" ],
	computed: {
		classes() {
			return this.candy.state;
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

