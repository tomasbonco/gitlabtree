import { CSS_PREFIX } from "../constants";

export function prepareDomStructure(): HTMLElement
{
	const nativeTreeView = document.querySelector( '.diff-tree-list' ) as HTMLElement;

	if ( !! nativeTreeView )
	{
		return _removeNativeTreeView( nativeTreeView );
	}

	return _createTreeViewPanel();
}


function _removeNativeTreeView( nativeTreeView: HTMLElement ): HTMLElement
{
	const treeListHolder = nativeTreeView.querySelector( '.tree-list-holder' ) as HTMLElement;
	treeListHolder.innerHTML = '';

	return treeListHolder;
}


function _createTreeViewPanel(): HTMLElement
{
	const files: HTMLElement = document.querySelector( '.files' ) as HTMLElement;
	if ( ! files ) { return; }

	files.classList.add( CSS_PREFIX );


	// Create required DOM structure

	const wrapperElement: HTMLDivElement = document.createElement( 'div' );
	const settingsElement: HTMLDivElement = document.createElement( 'div' );
	const leftElement: HTMLDivElement = document.createElement( 'div' );
	const rightElement: HTMLDivElement = document.createElement( 'div' );

	wrapperElement.appendChild( leftElement );
	wrapperElement.appendChild( rightElement );
	document.body.appendChild( settingsElement );

	wrapperElement.classList.add( CSS_PREFIX + '__wrapper' );
	leftElement.classList.add( CSS_PREFIX + '__left' );
	rightElement.classList.add( CSS_PREFIX + '__right' );


	// Copy files children into right element
	
	Array.from( files.children ).forEach( ch =>
	{
		files.removeChild( ch );
		rightElement.appendChild( ch );
	})

	
	files.appendChild( wrapperElement );
	
	return leftElement;
}