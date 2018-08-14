import { File } from './file'
import { CSS_PREFIX } from './constants'
import { h } from 'superfine'
import { autoinject } from './libs/container';
import { Views } from './libs/views';
import { SettingsStore } from './settings.store';
import { EFileSort } from './settings';


interface IFolderState
{
	name: string;
	subfolders: Folder[];
	files: File[];
	isExpanded: boolean;
	isRoot: boolean;
}


@autoinject
export class Folder
{
	state: IFolderState = { name: '', subfolders: [], files: [], isExpanded: true, isRoot: false };


	constructor( private views: Views, private settingsStore: SettingsStore )
	{}


	init( name: string ): Folder
	{
		this.updateState({ name })

		return this;
	}


	updateState( changes: any ): Folder
	{
		Object.assign( this.state, changes )
		this.views.redrawView( 'navigation' );

		return this;
	}


	get subfoldersSize(): number
	{
		return this.state.subfolders.length;
	}


	get filesSize(): number
	{
		return this.state.files.length;
	}


	addFolder( ...folders: Folder[] ): void
	{
		const copy: Folder[] = this.state.subfolders.slice(0)
		copy.push( ...folders );
		this.updateState({ subfolders: copy })
	}


	addFile( ...files: File[] ): void
	{
		const copy: File[] = this.state.files.slice(0);
		copy.push( ...files );
		this.updateState({ files: copy })
	}


	getFolder( folderName: string ): Folder
	{
		return this.state.subfolders.find( x => x.state.name === folderName );
	}


	hasFolder( folderName: string ): Folder
	{
		return this.getFolder( folderName );
	}


	getFolders( sort: EFileSort = EFileSort.AZName ): Folder[]
	{
		const copy: Folder[] = this.state.subfolders.slice( 0 );

		switch ( sort )
		{
			case EFileSort.AZExt:
			case EFileSort.AZName:

				copy.sort( (a: Folder, b: Folder) => a.state.name.localeCompare( b.state.name ) )
				break;

			case EFileSort.ZAExt:
			case EFileSort.ZAName:

				copy.sort( (a: Folder, b: Folder) => b.state.name.localeCompare( a.state.name ) )
				break;
		}

		return copy;
	}


	getFiles( sort = 0 ): File[]
	{
		const copy: File[] = this.state.files.slice( 0 );

		switch ( sort )
		{
			case EFileSort.AZExt:

				copy.sort(( a: File, b: File ) =>
				{
					const cmp: number = a.state.ext.localeCompare( b.state.ext )

					if ( cmp === 0 )
					{
						return a.state.name.localeCompare( b.state.name )
					}
				})
				
				break;


			case EFileSort.AZName:

				copy.sort(( a: File, b: File ) =>
				{
					const cmp: number = a.state.name.localeCompare( b.state.name )

					if ( cmp === 0 )
					{
						return a.state.ext.localeCompare( b.state.ext )
					}

					return cmp;
				})

				break;


			case EFileSort.ZAExt:


				copy.sort(( b: File, a: File ) =>
				{
					const cmp: number = a.state.ext.localeCompare( b.state.ext )

					if ( cmp === 0 )
					{
						return a.state.name.localeCompare( b.state.name )
					}

					return cmp;
				})
				
				break;


			case EFileSort.ZAName:

				copy.sort(( b: File, a: File ) =>
				{
					const cmp: number = a.state.name.localeCompare( b.state.name )

					if ( cmp === 0 )
					{
						return a.state.ext.localeCompare( b.state.ext )
					}

					return cmp;
				})

				break;
		}

		return copy;
	}


	dropFolders(): void
	{
		this.updateState({ subfolders: [] })
	}


	dropFiles(): void
	{
		this.updateState({ files: [] })
	}



	// View

	/**
	 * Clicking on the folder name, collapses or expands folder content.
	 */
	toggleIsFolderExpanded()
	{
		this.state.isExpanded = ! this.state.isExpanded;
		this.views.redrawView( 'navigation' );
	}


	render()
	{
		const expandedClass = CSS_PREFIX + ( this.state.isExpanded || this.state.isRoot ? `-folder-expanded` : `-folder-collapsed` );

		return (
			<div class={`${CSS_PREFIX}-folder ${ expandedClass }`}>
			
				<div class={CSS_PREFIX + '-holder'} title={this.state.name} onclick={ () => this.toggleIsFolderExpanded() }> {this.state.name} </div>
				{ this.getFolders( parseInt( this.settingsStore.get( 'file-sort' )) ).map( fdr => fdr.render() ) }
				{ this.getFiles( parseInt( this.settingsStore.get( 'file-sort' )) ).map( fls => fls.render() ) }

			</div>
		)
	}
}