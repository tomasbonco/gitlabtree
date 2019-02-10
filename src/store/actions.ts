import { IFileUpdate, IFolderUpdate, EDisplayModes } from "./interface";
import { EMutations } from "./mutations";

export const EActions =
{
    SET_ACTIVE_FILE: 'SET_ACTIVE_FILE',
    SET_DISPLAY_MODE: 'SET_DISPLAY_MODE',
    UPDATE_FILE: 'UPDATE_FILE',
    UPDATE_FOLDER: 'UPDATE_FOLDER',
    FLAT_FOLDER_STRUCTURE: 'FLAT_FOLDER_STRUCTURE',
    FILTER_FILES: 'FILTER_FILES'
}

export const actions =
{
    [EActions.UPDATE_FILE]({ commit, state }, update: IFileUpdate )
    {
        commit( EMutations.UPDATE_PLAIN_FILE, update );
        commit( EMutations.UPDATE_FILE_IN_STRUCTURE, update );
    },
    

    [EActions.UPDATE_FOLDER]({ commit, state }, update: IFolderUpdate )
    {
        commit( EMutations.UPDATE_FOLDER, update );
    },


    [EActions.FLAT_FOLDER_STRUCTURE]({ commit, state })
    {
        commit( EMutations.FLAT_FOLDER_STRUCTURE )
    },


    [EActions.SET_ACTIVE_FILE]({ commit, state }, path: string )
    {
        commit( EMutations.SET_ACTIVE_FILE, path )
    },


    [EActions.SET_DISPLAY_MODE]({ commit, state }, mode: EDisplayModes )
    {
        commit( EMutations.SET_DISPLAY_MODE, mode )
    },

    
    [EActions.FILTER_FILES]({ commit, state }, fileFilter: string )
    {
        commit( EMutations.FILTER_FILES, fileFilter )
    }
}