import DataTabulator from './DataTabulator.vue'

export default {
	install: (app) => {
		app.component('DataTabulator', DataTabulator);
	}
}

export { DataTabulator };
