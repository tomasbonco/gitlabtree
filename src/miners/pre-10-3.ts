import { Store } from 'vuex'
import { IState, EFileState, IFileUpdate } from '../store/interface';
import { EActions } from '../store/actions';

export function mine_v10o3( store: Store<IState> ): boolean
{
	const elements = Array.from( document.querySelectorAll( '.diff-file-changes .dropdown-content li:not(.hidden):not(.dropdown-menu-empty-item)' ) );

	if ( ! elements || elements.length === 0 )
	{
		return false;
    }
    
    if ( ! elements[0].querySelector( 'a i:first-child' ) )
    {
        return false;
    }

    try
    {
        for ( let element of elements )
        {
            const classList: DOMTokenList = element.querySelector( 'a i:first-child' ).classList;
            const hash: string = element.querySelector( 'a' ).getAttribute('href');
            let fileName: string = element.querySelector( '.diff-file-changes-path' ).textContent.trim();
            let type: EFileState = EFileState.UPDATED;
            

            // When file renamed, show renamed file

            if ( fileName.indexOf('→') !== -1 )
            {
                fileName = fileName.split( '→' )[1].trim();
            }


            // Convert type

            if ( classList.contains( 'fa-plus' )) { type = EFileState.ADDED;	}
            if ( classList.contains( 'fa-minus' ) && ! classList.contains( 'cred' )) { type = EFileState.RENAMED; }
            if ( classList.contains( 'fa-minus' ) && classList.contains( 'cred' )) { type = EFileState.DELETED; }


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