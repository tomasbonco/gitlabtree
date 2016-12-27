class GitLabTree
{
	pathPrefix: string;
	fileHolders: NodeList;
	fileNames: string[];
	strippedFileNames: string[];

	wrapperElement: HTMLDivElement;
	leftElement: HTMLDivElement;
	rightElement: HTMLDivElement;

	hashChangeListener: () => void;


	constructor()
	{
		this.init();


		// Detection if we are on GitLab page

		const isGitLab: Element = document.querySelector( 'meta[content="GitLab"]' );
		if ( ! isGitLab ) { return; }


		// Detection if we have any files to generate tree from

		const files: HTMLElement = document.querySelector( '.files' ) as HTMLElement;
	
		if ( ! files ) { return; }

		this.fileHolders = files.querySelectorAll( '.file-holder' );
		if ( ! files || this.fileHolders.length === 0 ) { return; }

		files.classList.add( 'gitlab-tree-plugin' );


		// Analyze filenames

		this.fileNames = this.collectFileNames( files );
		this.pathPrefix = this.getPrefixPath( this.fileNames );
		this.strippedFileNames = this.removePathPrefix( this.fileNames, this.pathPrefix );



		// Create and display DOM

		const fileNamesDOM: HTMLDivElement = this.convertFolderStructureToDOM( this.pathPrefix, this.createFolderStructure( this.strippedFileNames ) )

		this.leftElement.appendChild( fileNamesDOM )
		files.appendChild( this.wrapperElement );


		// Show file based on hash id

		const currentFileId: number = this.getIdFromHash( location.hash ) || 0;
		this.showFile( currentFileId );


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
	}

	
	/**
	 * Resets all variables, creates required DOM elements.
	 */
	init(): void
	{
		this.pathPrefix = '';
		this.fileHolders;
		this.fileNames = [];
		this.strippedFileNames = [];

		this.wrapperElement = document.createElement( 'div' );
		this.leftElement = document.createElement( 'div' );
		this.rightElement = document.createElement( 'div' );

		this.wrapperElement.appendChild( this.leftElement );
		this.wrapperElement.appendChild( this.rightElement );

		this.wrapperElement.classList.add( 'gitlab-tree-plugin-wrapper' );
		this.leftElement.classList.add( 'gitlab-tree-plugin-left' );
		this.rightElement.classList.add( 'gitlab-tree-plugin-right' );
	}


	/**
	 * It loops through files listed (DOM elements; consists of filename and content),
	 * saves their filenames and removes them from DOM.
	 * 
	 * @param {HTMLElement} files - DOM element with files listed
	 * @return {string[]} - collected file names
	 */
	collectFileNames( files: HTMLElement ): string[]
	{
		let fileNames: string[] = [];

		for ( let i: number = 0; i < this.fileHolders.length; i++ )
		{
			let fileHolder: HTMLElement = this.fileHolders[i] as HTMLElement;
			let fileName: string = fileHolder.querySelector( '.file-title strong' ).textContent.trim();
			
			fileNames.push( fileName );
			files.removeChild( fileHolder );
		}

		return fileNames;
	}


	/**
	 * It loops through files finding maximum common folder structure.
	 * 
	 * @param {string[]} fileNames - list of filenames
	 * @return {string} - maximum common folder path
	 */
	getPrefixPath( fileNames: string[] ): string
	{
		if ( ! Array.isArray( fileNames ))
		{
			throw new Error( `Expected array, ${ typeof fileNames } given!` );
		}

		if ( fileNames.length === 0 )
		{
			return '';
		}

		let sourcePathParts: string[] = fileNames[0].split('/');

		if ( fileNames.length === 1 )
		{
			sourcePathParts.pop();
			return sourcePathParts.join('/');
		}

		for ( let i: number = 1; i < fileNames.length; i++ )
		{
			let filePathParts: string[] = fileNames[i].split( '/' );

			for ( let ii: number = 0; ii < sourcePathParts.length; ii++ )
			{
				if ( sourcePathParts[ ii ] !== filePathParts[ ii ] )
				{
					sourcePathParts = sourcePathParts.slice( 0, ii );
					break;
				}
			}
		}

		return sourcePathParts.join('/');
	}


	/**
	 * Removes path prefix from all fileNames.
	 * 
	 * @param {string[]} fileNames - list of filenames
	 * @param {string} prefix - prefix to be removed
	 * @return {string[]} - trimmed filenames
	 */
	removePathPrefix( fileNames: string[], prefix: string ): string[]
	{
		if ( prefix.length === 0 )
		{
			return fileNames.slice( 0 );
		}

		let output: string[] = [];

		for ( let fileName of fileNames )
		{
			output.push( fileName.substring( (prefix + '/').length ) )
		}

		return output;
	}


	/**
	 * Creates folder structure from given list of files.
	 * Folders are objects, files are numbers.
	 * 
	 * Example: [ test/foo/spec1.ts, test/foo/spec2.ts ] -> { test: { foo: { spec1: 0, spec1: 1 }}}
	 * 
	 * @param {string} fileNames - list of filenames
	 * @return {any} generated folder structure
	 */
	createFolderStructure( fileNames: string[] ): any
	{
		let structure: any = {};

		if ( ! Array.isArray( fileNames ) || fileNames.length === 0 )
		{
			throw new Error( `Expected array, ${ typeof fileNames } given!` );
		}

		for ( let i: number = 0; i < fileNames.length; i++ )
		{
			let fileName: string = fileNames[ i ];
			let fileNameParts: string[] = fileName.split('/');

			let currentFolder: any = structure;

			for ( let ii: number = 0; ii < fileNameParts.length; ii++ )
			{
				let part: string = fileNameParts[ ii ];

				if ( ! currentFolder[ part ] )
				{
					if ( ii === fileNameParts.length - 1 ) // is last one
					{
						currentFolder[ part ] = i; // file
					}

					else
					{
						currentFolder[ part ] = {}; // folder
					}
				}

				currentFolder = currentFolder[ part ];
			}
		}

		return structure;
	}


	/**
	 * Converts folder structure into DOM recursively.
	 * 
	 * @param {string} folderName - name of the currently proceed folder
	 * @param {string} structure - folder structure (for example see `createFolderStructure`)
	 * @return {HTMLDivElement} corresponding folder structure
	 */
	convertFolderStructureToDOM( folderName: string, structure: any ): HTMLDivElement
	{
		let root: HTMLDivElement = document.createElement( 'div' );
		root.classList.add( 'folder' );

		let holder: HTMLDivElement = document.createElement( 'div' );
		holder.classList.add( 'holder' );
		holder.setAttribute( 'title', folderName );
		holder.textContent = folderName;
		root.appendChild( holder );

		let files: HTMLAnchorElement[] = [];
		let folders: HTMLDivElement[] = [];

		for ( let name in structure )
		{
			if ( structure.hasOwnProperty( name ) )
			{
				let entry: any = structure[ name ];

				if ( typeof entry === 'number' )
				{
					let file: HTMLAnchorElement = document.createElement( 'a' );
					file.setAttribute( 'href', `#diff-${ entry }` );
					file.classList.add( 'file' );
					file.textContent = name;

					files.push( file );
				}

				else
				{
					folders.push( this.convertFolderStructureToDOM( name, entry ) );
				}
			}
		}

		folders.forEach(( folder: HTMLDivElement ) => root.appendChild( folder ));
		files.forEach(( file: HTMLAnchorElement ) => root.appendChild( file ));

		return root;
	}


	/**
	 * Callback called after hash has changed. It searches for "diff-[FILE ID]"" in hash,
	 * and displays corresponding file (based on id). 
	 */
	hashChanged(): void
	{
		let newHash: string = location.hash;
		let fileId: number = this.getIdFromHash( newHash ) || 0
		
		this.showFile( fileId );
	}


	/**
	 * Returns id of file from hash.
	 * 
	 * @param {string} hash - hash
	 * @return {number} - id of file
	 */
	getIdFromHash( hash: string ): number
	{
		if ( hash.match('diff-') )
		{
			return parseInt( hash.substr( hash.charAt(0) === '#' ? '#diff-'.length : 'diff-'.length ) );
		}

		return;
	}


	/**
	 * Shows file based on id.
	 * 
	 * @param {number} id - id of file to be shown
	 */
	showFile( id: number ): void
	{
		this.rightElement.innerHTML = '';
		this.rightElement.appendChild( this.fileHolders[ id ] );
	}
}



let instance: GitLabTree = new GitLabTree();

/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange(): void
{
	let files: Element = document.querySelector( '.files' );

	if ( files && ! files.classList.contains( 'gitlab-tree-plugin' ) )
	{
		instance.teardown();
		instance = new GitLabTree();
	}
}

setInterval( () => checkSiteChange(), 3000 )