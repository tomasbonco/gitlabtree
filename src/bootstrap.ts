import { CSS_PREFIX } from "./constants";
import { gitlabTreeView } from '.';

let instance = () => {};
let interval: number;


/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange(): void
{
	const files: Element = document.querySelector( '.files' );

	if ( files && ! files.classList.contains( CSS_PREFIX ) )
	{
		instance();
		
		instance = gitlabTreeView()
		startCheckInterval( 3000 )
	}
}

function startCheckInterval( time: number ): void
{
	clearInterval( interval )
	interval = setInterval( () => checkSiteChange(), time );
}


( () =>
{
	// Detection if we are on GitLab page

	const isGitLab: Element = document.querySelector( 'meta[content="GitLab"]' );
	if ( ! isGitLab )
	{
		return;
	}

	startCheckInterval( 150 );
})()