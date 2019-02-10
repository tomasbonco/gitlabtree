import { Store } from 'vuex'
import { IState, EFileState, IFileUpdate } from '../store/interface';
import { EActions } from '../store/actions';

export function mine_v11o0( store: Store<IState> ): boolean
{
	const elements = Array.from( document.querySelectorAll( '.diff-file-changes .dropdown-content li:not(.hidden):not(.dropdown-menu-empty-item)' ) );

	if ( ! elements || elements.length === 0 )
	{
		return false;
    }

    try
    {
        for ( let element of elements )
		{
			const svgElement: HTMLElement = element.querySelector( 'svg.diff-file-changed-icon' ) as HTMLElement;
			const typeRaw: string = svgElement.querySelector( 'use' ).getAttribute('xlink:href').split('#')[1];
			const hash: string = element.querySelector( 'a' ).getAttribute('href');
			const fileName: string = element.querySelector( '.diff-changed-file' ).getAttribute('title');
			const isCred: boolean = svgElement.classList.contains( 'cred' );
			
			let type: EFileState = EFileState.UPDATED;


			// Convert type

			if ( typeRaw === 'file-addition' ) { type = EFileState.ADDED;	}
			if ( typeRaw === 'file-deletion' && ! isCred ) { type = EFileState.RENAMED; }
			if ( typeRaw === 'file-deletion' && isCred ) { type = EFileState.DELETED; }


			// Detect additions and deletions from `metadata`

			const additions = parseInt(( element.querySelector('.diff-changed-stats .cgreen') as HTMLElement ).innerText );
			const deletions = parseInt(( element.querySelector('.diff-changed-stats .cred') as HTMLElement ).innerText );


			// Save

			const fileUpdate: IFileUpdate = 
			{
				path: fileName,
				hash,
				changeType: type,
				additions,
				deletions
			}

            store.dispatch( EActions.UPDATE_FILE as any, fileUpdate );
		}

        return true;
    }

    catch ( e )
    {
        console.log( e );
        return false;
    }
}