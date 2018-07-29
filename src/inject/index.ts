import { Container } from './container';
import { GitLabTree } from './inject';
import { CSS_PREFIX } from './constants'

const container: Container = new Container();
let instance: GitLabTree = container.get( GitLabTree );

/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange(): void
{
	let files: Element = document.querySelector( '.files' );

	if ( files && ! files.classList.contains( CSS_PREFIX ) )
	{
		instance.teardown();
		container.drop( GitLabTree );

		instance = container.get( GitLabTree );
	}
}

setInterval( () => checkSiteChange(), 3000 )