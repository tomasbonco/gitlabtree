import { Metadata } from './metadata';
import { Folder } from './folder';
import { File } from './file';
import { Container, autoinject, Instance } from './container';

@autoinject
export class Structure
{
	plainFileNames: string[];
	entryPoint: Folder;
	flatFileStructure: File[];


	constructor( private container: Container, private metadata: Metadata )
	{
		this.plainFileNames = this.metadata.getAll().map( m => m.filename );

		const prefix: string = this.getPrefixPath( this.plainFileNames );
		const fileNamesWithoutPrefix: string[] = this.removePathPrefix( this.plainFileNames, prefix );
		const { treeStructure, flatFileStructure } = this.createFolderStructure( fileNamesWithoutPrefix );
		const optimized: Folder = this.reduceSingleChildFolders( treeStructure );

		this.entryPoint = optimized;
		this.entryPoint.setProps({ name: prefix })

		this.flatFileStructure = flatFileStructure;
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
	private createFolderStructure( fileNames: string[] ): { treeStructure: Folder, flatFileStructure: File[] }
	{
		const mainFolder: Folder = this.container.get( Instance.of( Folder ) ).init('');
		const flatFileStructure: File[] = [];

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
					const file: File = this.container.get( Instance.of( File ) ).init( part, i )
					currentFolder.addFile( file );
					flatFileStructure.push( file );
				}

				else
				{
					if ( ! currentFolder.hasFolder( part ))
					{
						const newSubFolder: Folder = this.container.get( Instance.of( Folder ) ).init( part );
						currentFolder.addFolder( newSubFolder );

						currentFolder = newSubFolder;
					}
					
					else
					{
						currentFolder = currentFolder.getFolder( part );
					}
				}
			}
		}

		return { treeStructure: mainFolder, flatFileStructure };
	}


	private reduceSingleChildFolders( folder: Folder ): Folder
	{
		if ( folder.subfoldersSize === 0 )
		{
			return folder;
		}


		else if ( folder.subfoldersSize === 1 && folder.filesSize === 0 )
		{
			const childFolder: Folder = folder.getFolders()[0];
			folder.setProps({ name: `${folder.state.name}/${childFolder.state.name}` });

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