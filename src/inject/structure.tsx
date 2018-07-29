import { Metadata } from './metadata';
import { Folder } from './folder';
import { Container } from './container';

export class Structure
{
	plainFileNames: string[];
	files: Folder;


	constructor( private container: Container, private metadata: Metadata )
	{
		this.plainFileNames = this.metadata.getAll().map( m => m.filename );

		const prefix = this.getPrefixPath( this.plainFileNames );
		const fileNamesWithoutPrefix = this.removePathPrefix( this.plainFileNames, prefix );
		const folderStructure = this.createFolderStructure( fileNamesWithoutPrefix );
		const optimized = this.reduceSingleChildFolders( folderStructure );

		this.files = optimized;
	}


	/**
	 * It loops through files finding maximum common folder structure.
	 * 
	 * @param {string[]} fileNames - list of filenames
	 * @return {string} - maximum common folder path
	 */
	private getPrefixPath( fileNames: string[] ): string
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
	private removePathPrefix( fileNames: string[], prefix: string ): string[]
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
	private createFolderStructure( fileNames: string[] ): Folder
	{
		const mainFolder: Folder = this.container.getInstance( Folder ).setProps('');

		if ( ! Array.isArray( fileNames ) || fileNames.length === 0 )
		{
			throw new Error( `Expected array, ${ typeof fileNames } given!` );
		}

		for ( let i: number = 0; i < fileNames.length; i++ )
		{
			const fileName: string = fileNames[ i ];
			const fileNameParts: string[] = fileName.split('/');

			let currentFolder: Folder = mainFolder;

			for ( let ii: number = 0; ii < fileNameParts.length; ii++ )
			{
				const part: string = fileNameParts[ ii ];

				if ( ii === fileNameParts.length - 1 ) // is last one
				{
					currentFolder.addFile( this.container.getInstance( File ).setProps( part, i ) );
				}

				else
				{
					currentFolder = ! currentFolder.hasFolder( part ) ? this.container.getInstance( Folder ).setProps( part ) : currentFolder.getFolder( part );
				}
			}
		}

		return mainFolder;
	}


	private reduceSingleChildFolders( folder: Folder ): Folder
	{
		if ( folder.subfoldersSize === 0 )
		{
			return folder;
		}


		else if ( folder.subfoldersSize === 1 && folder.filesSize === 0 )
		{
			const childFolder = folder.getFolders()[0];
			folder.setProps( `${folder.props.name}/${childFolder.props.name}` );

			folder.dropFolders();
			folder.addFolder( ...childFolder.getFolders() );
			folder.addFile( ...childFolder.getFiles() );

			// Start again
			this.reduceSingleChildFolders( folder );
		}

		else
		{
			for ( const subFolder of folder.getFolders() )
			{
				this.reduceSingleChildFolders( subFolder );
			}
		}

		return folder;
	}
}