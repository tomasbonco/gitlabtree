import { Container } from './libs/container';
import { GitLabTree } from './main';
import { CSS_PREFIX } from './constants'
import { SettingsStore } from './settings.store';

let container: Container = new Container();
let interval: number;

/*
	!! IMPORTANT NOTE !!

	This file performs a quick test, whether plugin should be applied.
	Actual plugin entry point can be found in `main.ts` file.
*/



/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange(): void
{
	let files: Element = document.querySelector( '.files' );

	if ( files && ! files.classList.contains( CSS_PREFIX ) )
	{
		container.destruct();

		container = getInstance();
		startCheckInterval( 3000 )
	}
}

function startCheckInterval( time: number ): void
{
	clearInterval( interval )
	interval = setInterval( () => checkSiteChange(), time );
}


function getInstance( callback = () => {} )
{
	const container: Container = new Container();
	const settingsStore = container.get( SettingsStore );

	// Let's get settings first, so then we can query them synchronously
	settingsStore.onceReady.then( () =>
	{
		container.get( GitLabTree ); // this creates a new instance of GitlabTree on container
		callback();
	})

	return container;
}


( () =>
{
	// Detection if we are on GitLab page

	const isGitLab: Element = document.querySelector( 'meta[content="GitLab"]' );
	if ( ! isGitLab )
	{
		return;
	}

	container = getInstance( () => startCheckInterval( 150 ) )
})()