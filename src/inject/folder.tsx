import { File } from './file'
import { CSS_PREFIX } from './constants'


export class Folder
{
	id: string = 'gtp' + Math.random().toString(36).substr(2, 10);
	state: { name: string; subfolders: Folder[]; files: File[] } = { name: '', subfolders: [], files: [] };


	init( name: string ): Folder
	{
		this.updateState({ name })

		return this;
	}


	updateState( changes: any ): Folder
	{
		Object.assign( this.state, changes )
		this.tryToRerender();

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


	getFolders( sort = 0 ): Folder[]
	{
		const copy: Folder[] = this.state.subfolders.slice( 0 );
		// copy.sort( ( a, b ) );

		return copy;
	}


	getFiles( sort = 0 ): File[]
	{
		const copy: File[] = this.state.files.slice( 0 );
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


	tryToRerender(): void
	{
		const element: HTMLElement = document.getElementById( this.id );

		if ( element )
		{
			element.outerHTML = this.render();
		}
	}


	render(): string
	{
		return `
			<div class="${CSS_PREFIX}-folder ${CSS_PREFIX}-folder-expanded" id="${this.id}">
			
				<div class="${CSS_PREFIX}-holder" title="${this.state.name}"> ${this.state.name} </div>
				${ this.state.subfolders.map( fdr => fdr.render() ).join('')}
				${ this.state.files.map( fls => fls.render() ).join('')}

			</div>
		`
	}
}