import { Store } from 'vuex'
import { IState, EFileState, IFileUpdate } from '../store/interface';
import { EActions } from '../store/actions';

export function mine_latest( store: Store<IState> ): boolean
{
	const metadatas = Array.from( document.querySelectorAll( '.diff-tree-list .file-row:not(.folder) .file-row-name-container' ) );

	if ( ! metadatas || metadatas.length === 0 )
	{
		return false;
	}


	const fileHolders = Array.from( document.querySelectorAll( '.diff-files-holder .diff-file' ) );

	if ( ! fileHolders || fileHolders.length === 0 || metadatas.length !== fileHolders.length )
	{
		return false;
	}


	try
	{
		for ( let i = 0; i < metadatas.length; i++ )
		{
			const metadata = metadatas[ i ];
			const fileHolder = fileHolders[ i ];


			// Detect filename and hash from `fileHolder`

			const fileName = fileHolder.querySelector( 'strong.file-title-name' ).getAttribute( 'data-original-title' ).split(' ')[0];
			const hash = fileHolder.getAttribute( 'id' );


			// Detect changeType from `metadata`

			const svg = metadata.querySelector( 'svg' );
			let changeType: EFileState = EFileState.RENAMED;

			if ( svg.classList.contains( 'file-addition' ) ) {  changeType = EFileState.ADDED; }
			if ( svg.classList.contains( 'file-modified' ) ) {  changeType = EFileState.UPDATED; }
			if ( svg.classList.contains( 'file-deletion' ) ) {  changeType = EFileState.DELETED; }


			// Detect additions and deletions from `metadata`

			const additions = parseInt(( metadata.querySelector('.file-row-stats .cgreen') as HTMLElement ).innerText );
			const deletions = parseInt(( metadata.querySelector('.file-row-stats .cred') as HTMLElement ).innerText );


			// Save

            const fileUpdate: IFileUpdate = 
			{
				path: fileName,
				hash,
				changeType,
				additions,
				deletions
			}

            store.dispatch( EActions.UPDATE_FILE as any, fileUpdate );
		}

		return true;
	}

	catch ( e )
	{
		console.log( e )
		return false;
	}
}