import { autoinject } from "./container";
import { Metadata } from "./metadata";

@autoinject
export class File
{
	props: {
		id: number;
		fullName: string;
		name: string;
		ext: string;
		hash: string;
	};


	constructor( private metadata: Metadata )
	{
	}


	setProps( fullName: string, id: number )
	{
		const parts = fullName.split( '.' );
		this.props =
		{
			id,
			fullName,
			ext: parts.pop(),
			name: parts.join( '.' ),
			hash: ''
		}
	}


	render()
	{
		<a href="{this.hash}" class="file gitlab-tree-plugin-file-updated gitlab-tree-plugin-file-active">
			<span> { this.fullName } </span>
		</a>
	}
}