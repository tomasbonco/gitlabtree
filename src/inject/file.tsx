import { autoinject } from './libs/container';
import { Metadata, IMetadata, EFileState } from './mining/metadata';
import { CSS_PREFIX } from './constants';
import { h } from 'superfine'
import { Views } from './libs/views';

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
	state: IFileProps = {} as IFileProps;


	constructor( private metadata: Metadata, private views: Views )
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
		this.views.redrawView( 'navigation' );

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


	render(): any
	{
		const fileClass = `file gitlab-tree-plugin-file-${EFileState[this.state.type].toLocaleLowerCase()} ${ this.state.isActive ? CSS_PREFIX + '-file-active' : '' }`;
		const iconClass = `fa fa-comments-o ${CSS_PREFIX}-file-commented-icon`;
		return (
			<a href={this.state.hash} class={ fileClass }>
				{ this.state.isCommented ? <i class={iconClass}></i> : '' }
				<span> { this.state.fullName } </span>
			</a>
		)
	}
}