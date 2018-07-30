import { Container } from './container';
import { GitLabTree } from './inject';
import { CSS_PREFIX } from './constants'

( () =>
{
	// Detection if we are on GitLab page

	const isGitLab: Element = document.querySelector( 'meta[content="GitLab"]' );
	if ( ! isGitLab )
	{
		return;
	}
	

	const container: Container = new Container();
	let instance: GitLabTree = container.get( GitLabTree );
	let interval: number;


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
			startCheckInterval( 3000 )
		}
	}

	function startCheckInterval( time: number ): void
	{
		clearInterval(  interval )
		interval = setInterval( () => checkSiteChange(), time );
	}

	startCheckInterval( 150 )
})()