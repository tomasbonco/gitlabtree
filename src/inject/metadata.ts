export enum EFileState { ADDED, UPDATED, RENAMED, DELETED };

export interface IMetadata
{
	type: EFileState; // 'renamed' | 'deleted' | 'edit' | 'new';
	hash: string;
	filename: string;
	commented: boolean;
}


export class Metadata
{
	metadata: IMetadata[];


	constructor( private fileHolders: NodeList )
	{
		this.getAll();
	}


	getAll(): IMetadata[]
	{
		if ( ! this.metadata )
		{
			this.metadata = this.obtainMetadata() || [];
		}

		if ( this.metadata.length > 0 )
		{
			this.obtainCommentedFiles();
		}

		return this.metadata;
	}


	/**
	 * Returns metadata by index.
	 * 
	 * @param {number} index - index
	 * @return {IMetadata} - metadata
	 */
	get( index: number ): IMetadata
	{
		return this.metadata[ index ];
	}


	/**
	 * Collects basic information about files - their names, their hashes, and happend to them.
	 * 
	 * @return {IMetadata} - collected metadata
	 */
	private obtainMetadata(): IMetadata[]
	{
		const metadataFiles_v10_3_and_latest: () => HTMLElement[] = () => Array.prototype.slice.call( document.querySelectorAll( '.diff-file-changes .dropdown-content li:not(.hidden):not(.dropdown-menu-empty-item)' ));
		const metadataFiles_v9_5: () => HTMLElement[] = () => Array.prototype.slice.call( document.querySelectorAll( '.file-stats li' ));

		const files_latest: HTMLElement[] = metadataFiles_v10_3_and_latest();

		if ( files_latest.length > 0 )
		{
			if ( files_latest[0].querySelector( 'a i:first-child' ) )
			{
				return this.obtainMetadata_v10_3( files_latest );
			}

			else
			{
				return this.obtainMetadata_latest( files_latest );
			}
		}

		else
		{
			return this.obtainMetadata_v9_5( metadataFiles_v9_5() );
		}		
	}

	/**
	 * It does obtain metadata for latest known version of Gitlab (Collects basic information about files - their names, their hashes and what happend to them).
	 *
	 * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
	 */
	private obtainMetadata_latest( rawFilesMetadata: HTMLElement[] ): IMetadata[]
	{
		const metadata: IMetadata[] = [];

		for ( let rawFileMetadata of rawFilesMetadata )
		{
			const svgElement: HTMLElement = rawFileMetadata.querySelector( 'svg.diff-file-changed-icon' ) as HTMLElement;
			console.log( svgElement, rawFileMetadata )
			const typeRaw: string = svgElement.querySelector( 'use' ).getAttribute('xlink:href').split('#')[1];
			const hash: string = rawFileMetadata.querySelector( 'a' ).getAttribute('href');
			const filename: string = rawFileMetadata.querySelector( '.diff-changed-file' ).getAttribute('title');
			const isCred: boolean = svgElement.classList.contains( 'cred' );
			
			let type: EFileState = EFileState.UPDATED;


			// Convert type

			if ( typeRaw === 'file-addition' ) { type = EFileState.ADDED;	}
			if ( typeRaw === 'file-deletion' && ! isCred ) { type = EFileState.RENAMED; }
			if ( typeRaw === 'file-deletion' && isCred ) { type = EFileState.DELETED; }


			// Save

			const fileMetadata: IMetadata = { type, hash, filename, commented: false };
			metadata.push( fileMetadata );
		}

		return metadata;
	}

	/**
	 * It does obtain metadata for Gitlab < 10_3 (Collects basic information about files - their names, their hashes and what happend to them).
	 * See https://github.com/tomasbonco/gitlabtree/issues/3
	 * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
	 */
	private obtainMetadata_v10_3( rawFilesMetadata: HTMLElement[] ): IMetadata[]
	{
		let metadata: IMetadata[] = [];

		for ( let rawFileMetadata of rawFilesMetadata )
		{
			const classList: DOMTokenList = rawFileMetadata.querySelector( 'a i:first-child' ).classList;
			const hash: string = rawFileMetadata.querySelector( 'a' ).getAttribute('href');
			let filename: string = rawFileMetadata.querySelector( '.diff-file-changes-path' ).textContent.trim();
			let type: EFileState = EFileState.UPDATED;
			

			// When file renamed, show renamed file

			if ( filename.indexOf('→') !== -1 )
			{
				filename = filename.split( '→' )[1].trim();
			}


			// Convert type

			if ( classList.contains( 'fa-plus' )) { type = EFileState.ADDED;	}
			if ( classList.contains( 'fa-minus' ) && ! classList.contains( 'cred' )) { type = EFileState.RENAMED; }
			if ( classList.contains( 'fa-minus' ) && classList.contains( 'cred' )) { type = EFileState.DELETED; }


			// Save

			const fileMetadata: IMetadata = { type, hash, filename, commented: false };
			metadata.push( fileMetadata );
		}

		return metadata;
	}
	
	/**
	 * It does obtain metadata for Gitlab < 9.5 (Collects basic information about files - their names, their hashes and what happend to them).
	 * See https://github.com/tomasbonco/gitlabtree/issues/2
	 * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
	 */
	private obtainMetadata_v9_5( rawFilesMetadata: HTMLElement[] ): IMetadata[]
	{
		const metadata: IMetadata[] = [];

		for ( let rawFileMetadata of rawFilesMetadata )
		{
			const typeRaw: string[] = Array.prototype.slice.call( rawFileMetadata.querySelector(  'span:first-child' ).classList );
			const hash: string = rawFileMetadata.querySelector( 'a' ).getAttribute('href');
			let filename: string = rawFileMetadata.querySelector( 'a' ).textContent.trim();
			let type: EFileState = EFileState.UPDATED;
			

			// When file renamed, show renamed file

			if ( filename.indexOf('→') !== -1 )
			{
				filename = filename.split( '→' )[1].trim();
			}


			// Convert type

			if ( ~typeRaw.indexOf( 'new-file' )) { type = EFileState.ADDED;	}
			if ( ~typeRaw.indexOf( 'renamed-file' )) { type = EFileState.RENAMED; }
			if ( ~typeRaw.indexOf( 'deleted-file' )) { type = EFileState.DELETED; }


			// Save

			const fileMetadata: IMetadata = { type, hash, filename, commented: false };
			metadata.push( fileMetadata );
		}

		return metadata;
	}


	/**
	 * Adds flag 'commented' to metadata for every file that was commented.
	 */
	private obtainCommentedFiles(): void
	{
		const fileHolders: HTMLElement[] = Array.prototype.slice.call( this.fileHolders );

		fileHolders.forEach( ( fileHolder: HTMLElement, index: number ) =>
		{
			const metadata: IMetadata = this.get( index );
			metadata.commented = !! fileHolder.querySelector( '.notes_holder' );
		})
	}
}