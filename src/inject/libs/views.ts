import { patch } from 'superfine'

export class Views
{
	private views = new Map<string, { element: HTMLElement, renderFn: () => any, lastNode: any }>();


	applyView( name: string, renderFn: () => any, element: HTMLElement )
	{
		this.views.set( name, { element, renderFn, lastNode: undefined } );
		this.redrawView( name );
	}


	redrawView( name )
	{
		if ( this.views.has( name ) )
		{
			const view = this.views.get( name );
			view.lastNode = patch( view.lastNode, view.renderFn(), view.element )
		}
	}
}