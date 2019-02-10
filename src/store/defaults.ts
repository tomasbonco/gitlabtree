import { IFile, IFolder, IState, EDisplayModes } from "./interface";
import { getRandomId } from '../helpers/get-random-id';

export function getDefaultFile(): IFile
{
	const defaultFile: IFile =
	{
		path: '',
		dir: '',
		base: '',
		ext: '',
		hash: '',
		isCommented: false,
		changeType: 0, // TODO
		additions: 0,
		deletions: 0
	}

	return defaultFile;
}

export function getDefaultFolder(): IFolder
{
	const defaultFolder: IFolder = 
	{
		id: getRandomId(),
		name: '',
		subfolders: [],
		files: [],
		isExpanded: true
	}

	return defaultFolder;
}

export function getDefaultState(): IState
{
	const defaultState: IState = 
	{
		settings:
		{
			showWhenSingleChange: true,
			sortFilesBy: 0 // TODO
		},

		fileFilter: '',
		filesPlain: [],
		folderStructure: getDefaultFolder(),

		activeFile: '',
		displayMode: EDisplayModes.FOLDER_STRUCTURE
	}

	return defaultState;
}