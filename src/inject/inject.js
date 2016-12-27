var GitLabTree = (function () {
    function GitLabTree() {
        this.init();
        // Detection if we are on GitLab page
        var isGitLab = document.querySelector('meta[content="GitLab"]');
        if (!isGitLab) {
            return;
        }
        // Detection if we have any files to generate tree from
        var files = document.querySelector('.files');
        if (!files) {
            return;
        }
        this.fileHolders = files.querySelectorAll('.file-holder');
        if (!files || this.fileHolders.length === 0) {
            return;
        }
        files.classList.add('gitlab-tree-plugin');
        // Analyze filenames
        this.fileNames = this.collectFileNames(files);
        this.pathPrefix = this.getPrefixPath(this.fileNames);
        this.strippedFileNames = this.removePathPrefix(this.fileNames, this.pathPrefix);
        // Create and display DOM
        var fileNamesDOM = this.convertFolderStructureToDOM(this.pathPrefix, this.createFolderStructure(this.strippedFileNames));
        this.leftElement.appendChild(fileNamesDOM);
        files.appendChild(this.wrapperElement);
        // Show file based on hash id
        var currentFileId = this.getIdFromHash(location.hash) || 0;
        this.showFile(currentFileId);
        // Add listener for changes
        this.hashChangeListener = this.hashChanged.bind(this);
        window.addEventListener('hashchange', this.hashChangeListener);
    }
    /**
     * Kind of destructor.
     */
    GitLabTree.prototype.teardown = function () {
        window.removeEventListener('hashchange', this.hashChangeListener);
    };
    /**
     * Resets all variables, creates required DOM elements.
     */
    GitLabTree.prototype.init = function () {
        this.pathPrefix = '';
        this.fileHolders;
        this.fileNames = [];
        this.strippedFileNames = [];
        this.wrapperElement = document.createElement('div');
        this.leftElement = document.createElement('div');
        this.rightElement = document.createElement('div');
        this.wrapperElement.appendChild(this.leftElement);
        this.wrapperElement.appendChild(this.rightElement);
        this.wrapperElement.classList.add('gitlab-tree-plugin-wrapper');
        this.leftElement.classList.add('gitlab-tree-plugin-left');
        this.rightElement.classList.add('gitlab-tree-plugin-right');
    };
    /**
     * It loops through files listed (DOM elements; consists of filename and content),
     * saves their filenames and removes them from DOM.
     *
     * @param {HTMLElement} files - DOM element with files listed
     * @return {string[]} - collected file names
     */
    GitLabTree.prototype.collectFileNames = function (files) {
        var fileNames = [];
        for (var i = 0; i < this.fileHolders.length; i++) {
            var fileHolder = this.fileHolders[i];
            var fileName = fileHolder.querySelector('.file-title strong').textContent.trim();
            fileNames.push(fileName);
            files.removeChild(fileHolder);
        }
        return fileNames;
    };
    /**
     * It loops through files finding maximum common folder structure.
     *
     * @param {string[]} fileNames - list of filenames
     * @return {string} - maximum common folder path
     */
    GitLabTree.prototype.getPrefixPath = function (fileNames) {
        if (!Array.isArray(fileNames)) {
            throw new Error("Expected array, " + typeof fileNames + " given!");
        }
        if (fileNames.length === 0) {
            return '';
        }
        var sourcePathParts = fileNames[0].split('/');
        if (fileNames.length === 1) {
            sourcePathParts.pop();
            return sourcePathParts.join('/');
        }
        for (var i = 1; i < fileNames.length; i++) {
            var filePathParts = fileNames[i].split('/');
            for (var ii = 0; ii < sourcePathParts.length; ii++) {
                if (sourcePathParts[ii] !== filePathParts[ii]) {
                    sourcePathParts = sourcePathParts.slice(0, ii);
                    break;
                }
            }
        }
        return sourcePathParts.join('/');
    };
    /**
     * Removes path prefix from all fileNames.
     *
     * @param {string[]} fileNames - list of filenames
     * @param {string} prefix - prefix to be removed
     * @return {string[]} - trimmed filenames
     */
    GitLabTree.prototype.removePathPrefix = function (fileNames, prefix) {
        if (prefix.length === 0) {
            return fileNames.slice(0);
        }
        var output = [];
        for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
            var fileName = fileNames_1[_i];
            output.push(fileName.substring((prefix + '/').length));
        }
        return output;
    };
    /**
     * Creates folder structure from given list of files.
     * Folders are objects, files are numbers.
     *
     * Example: [ test/foo/spec1.ts, test/foo/spec2.ts ] -> { test: { foo: { spec1: 0, spec1: 1 }}}
     *
     * @param {string} fileNames - list of filenames
     * @return {any} generated folder structure
     */
    GitLabTree.prototype.createFolderStructure = function (fileNames) {
        var structure = {};
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            throw new Error("Expected array, " + typeof fileNames + " given!");
        }
        for (var i = 0; i < fileNames.length; i++) {
            var fileName = fileNames[i];
            var fileNameParts = fileName.split('/');
            var currentFolder = structure;
            for (var ii = 0; ii < fileNameParts.length; ii++) {
                var part = fileNameParts[ii];
                if (!currentFolder[part]) {
                    if (ii === fileNameParts.length - 1) {
                        currentFolder[part] = i; // file
                    }
                    else {
                        currentFolder[part] = {}; // folder
                    }
                }
                currentFolder = currentFolder[part];
            }
        }
        return structure;
    };
    /**
     * Converts folder structure into DOM recursively.
     *
     * @param {string} folderName - name of the currently proceed folder
     * @param {string} structure - folder structure (for example see `createFolderStructure`)
     * @return {HTMLDivElement} corresponding folder structure
     */
    GitLabTree.prototype.convertFolderStructureToDOM = function (folderName, structure) {
        var root = document.createElement('div');
        root.classList.add('folder');
        var holder = document.createElement('div');
        holder.classList.add('holder');
        holder.setAttribute('title', folderName);
        holder.textContent = folderName;
        root.appendChild(holder);
        var files = [];
        var folders = [];
        for (var name_1 in structure) {
            if (structure.hasOwnProperty(name_1)) {
                var entry = structure[name_1];
                if (typeof entry === 'number') {
                    var file = document.createElement('a');
                    file.setAttribute('href', "#diff-" + entry);
                    file.classList.add('file');
                    file.textContent = name_1;
                    files.push(file);
                }
                else {
                    folders.push(this.convertFolderStructureToDOM(name_1, entry));
                }
            }
        }
        folders.forEach(function (folder) { return root.appendChild(folder); });
        files.forEach(function (file) { return root.appendChild(file); });
        return root;
    };
    /**
     * Callback called after hash has changed. It searches for "diff-[FILE ID]"" in hash,
     * and displays corresponding file (based on id).
     */
    GitLabTree.prototype.hashChanged = function () {
        var newHash = location.hash;
        var fileId = this.getIdFromHash(newHash) || 0;
        this.showFile(fileId);
    };
    /**
     * Returns id of file from hash.
     *
     * @param {string} hash - hash
     * @return {number} - id of file
     */
    GitLabTree.prototype.getIdFromHash = function (hash) {
        if (hash.match('diff-')) {
            return parseInt(hash.substr(hash.charAt(0) === '#' ? '#diff-'.length : 'diff-'.length));
        }
        return;
    };
    /**
     * Shows file based on id.
     *
     * @param {number} id - id of file to be shown
     */
    GitLabTree.prototype.showFile = function (id) {
        this.rightElement.innerHTML = '';
        this.rightElement.appendChild(this.fileHolders[id]);
    };
    return GitLabTree;
}());
var instance = new GitLabTree();
/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange() {
    var files = document.querySelector('.files');
    if (files && !files.classList.contains('gitlab-tree-plugin')) {
        instance.teardown();
        instance = new GitLabTree();
    }
}
setInterval(function () { return checkSiteChange(); }, 3000);
//# sourceMappingURL=inject.js.map