import { updateFileInList } from "../helpers/update-file-in-list";
import { IFileUpdate, IFolder, IState, IFolderUpdate, EDisplayModes } from "./interface";
import { listFolders } from "../helpers/list-folders";
import { getDefaultFolder } from "./defaults";

export enum EMutations {
    SET_ACTIVE_FILE = 'SET_ACTIVE_FILE',
    SET_DISPLAY_MODE = 'SET_DISPLAY_MODE',
    UPDATE_PLAIN_FILE = 'UPDATE_PLAIN_FILE',
    UPDATE_FILE_IN_STRUCTURE = 'UPDATE_FILE_IN_STRUCTURE',
    UPDATE_FOLDER = 'UPDATE_FOLDER',
    FLAT_FOLDER_STRUCTURE = 'FLAT_FOLDER_STRUCTURE',
    FILTER_FILES = 'FILTER_FILES',
}

export const mutations =
{
    [EMutations.UPDATE_PLAIN_FILE]( state: IState, update: IFileUpdate )
    {
        const list = state.filesPlain;
        updateFileInList( list, update );
    },


    [EMutations.UPDATE_FILE_IN_STRUCTURE]( state: IState, update: IFileUpdate )
    {
        const folderList = listFolders( update.path );


        // FIND FOLDER
        // And generate folder structure if necessary.

        let currentFolder: IFolder = state.folderStructure;

        for ( const folderName of folderList )
        {
            let folder = currentFolder.subfolders.find( f => f.name === folderName );

            if ( ! folder )
            {
                folder = Object.assign( {}, getDefaultFolder(), { name: folderName } );
                currentFolder.subfolders.push( folder )
            }

            currentFolder = folder;
        }


        // ADD / UPDATE FILE TO FOLDER
        updateFileInList( currentFolder.files, update );
    },


    [EMutations.UPDATE_FOLDER]( state: IState, update: IFolderUpdate )
    {
        // Search for folder

        const findFolderById = ( currentFolder: IFolder, id: string ) =>
        {
            if ( currentFolder.id === id )
            {
                return currentFolder;
            }

            for ( const subfolder of currentFolder.subfolders )
            {
                const foundFolder = findFolderById( subfolder, id )

                if ( foundFolder )
                {
                    return foundFolder;
                }
            }

            return;
        }

        const folder = findFolderById( state.folderStructure, update.id );
        Object.assign( folder, update )
    },


    [EMutations.SET_ACTIVE_FILE]( state: IState, path: string )
    {
        state.activeFile = path;
    },


    [EMutations.SET_DISPLAY_MODE]( state: IState, displayMode: EDisplayModes )
    {
        state.displayMode = displayMode
    },


    [EMutations.FLAT_FOLDER_STRUCTURE]( state: IState )
    {
        const initialFolder = state.folderStructure;

        const reduceStructure = ( folder: IFolder ) =>
        {
            if ( folder.subfolders.length === 0 )
            {
                return
            }

            if ( folder.files.length > 0 || folder.subfolders.length > 1 )
            {
                return folder.subfolders.forEach( sf => reduceStructure( sf ));
            }

            // it has 1 subfolder and no files

            const subfolder = folder.subfolders[0];

            folder.subfolders = subfolder.subfolders;
            folder.files = subfolder.files;
            folder.name += folder.name ? `/${subfolder.name}` : subfolder.name;
            
            reduceStructure( folder );
        }

        reduceStructure( initialFolder );
    },


    [EMutations.FILTER_FILES]( state: IState, fileFilter: string )
    {
        state.fileFilter = fileFilter;
    }
}