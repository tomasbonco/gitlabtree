import { Metadata } from './mining/metadata';
import { autoinject, Container, Instance } from './libs/container';
import { CSS_PREFIX } from './constants'
import { Navigation } from './navigation';
import { Structure } from './mining/structure'
import { File } from './file'
import { Views } from './libs/views';
import { Settings } from './settings';
import { PubSub } from './libs/pubsub';
import { SettingsStore } from './settings.store';

declare const chrome, browser;


@autoinject
export class GitLabTree
{
	pathPrefix: string;
	fileHolders: NodeList;
	fileNames: string[];
	strippedFileNames: string[];

	wrapperElement: HTMLDivElement = document.createElement( 'div' );
	settingsElement: HTMLDivElement = document.createElement( 'div' );
	leftElement: HTMLDivElement = document.createElement( 'div' );
	rightElement: HTMLDivElement = document.createElement( 'div' );
	
	lastActive: string = '';
	storage = (chrome || browser).storage.local

	hashChangeListener: () => void;
	expandListener: ( e: MouseEvent ) => void;


	constructor( private container: Container, private views: Views, private pubsub: PubSub, private settingStore: SettingsStore )
	{
		this.init();

		this.pubsub.subscribe( 'settings-changed', this.settingsChanged.bind( this ) )
		this.pubsub.subscribe( 'toggle-navigation', ( action, isOpen ) => this.toggleNavigation( isOpen ) )


		// Detection if we have any files to generate tree from

		const files: HTMLElement = document.querySelector( '.files' ) as HTMLElement;
		if ( ! files ) { return; }

		this.fileHolders = files.querySelectorAll( '.file-holder' );
		if ( ! files || this.fileHolders.length === 0 ) { return; }

		files.classList.add( CSS_PREFIX );


		// Obtain metadata

		const metadata: Metadata = new Metadata( this.fileHolders );
		this.container.set( Metadata, metadata );

		if ( metadata.getAll().length === 0 )
		{
			return;
		}


		// Analyze filenames

		const structure: Structure = container.get( Structure );

		const navigation: Navigation = container.get( Navigation )
		this.views.applyView( 'navigation', () => navigation.render(), this.leftElement );

		const settings: Settings = container.get( Settings )
		this.views.applyView( 'settings', () => settings.render(), this.settingsElement )


		// Hide files
		this.copyAndHideFiles( files );


		// this.leftElement.appendChild( fileNamesDOM );
		files.appendChild( this.wrapperElement );

		// Adjust DOM so that the Changes tab uses 100% width
		this.makeChangesTabWider();


		// Apply settings
		
		this.settingsChanged( 'internal', this.settingStore.getAll() )


		// Show file based on hash id

		const currentFileHash: string = location.hash;
		this.showFile( currentFileHash );


		// Add listener for changes

		this.hashChangeListener = this.hashChanged.bind( this )
		window.addEventListener( 'hashchange', this.hashChangeListener );
	}


	/**
	 * Kind of destructor.
	 */
	teardown(): void
	{
		window.removeEventListener( 'hashchange', this.hashChangeListener );
		document.removeEventListener( 'click', this.expandListener );
	}

	
	/**
	 * Creates required DOM elements.
	 */
	init(): void
	{
		this.wrapperElement.appendChild( this.leftElement );
		this.wrapperElement.appendChild( this.rightElement );
		document.body.appendChild( this.settingsElement );

		this.wrapperElement.classList.add( CSS_PREFIX + '-wrapper' );
		this.leftElement.classList.add( CSS_PREFIX + '-left' );
		this.rightElement.classList.add( CSS_PREFIX + '-right' );
		this.settingsElement.classList.add( CSS_PREFIX + '-settings' );
	}


	settingsChanged( action: string, data: any ): void
	{
		this.leftElement.style.flexBasis = data['panel-width'] + 'px';
	}


	toggleNavigation( isOpen: boolean )
	{
		const className = 'gitlab-tree-plugin__collapsed';
		this.leftElement.classList.remove( className )

		if ( ! isOpen )
		{
			this.leftElement.classList.add( className )
		}
	}


