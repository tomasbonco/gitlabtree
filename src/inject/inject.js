var CSS_PREFIX = 'gitlab-tree-plugin';
var EFileState;
(function (EFileState) {
    EFileState[EFileState["ADDED"] = 0] = "ADDED";
    EFileState[EFileState["UPDATED"] = 1] = "UPDATED";
    EFileState[EFileState["RENAMED"] = 2] = "RENAMED";
    EFileState[EFileState["DELETED"] = 3] = "DELETED";
})(EFileState || (EFileState = {}));
;
var GitLabTree = (function () {
    function GitLabTree() {
        this.wrapperElement = document.createElement('div');
        this.leftElement = document.createElement('div');
        this.rightElement = document.createElement('div');
        this.lastActive = '';
        this.init();
        // Detection if we are on GitLab page
        var isGitLab = document.querySelector('meta[content="GitLab"]');
        if (!isGitLab) {
            return;
        }
        // Detection if we have any files to generate tree from
        var files = document.querySelector('.files'), as = HTMLElement;
        if (!files) {
            return;
        }
        this.fileHolders = files.querySelectorAll('.file-holder');
        if (!files || this.fileHolders.length === 0) {
            return;
        }
        files.classList.add(CSS_PREFIX);
        this.copyAndHideFiles(files);
        // Obtain metadata
        this.metadata = this.obtainMetadata();
        if (this.metadata.length === 0) {
            return;
        }
        this.obtainCommentedFiles();
        // Analyze filenames
        this.fileNames = this.metadata.map(function (m) { return m.filename; });
        this.pathPrefix = this.getPrefixPath(this.fileNames);
        this.strippedFileNames = this.removePathPrefix(this.fileNames, this.pathPrefix);
        // Create and display DOM
        var fileNamesDOM = this.convertFolderStructureToDOM(this.pathPrefix, this.createFolderStructure(this.strippedFileNames));
        this.leftElement.appendChild(fileNamesDOM);
        files.appendChild(this.wrapperElement);
        // Show file based on hash id
        var currentFileHash = location.hash;
        this.showFile(currentFileHash);
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
     * Creates required DOM elements.
     */
    GitLabTree.prototype.init = function () {
        this.wrapperElement.appendChild(this.leftElement);
        this.wrapperElement.appendChild(this.rightElement);
        this.wrapperElement.classList.add(CSS_PREFIX + '-wrapper');
        this.leftElement.classList.add(CSS_PREFIX + '-left');
        this.rightElement.classList.add(CSS_PREFIX + '-right');
    };
    /**
     * Collects basic information about files - their names, their hashes, and happend to them.
     *
     * @return {IMetadata} - collected metadata
     */
    GitLabTree.prototype.obtainMetadata = function () {
        var metadata = [];
        var rawFilesMetadata = Array.prototype.slice.call(document.querySelectorAll('.file-stats li'));
        for (var _i = 0; _i < rawFilesMetadata.length; _i++) {
            var rawFileMetadata = rawFilesMetadata[_i];
            var typeRaw = Array.prototype.slice.call(rawFileMetadata.querySelector('span:first-child').classList);
            var hash = rawFileMetadata.querySelector('a').getAttribute('href');
            var filename = rawFileMetadata.querySelector('a').textContent.trim();
            var type = EFileState.UPDATED;
            ;
            // When file renamed, show renamed file
            if (filename.indexOf('→') !== -1) {
                filename = filename.split('→')[1].trim();
            }
            // Convert type
            if (~typeRaw.indexOf('new-file')) {
                type = EFileState.ADDED;
            }
            if (~typeRaw.indexOf('renamed-file')) {
                type = EFileState.RENAMED;
            }
            if (~typeRaw.indexOf('deleted-file')) {
                type = EFileState.DELETED;
            }
            // Save
            var fileMetadata = { type: type, hash: hash, filename: filename, commented: false };
            metadata.push(fileMetadata);
        }
        return metadata;
    };
    GitLabTree.prototype.obtainCommentedFiles = function () {
        var _this = this;
        var fileHolders = Array.prototype.slice.call(this.fileHolders);
        fileHolders.forEach(function (fileHolder, index) {
            var metadata = _this.getMetadata(index);
            metadata.commented = !!fileHolder.querySelector('.notes_holder');
        });
    };
    /**
     * Returns metadata by index.
     *
     * @param {number} index - index
     * @return {IMetadata} - metadata
     */
    GitLabTree.prototype.getMetadata = function (index) {
        return this.metadata[index];
    };
    /**
     * It loops through files listed (DOM elements), copies them to new DOM structure,
     * and hides them.
     *
     * @param {HTMLElement} files - DOM element with files listed
     */
    GitLabTree.prototype.copyAndHideFiles = function (files) {
        for (var i = 0; i < this.fileHolders.length; i++) {
            var fileHolder = this.fileHolders[i], as = HTMLElement;
            files.removeChild(fileHolder);
            this.rightElement.appendChild(fileHolder);
            fileHolder.classList.add(CSS_PREFIX + '-hidden');
        }
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
        for (var _i = 0; _i < fileNames.length; _i++) {
            var fileName = fileNames[_i];
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
                    var metadata = this.getMetadata(entry);
                    var file = document.createElement('a');
                    file.setAttribute('href', metadata.hash);
                    file.classList.add('file');
                    // Color
                    var fileStateClass = void 0;
                    switch (metadata.type) {
                        case EFileState.ADDED:
                            fileStateClass = CSS_PREFIX + '-file-added';
                            break;
                        case EFileState.RENAMED:
                            fileStateClass = CSS_PREFIX + '-file-renamed';
                            break;
                        case EFileState.DELETED:
                            fileStateClass = CSS_PREFIX + '-file-deleted';
                            break;
                        default:
                            fileStateClass = CSS_PREFIX + '-file-updated';
                            break;
                    }
                    // Was file commented?
                    if (metadata.commented) {
                        var commentElement = document.createElement('i');
                        commentElement.classList.add('fa', 'fa-comments-o', CSS_PREFIX + '-file-commented-icon');
                        file.appendChild(commentElement);
                    }
                    // Content
                    var contentElement = document.createElement('span');
                    contentElement.textContent = name_1;
                    file.appendChild(contentElement);
                    file.classList.add(fileStateClass);
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
        this.showFile(newHash);
    };
    /**
     * Shows file based on id.
     *
     * @param {number} id - id of file to be shown
     */
    GitLabTree.prototype.showFile = function (hash) {
        if (this.metadata.length === 0) {
            return;
        }
        if (this.lastActive) {
            this.getFileHolderByHash(this.lastActive).classList.add(CSS_PREFIX + '-hidden');
            this.getFileLinkByHash(this.lastActive).classList.remove(CSS_PREFIX + '-file-active');
        }
        hash = this.metadata.filter(function (m) { return m.hash === hash; }).length > 0 ? hash : this.metadata[0].hash; // if hash is invalid use default hash
        this.getFileHolderByHash(hash).classList.remove(CSS_PREFIX + '-hidden');
        this.getFileLinkByHash(hash).classList.add(CSS_PREFIX + '-file-active');
        this.lastActive = hash;
    };
    GitLabTree.prototype.getFileHolderByHash = function (hash) {
        return this.rightElement.querySelector("[id='" + hash.substr(1) + "']");
        as;
        HTMLElement;
    };
    GitLabTree.prototype.getFileLinkByHash = function (hash) {
        return this.leftElement.querySelector("[href='" + hash + "']");
        as;
        HTMLElement;
    };
    return GitLabTree;
})();
var instance = new GitLabTree();
/**
 * This is for fake AJAX re-renders of the page.
 */
function checkSiteChange() {
    var files = document.querySelector('.files');
    if (files && !files.classList.contains(CSS_PREFIX)) {
        instance.teardown();
        instance = new GitLabTree();
    }
}
setInterval(function () { return checkSiteChange(); }, 3000);
//# sourceMappingURL=inject.js.map