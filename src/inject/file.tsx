import { autoinject } from './container';
import { Metadata, IMetadata, EFileState } from './metadata';
import { h, Component } from 'preact';
import { CSS_PREFIX } from './constants'

interface IFileProps
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
export class File extends Component
{
	state: IFileProps = {} as IFileProps;


	constructor( private metadata: Metadata )
	{
		super();
	}


	init( fullName: string, id: number ): File
	{
		this.setProps({ fullName, id })

		return this;
	}


	setProps( newProps: any ): File
	{
		if ( newProps.fullName )
		{
			const fileNameParts: string[] = newProps.fullName.split( '.' );
			newProps.ext = fileNameParts.length > 0 ? fileNameParts.pop() : '';
			newProps.name = fileNameParts.join( '.' );
		}

		console.log( newProps )
		if ( newProps.id !== undefined )
		{
			console.log( 'well be famous')
			const metadata: IMetadata = this.metadata.get( newProps.id );
			newProps.hash = metadata.hash;
			newProps.type = metadata.type;
			newProps.isCommented = metadata.commented;
		}

		this.setState( newProps )

		return this;
	}


	setActive(): void
	{
		this.setProps({ isActive: true })
	}

	
	setInactive(): void
	{
		this.setProps({ isActive: false })
	}


	render(): any
	{
		console.log( 'yuy', this.state.isActive )
		return (
			<a href={this.state.hash} class={`file gitlab-tree-plugin-file-updated ${ this.state.isActive ? CSS_PREFIX + '-active' : '' }`}>
				<span> { this.state.fullName } </span>
			</a>
		)
	}
}