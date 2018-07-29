import { h, Component } from 'preact'
import { autoinject } from './container';
import { Structure } from './structure';

@autoinject
export class Navigation extends Component
{
	props: {} = {}

	constructor( private structure: Structure )
	{
		super()
	}


	render(): any
	{
		return this.structure.entryPoint.render();
	}
}

// app(state, actions, view, document.body)