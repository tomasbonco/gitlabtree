import { IFile, IFileUpdate } from "../store/interface";
import { expandPath } from "./expand-path";
import { getDefaultFile } from "../store/defaults";

export function updateFileInList( list: IFile[], update: IFileUpdate )
{
    const existingFile: IFile = list.find( f => f.path === update.path );

    if ( existingFile )
    {
        Object.assign( existingFile, update );
    }

    else
    {
        update = {  ...update, ...expandPath( update.path ) };

        const newFile: IFile = Object.assign( {}, getDefaultFile(), update );
        list.push( newFile );
    }
}