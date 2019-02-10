import { IState, IFile } from "./interface";

export const getters =
{
    /**
     * Returns file by it's index in `filesPlain`.
     * If you feel like doing some manipulation based on file index is terrible idea, I agree.
     * 
     * @param index {number}
     */
    getFileByIndex( state: IState ): ( index: number ) => IFile
    {
        return (index: number) => state.filesPlain[ index ];
    },


    /**
     * Returns file data by it's hash.
     * Hash is string that GitLab uses in URL and id attribute to identify files.
     * 
     * @param hash {string} - hash 
     */
    getFileByHash( state: IState ): ( hash: string ) => IFile
    {
        return (hash: string) => state.filesPlain.find( f => f.hash === hash )
    },


    /**
     * Returns file data by it's path.
     * We are working with Git commits. Two files cannot have same path.
     * 
     * @param path {string}
     */
    getFileByPath( state: IState ): ( path: string ) => IFile
    {
        return (path: string) => state.filesPlain.find( f => f.path === path )
    },


    /**
     * Sums additions from files.
     */
    getTotalAdditions( state: IState ): number
    {
        return state.filesPlain.reduce( ( prev, curr ) => prev + curr.additions, 0 );
    },


    /**
     * Sums deletions from files.
     */
    getTotalDeletions( state: IState ): number
    {
        return state.filesPlain.reduce( ( prev, curr ) => prev + Math.abs( curr.deletions ), 0 );
    },


    /**
     * Returns number of changed + added + deleted files.
     */
    getFilesCount( state: IState ): number
    {
        return state.filesPlain.length;
    },
};