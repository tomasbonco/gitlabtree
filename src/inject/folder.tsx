import { h, Component } from 'preact';
import { File } from './file'
import { CSS_PREFIX } from './constants'


export class Folder extends Component
{
	state: { name: string; } = { name: '' };

	private subfolders: Folder[] = [];
	private files: File[] = [];


	init( name: string ): Folder
	{
		this.setProps({ name })

		return this;
	}


	setProps( newProps: any ): Folder
	{
		this.setState( newProps );

		return this;
	}


	get subfoldersSize(): number
	{
		return this.subfolders.length;
	}


	get filesSize(): number
	{
		return this.files.length;
	}


	addFolder( ...folders: Folder[] ): void
	{
		const copy: Folder[] = this.subfolders.slice(0)
		copy.push( ...folders );
		this.subfolders = copy;
	}


	addFile( ...files: File[] ): void
	{
		const copy: File[] = this.files.slice(0);
		copy.push( ...files );
		this.files = copy;
	}


	getFolder( folderName: string ): Folder
	{
		return this.subfolders.find( x => x.state.name === folderName );
	}


	hasFolder( folderName: string ): Folder
	{
		return this.getFolder( folderName );
	}


	getFolders( sort = 0 ): Folder[]
	{
		const copy: Folder[] = this.subfolders.slice( 0 );
		// copy.sort( ( a, b ) );

		return copy;
	}


	getFiles( sort = 0 ): File[]
	{
		const copy: File[] = this.files.slice( 0 );
		return copy;
	}


	dropFolders(): void
	{
		this.subfolders = [];
	}


	dropFiles(): void
	{
		this.files = [];
	}


	render(): any
	{
		console.log( this.state )
		return (
			<div class={ `${CSS_PREFIX}-folder ${CSS_PREFIX}-folder-expanded`}>
			
				<div class={CSS_PREFIX + '-holder'} title={this.state.name}> {this.state.name}</div>
				{ this.subfolders.map( fdr => fdr.render() )}
				{ this.files.map( fls => fls.render() )}

			</div>
		)
	}
}