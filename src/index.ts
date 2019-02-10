import { prepareDomStructure } from "./helpers/prepare-dom-structure";
import { mine_latest } from "./miners/latest";
import { mine_v11o0 } from "./miners/pre-11-0";
import { mine_v10o3 } from "./miners/pre-10-3";
import { mine_v9o5 } from "./miners/pre-9-5";
import { store } from "./store/index";
import { treeList } from "./views/index";
import { EActions } from './store/actions';
import { CSS_PREFIX } from './constants';

export function gitlabTreeView()
{
    const minerList = [ mine_latest, mine_v11o0, mine_v10o3, mine_v9o5 ];
    let sucessfullyMined: boolean = false;

    for ( const miner of minerList )
    {
        sucessfullyMined = miner( store )

        if ( sucessfullyMined )
        {
            break;
        }
    }

    if ( ! sucessfullyMined )
    {
        throw new Error( 'Incompatible' );
    }

    store.dispatch( EActions.FLAT_FOLDER_STRUCTURE );

    const targetElement = prepareDomStructure();

    treeList( targetElement );

    const files: Element = document.querySelector( '.files' );
    files.classList.add( CSS_PREFIX )

    const teardown = () => {}
    return teardown;
}