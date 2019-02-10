import { expandPath } from "./expand-path";

export function listFolders( path: string ): string[]
{
    const {folder} = expandPath( path );
    return folder.split( /[\/\\]/ );
}