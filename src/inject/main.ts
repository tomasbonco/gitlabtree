import { Metadata } from './mining/metadata';
import { autoinject, Container, Instance } from './libs/container';
import { CSS_PREFIX, EVENT_SETTINGS_CHANGED, EVENT_TOGGLE_NAVIGATION, EVENT_TOGGLE_EXTENSION } from './constants'
import { Navigation } from './navigation';
import { Structure } from './mining/structure'
import { File } from './file'
import { Views } from './libs/views';
import { Settings } from './settings';
import { PubSub } from './libs/pubsub';
import { SettingsStore, ISettings } from './settings.store';

declare const chrome, browser;


@autoinject
export class GitLabTree
{
	isOn: boolean = true; // are all files displayed (false) or single selected (true)?

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
		// Detection if we have any files to generate tree from

		const files: HTMLElement = document.querySelector( '.files' ) as HTMLElement;
		if ( ! files ) { return; }

		this.fileHolders = files.querySelectorAll( '.file-holder' );
		if ( ! files || this.fileHolders.length === 0 ) { return; }

		files.classList.add( CSS_PREFIX );


		// Subscribe to inner-module event system
		
		this.pubsub.subscribe( EVENT_SETTINGS_CHANGED, ( action, data ) => this.settingsChanged( action, data ))
		this.pubsub.subscribe( EVENT_TOGGLE_NAVIGATION, ( action, isOpen ) => this.performNavigationIsOpen( isOpen ))
		this.pubsub.subscribe( EVENT_TOGGLE_EXTENSION, (action, isOn ) => this.toggleExtensionIsOn( isOn ) );


		// Obtain metadata

		const metadata: Metadata = new Metadata( this.fileHolders );
		this.container.set( Metadata, metadata );

		if ( metadata.getAll().length === 0 )
		{
			return;
		}


		// Create required DOM structure

		this.wrapperElement.appendChild( this.leftElement );
		this.wrapperElement.appendChild( this.rightElement );
		document.body.appendChild( this.settingsElement );

		this.wrapperElement.classList.add( CSS_PREFIX + '-wrapper' );
		this.leftElement.classList.add( CSS_PREFIX + '__left' );
		this.rightElement.classList.add( CSS_PREFIX + '__right' );
		this.settingsElement.classList.add( CSS_PREFIX + '-settings' );


		// Adjust DOM so that the code diff uses 100% width

		const limitingElement = document.querySelector( '.content-wrapper div.container-fluid.limit-container-width.container-limited' );
		if ( limitingElement )
		{
			limitingElement.classList.remove('container-limited')
		}


		// Render views

		const navigation: Navigation = container.get( Navigation )
		const settings: Settings = container.get( Settings )
		
		this.views.applyView( 'navigation', () => navigation.render(), this.leftElement );
		this.views.applyView( 'settings', () => settings.render(), this.settingsElement )

		
		// Apply settings
		
		this.settingsChanged( 'internal', this.settingStore.getAll() );


		// Start the show

		this.copyAndHideFiles( files ); // hide files
		files.appendChild( this.wrapperElement ); // show tree structure


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
		this.pubsub.unsubscribeAll();

		window.removeEventListener( 'hashchange', this.hashChangeListener );
		document.removeEventListener( 'click', this.expandListener );
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

			fileHolder.classList.add( CSS_PREFIX + '--is-hidden', CSS_PREFIX + '__file-holder' );
		}
	}


	/**
	 * Callback called after hash has changed (= user clicked on some file). It displays
	 * corresponding file (based on id). 
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
			this.getFileHolderByHash( this.lastActive ).classList.add( CSS_PREFIX + '--is-hidden' );
			this.getFileLinkByHash( this.lastActive ).setInactive();
		}
		
		hash = metadata.getAll().filter( m => m.hash === hash ).length > 0 ? hash : metadata.getAll()[0].hash; // if hash is invalid use default hash

		this.getFileHolderByHash( hash ).classList.remove( CSS_PREFIX + '--is-hidden' );
		this.getFileLinkByHash( hash ).setActive();

		this.lastActive = hash;
	}

	
	/**
	 * Callback fired once settings are changed.
	 * 
	 * @param {string} action - message from pubsub, in most of cases 'settings-changed'
	 * @param {} newSettings - complete new state of settings from settingsStore
	 */
	settingsChanged( action?: string, newSettings?: ISettings ): void
	{
		this.leftElement.style.flexBasis = newSettings['panel-width'] + 'px';
	}


	/**
	 * Navigation can have two states - collapsed, when it consumes only 50px, or expanded
	 * when it consumes as much as user defined (250px by default). It is controlled in
	 * Navigation file. This performs required change on top level.
	 * 
	 * @param {boolean} isOpen - true, if navigation should be opened, false otherwise
	 */
	performNavigationIsOpen( isOpen?: boolean ): void
	{
		const className: string = 'gitlab-tree-plugin__left--is-collapsed';
		this.leftElement.classList.remove( className )

		if ( ! isOpen )
		{
			this.leftElement.classList.add( className )
		}
	}


	/**
	 * Extension can have two states - ON, when it displays only one file on the right side,
	 * or OFF when you see all files. This function toggles between them.
	 * 
	 * @param {boolean} isOn - leave this empty if you want oposite of the previous value, or force the new value
	 */
	toggleExtensionIsOn( isOn?: boolean ): void
	{
		this.isOn = isOn !== undefined ? isOn: ! this.isOn;

		if ( this.isOn )
		{
			const fileHolders = this.rightElement.querySelectorAll( `.${CSS_PREFIX}__file-holder` );
			fileHolders.forEach( file => file.classList.add( `${CSS_PREFIX}--is-hidden` ) )

			this.showFile( this.lastActive );
		}

		else
		{
			const fileHolders = this.rightElement.querySelectorAll( `.${CSS_PREFIX}--is-hidden` );
			fileHolders.forEach( file => file.classList.remove( `${CSS_PREFIX}--is-hidden` ) )
		}
	}


	private getFileHolderByHash( hash: string ): HTMLElement
	{
		return this.rightElement.querySelector( `[id='${ hash.substr(1) }']` ) as HTMLElement;
	}
	

	private getFileLinkByHash( hash: string ): File
	{
		const structure: Structure = this.container.get( Structure );
		return structure.flatFileStructure.find( file => file.state.hash === hash );
	}
}