	/**
	 * It loops through files listed (DOM elements), copies them to new DOM structure,
	 * and hides them.
	 * 
	 * @param {HTMLElement} files - DOM element with files listed
	 */
	copyAndHideFiles( files: HTMLElement ): void
	{
		for ( let i: number = 0; i < this.fileHolders.length; i++ )
		{
			let fileHolder: HTMLElement = this.fileHolders[i] as HTMLElement;
			files.removeChild( fileHolder );
			this.rightElement.appendChild( fileHolder );

			fileHolder.classList.add( CSS_PREFIX + '-hidden' );
		}
	}


	/**
	 * It makes the 'Changes' tab use the full width of the content area on the merge request
	 * page (only).
	 */
	makeChangesTabWider(): void
	{
		const contentWrapper: HTMLElement = document.querySelector( '.content-wrapper' ) as HTMLElement;
		const tabs: HTMLElement = document.querySelector( '.merge-request-tabs-holder' ) as HTMLElement;
		const tabsContent: HTMLElement = document.querySelector( '.tab-content' ) as HTMLElement;
		
		if ( ! contentWrapper || ! tabs || ! tabsContent )
		{
			return;
		}
		
		this.moveTabs( tabs, contentWrapper );
		this.moveTabsContent( tabsContent, contentWrapper );
	}


	/**
	 * It preserves the tab headers sticky behavior at the top of all merge request pages.
	 * This is done by removing the tab headers div from the DOM, then wrapping it in a new
	 * div which contains all the styling which was previously provided by the tab headers
	 * div's ancestors.  Finally, it places the wrapped DIV into the DOM directly under
	 * the 'content-wrapper' div.
	 */
	moveTabs( tabs: HTMLElement, contentWrapper: HTMLElement ): void
	{
		tabs.parentElement.removeChild( tabs );

		const tabsWrapper: HTMLElement = document.createElement( 'div' );
		tabsWrapper.classList.add(
			'container-fluid',
			'limit-container-width',
			'container-fixed',
			'gitlab-tree-tabs-wrapper',
		);
		tabsWrapper.appendChild( tabs );

		contentWrapper.appendChild( tabsWrapper );
	}


	/**
	 * It makes the 'Changes' tab use the full width of the content area.  This is done
	 * by removing the tab contents divs from the DOM, then looping through the divs and 
	 * applying the GitLab CSS classes that control content width to all except the 
	 * 'Changes' tab.  Finally, it places the results back into the DOM directly under
	 * the 'content-wrapper' div.
	 */
	moveTabsContent( tabsContent: HTMLElement, contentWrapper: HTMLElement ): void
	{
		tabsContent.parentElement.removeChild( tabsContent );

		for ( let i: number = 0; i < tabsContent.childElementCount; i++ )
		{
			const content: HTMLElement = tabsContent.children[i] as HTMLElement;

			// Add the GitLab container margin and padding class
			content.classList.add( 'container-fluid' );
			
			if ( ! content.classList.contains( 'diffs' ))
			{
				// Add the GitLab limited-width container classes
				content.classList.add( 'container-limited', 'limit-container-width' );
			}
		}

		contentWrapper.appendChild( tabsContent );
	}


	/**
	 * Callback called after hash has changed. It searches for "diff-[FILE ID]"" in hash,
	 * and displays corresponding file (based on id). 
	 */
	hashChanged(): void
	{
		let newHash: string = location.hash;
		this.showFile( newHash );
	}


	/**
	 * Shows file based on id.
	 * 
	 * @param {number} id - id of file to be shown
	 */
	showFile( hash?: string ): void
	{
		const metadata: Metadata = this.container.get( Metadata );

		if ( metadata.getAll().length === 0 )
		{
			return;
		}

		if ( this.lastActive )
		{
			this.getFileHolderByHash( this.lastActive ).classList.add( CSS_PREFIX + '-hidden' );
			this.getFileLinkByHash( this.lastActive ).setInactive();
		}
		
		hash = metadata.getAll().filter( m => m.hash === hash ).length > 0 ? hash : metadata.getAll()[0].hash; // if hash is invalid use default hash

		this.getFileHolderByHash( hash ).classList.remove( CSS_PREFIX + '-hidden' );
		this.getFileLinkByHash( hash ).setActive();

		this.lastActive = hash;
	}


	getFileHolderByHash( hash: string ): HTMLElement
	{
		return this.rightElement.querySelector( `[id='${ hash.substr(1) }']` ) as HTMLElement;
	}
	

	getFileLinkByHash( hash: string ): File
	{
		const structure: Structure = this.container.get( Structure );
		return structure.flatFileStructure.find( file => file.state.hash === hash );
	}
}