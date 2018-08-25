import { patch } from 'superfine'

/**
 * Motivation:
 * Saving data into classes (folder/file) is convenient. Displaying them, however, is a problem.
 * Using Aurelia or Vue would bring a massive overhead for the otherwise simple plugin. So my
 * goal was to sync data with the view as simple as possible, and virtual-dom based solutions
 * do a great job. However, there is a problem with state management. You can't use the instance
 * as a component (if you can please open an issue). But you can define generic component and
 * send the state as a prop. I wanted to avoid duplication of state. Managing state is difficult
 * as well because the structure is not flat. So updating such a structure with Immutable and Redux
 * seemed complicated.
 * 
 * The solution is that everytime a change occurs, the whole new virtual dom is created, and changes
 * are reflected. This class saves entry points for every view and in case of change it does the job.
 */

export class Views
{
	private views = new Map<string, { element: HTMLElement, renderFn: () => any, lastNode: any }>();

	/**
	 * Create DOM structure and append it to given element. This will create a "view".
	 * 
	 * @param name - name of the "view" (so we can in future ask for redraw by name)
	 * @param renderFn - function that generates virtual DOM
	 * @param element - element, where "view" will be appended
	 */
	applyView( name: string, renderFn: () => any, element: HTMLElement ): void
	{
		this.views.set( name, { element, renderFn, lastNode: undefined } );
		this.redrawView( name );
	}


	/**
	 * This creates virtual dom reflecting current state, compares with last state and redraws
	 * changes.
	 * 
	 * @param name - name of "view" to redraw
	 */
	redrawView( name: string ): void
	{
		if ( this.views.has( name ) )
		{
			const view = this.views.get( name );
			view.lastNode = patch( view.lastNode, view.renderFn(), view.element )
		}
	}
}