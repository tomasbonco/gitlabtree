import { Store } from 'vuex'
import { IState, EFileState, IFileUpdate } from '../store/interface';
import { EActions } from '../store/actions';

export function mine_v9o5( store: Store<IState> ): boolean
{
	const elements = Array.from( document.querySelectorAll( '.file-stats li' ) );

	if ( ! elements || elements.length === 0 )
	{
		return false;
	}

	try
	{
		for ( let element of elements )
		{
			const typeRaw: string[] = Array.from( element.querySelector( 'span:first-child' ).classList );
			const hash: string = element.querySelector( 'a' ).getAttribute( 'href' );
			let fileName: string = element.querySelector( 'a' ).textContent.trim();
			let type: EFileState = EFileState.UPDATED;
			

			// When file renamed, show renamed file

			if ( fileName.indexOf('→') !== -1 )
			{
				fileName = fileName.split( '→' )[1].trim();
			}


			// Convert type

			if ( ~typeRaw.indexOf( 'new-file' )) { type = EFileState.ADDED;	}
			if ( ~typeRaw.indexOf( 'renamed-file' )) { type = EFileState.RENAMED; }
			if ( ~typeRaw.indexOf( 'deleted-file' )) { type = EFileState.DELETED; }


			// Save

			const fileUpdate: IFileUpdate = 
			{
				path: fileName,
				hash,
				changeType: type,
			}

			store.dispatch( EActions.UPDATE_FILE as any, fileUpdate );
		}

		return true;
	}

	catch ( e )
	{
		return false;
	}
}