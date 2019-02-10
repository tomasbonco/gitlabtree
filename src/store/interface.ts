export enum EFileState { ADDED, UPDATED, RENAMED, DELETED };
export enum EDisplayModes { PLAIN_FILES, FOLDER_STRUCTURE }

export interface IState
{
    settings:
    {
        showWhenSingleChange: boolean;
        sortFilesBy: number; // TODO
    };

	fileFilter: string;
    filesPlain: IFile[];
    folderStructure: IFolder;

	displayMode: EDisplayModes;
    activeFile: string;
}

export interface IFile
{
	path: string;
	dir: string;
	base: string;
	ext: string;
	hash: string;
	isCommented: boolean;
	changeType: EFileState;
	additions: number;
	deletions: number;
}

export interface IFolder
{
	id: string;
    name: string,
	subfolders: IFolder[],
	files: IFile[],
	isExpanded: boolean
}

export interface IFileUpdate
{
	path: string,
	isCommented?: boolean,
	hash?: string,
	changeType?: EFileState,
	additions?: number,
	deletions?: number
}

export interface IFolderUpdate
{
	id: string;
	isExpanded: boolean;
}