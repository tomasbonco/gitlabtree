import { autoinject } from './container';
import { Metadata, IMetadata, EFileState } from './metadata';
import { CSS_PREFIX } from './constants';

export interface IFileProps
{
	id: number;
	fullName: string;
	name: string;
	ext: string;
	hash: string;
	type: EFileState;
	isCommented: boolean;
	isActive: boolean;
}


@autoinject
export class File
{
	id: string = 'gtp' + Math.random().toString(36).substr(2, 10);
	state: IFileProps = {} as IFileProps;


	constructor( private metadata: Metadata )
	{}


	init( fullName: string, id: number ): File
	{
		this.updateState({ fullName, id })

		return this;
	}


	updateState( changes: any ): File
	{
		if ( changes.fullName )
		{
			const fileNameParts: string[] = changes.fullName.split( '.' );
			changes.ext = fileNameParts.length > 0 ? fileNameParts.pop() : '';
			changes.name = fileNameParts.join( '.' );
		}

		if ( changes.id !== undefined )
		{
			const metadata: IMetadata = this.metadata.get( changes.id );
			changes.hash = metadata.hash;
			changes.type = metadata.type;
			changes.isCommented = metadata.commented;
		}

		Object.assign( this.state, changes );
		this.tryToRerender();

		return this;
	}


	setActive(): void
	{
		this.updateState({ isActive: true })
	}

	
	setInactive(): void
	{
		this.updateState({ isActive: false })
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
		<a id="${this.id}" href="${this.state.hash}" class="file gitlab-tree-plugin-file-${EFileState[this.state.type].toLocaleLowerCase()} ${ this.state.isActive ? CSS_PREFIX + '-file-active' : '' }">
			${ this.state.isCommented ? `<i class="fa fa-comments-o ${CSS_PREFIX}-file-commented-icon"></i>` : ''}
			<span> ${ this.state.fullName } </span>
		</a>
		`
	}
}