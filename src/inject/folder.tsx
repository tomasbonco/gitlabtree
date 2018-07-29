export class Folder
{
	props: { name: string; };

	private subfolders: Folder[] = [];
	private files: File[] = [];


	setProps( name: string )
	{
		this.props = { name };
	}


	get subfoldersSize(): number
	{
		return this.subfolders.length;
	}


	get filesSize(): number
	{
		return this.files.length;
	}


	addFolder( ...folders: Folder[] )
	{
		const copy = this.subfolders.slice(0)
		copy.push( ...folders );
		this.subfolders = copy;
	}


	addFile( ...files: File[] )
	{
		const copy = this.files.slice(0);
		copy.push( ...files );
		this.files = copy;
	}


	getFolder( folderName: string ): Folder
	{
		return this.subfolders.find( x => x.name === folderName );
	}


	hasFolder( folderName: string ): Folder
	{
		return this.getFolder( folderName );
	}


	getFolders( sort = 0 )
	{
		const copy = this.subfolders.slice( 0 );
		// copy.sort( ( a, b ) );

		return copy;
	}


	getFiles( sort = 0 )
	{
		const copy = this.files.slice( 0 );
		return copy;
	}


	dropFolders()
	{
		this.subfolders = [];
	}


	dropFiles()
	{
		this.files = [];
	}

	render()
	{
		return (
			<div></div>
		)
	}
}