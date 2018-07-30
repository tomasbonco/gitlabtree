import { autoinject } from './container';
import { Structure } from './structure';

@autoinject
export class Navigation
{
	props: {} = {}

	constructor( private structure: Structure )
	{}


	render(): any
	{
		return this.structure.entryPoint.render();
	}
}

// app(state, actions, view, document.body)