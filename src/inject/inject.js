var CSS_PREFIX = 'gitlab-tree-plugin';
var EFileState;
(function (EFileState) {
    EFileState[EFileState["ADDED"] = 0] = "ADDED";
    EFileState[EFileState["UPDATED"] = 1] = "UPDATED";
    EFileState[EFileState["RENAMED"] = 2] = "RENAMED";
    EFileState[EFileState["DELETED"] = 3] = "DELETED";
})(EFileState || (EFileState = {}));
;
var GitLabTree = /** @class */ (function () {
    function GitLabTree() {
        var _this = this;
        this.wrapperElementBar = document.createElement('div');
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
        var files = document.querySelector('.files');
        var navscroller = document.querySelector('.nav-sidebar-inner-scroll');
        if (!files) {
            return;
        }
        this.fileHolders = files.querySelectorAll('.file-holder');
        if (!files || this.fileHolders.length === 0) {
            return;
        }
        navscroller.classList.add(CSS_PREFIX);
        files.classList.add(CSS_PREFIX);
        // Obtain metadata
        this.metadata = this.obtainMetadata();
        if (this.metadata.length === 0) {
            return;
        }
        this.obtainCommentedFiles();
        // Hide files
        this.copyAndHideFiles(files);
        // Analyze filenames
        this.fileNames = this.metadata.map(function (m) { return m.filename; });
        this.pathPrefix = this.getPrefixPath(this.fileNames);
        this.strippedFileNames = this.removePathPrefix(this.fileNames, this.pathPrefix);
        // Create and display DOM
        var fileNamesDOM = this.convertFolderStructureToDOM(this.pathPrefix, this.createFolderStructure(this.strippedFileNames));
        this.leftElement.appendChild(fileNamesDOM);
        navscroller.appendChild(this.leftElement);
        files.appendChild(this.rightElement);
        // Show file based on hash id
        var currentFileHash = location.hash;
        this.showFile(currentFileHash);
        // Add expanding feature
        this.expandListener = function (e) { return e.target.classList.contains('holder') ? _this.toggleExpand(e) : undefined; };
        document.addEventListener('click', this.expandListener);
        // Add listener for changes
        this.hashChangeListener = this.hashChanged.bind(this);
        window.addEventListener('hashchange', this.hashChangeListener);
    }
    /**
     * Kind of destructor.
     */
    GitLabTree.prototype.teardown = function () {
        window.removeEventListener('hashchange', this.hashChangeListener);
        document.removeEventListener('click', this.expandListener);
    };
    /**
     * Creates required DOM elements.
     */
    GitLabTree.prototype.init = function () {
        this.wrapperElementBar.appendChild(this.leftElement);
        this.wrapperElement.appendChild(this.rightElement);
        this.wrapperElement.classList.add(CSS_PREFIX + '-wrapper');
        this.wrapperElementBar.classList.add(CSS_PREFIX + '-wrapper');
        this.leftElement.classList.add(CSS_PREFIX + '-left');
        this.rightElement.classList.add(CSS_PREFIX + '-right');
    };
    /**
     * Collects basic information about files - their names, their hashes, and happend to them.
     *
     * @return {IMetadata} - collected metadata
     */
    GitLabTree.prototype.obtainMetadata = function () {
        var metadataFiles_v10_3_and_latest = function () { return Array.prototype.slice.call(document.querySelectorAll('.diff-file-changes .dropdown-content li:not(.hidden)')); };
        var metadataFiles_v9_5 = function () { return Array.prototype.slice.call(document.querySelectorAll('.file-stats li')); };
        var files_latest = metadataFiles_v10_3_and_latest();
        if (files_latest.length > 0) {
            if (files_latest[0].querySelector('a i:first-child')) {
                return this.obtainMetadata_v10_3(files_latest);
            }
            else {
                return this.obtainMetadata_latest(files_latest);
            }
        }
        else {
            return this.obtainMetadata_v9_5(metadataFiles_v9_5());
        }
    };
    /**
     * It does obtain metadata for latest known version of Gitlab (Collects basic information about files - their names, their hashes and what happend to them).
     *
     * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
     */
    GitLabTree.prototype.obtainMetadata_latest = function (rawFilesMetadata) {
        var metadata = [];
        for (var _i = 0, rawFilesMetadata_1 = rawFilesMetadata; _i < rawFilesMetadata_1.length; _i++) {
            var rawFileMetadata = rawFilesMetadata_1[_i];
            var svgElement = rawFileMetadata.querySelector('svg.diff-file-changed-icon');
            var typeRaw = svgElement.querySelector('use').getAttribute('xlink:href').split('#')[1];
            var hash = rawFileMetadata.querySelector('a').getAttribute('href');
            var filename = rawFileMetadata.querySelector('.diff-changed-file').getAttribute('title');
            var isCred = svgElement.classList.contains('cred');
            var type = EFileState.UPDATED;
            // Convert type
            if (typeRaw === 'file-addition') {
                type = EFileState.ADDED;
            }
            if (typeRaw === 'file-deletion' && !isCred) {
                type = EFileState.RENAMED;
            }
            if (typeRaw === 'file-deletion' && isCred) {
                type = EFileState.DELETED;
            }
            // Save
            var fileMetadata = { type: type, hash: hash, filename: filename, commented: false };
            metadata.push(fileMetadata);
        }
        return metadata;
    };
    /**
     * It does obtain metadata for Gitlab < 10_3 (Collects basic information about files - their names, their hashes and what happend to them).
     * See https://github.com/tomasbonco/gitlabtree/issues/3
     * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
     */
    GitLabTree.prototype.obtainMetadata_v10_3 = function (rawFilesMetadata) {
        var metadata = [];
        for (var _i = 0, rawFilesMetadata_2 = rawFilesMetadata; _i < rawFilesMetadata_2.length; _i++) {
            var rawFileMetadata = rawFilesMetadata_2[_i];
            var classList = rawFileMetadata.querySelector('a i:first-child').classList;
            var hash = rawFileMetadata.querySelector('a').getAttribute('href');
            var filename = rawFileMetadata.querySelector('.diff-file-changes-path').textContent.trim();
            var type = EFileState.UPDATED;
            // When file renamed, show renamed file
            if (filename.indexOf('→') !== -1) {
                filename = filename.split('→')[1].trim();
            }
            // Convert type
            if (classList.contains('fa-plus')) {
                type = EFileState.ADDED;
            }
            if (classList.contains('fa-minus') && !classList.contains('cred')) {
                type = EFileState.RENAMED;
            }
            if (classList.contains('fa-minus') && classList.contains('cred')) {
                type = EFileState.DELETED;
            }
            // Save
            var fileMetadata = { type: type, hash: hash, filename: filename, commented: false };
            metadata.push(fileMetadata);
        }
        return metadata;
    };
    /**
     * It does obtain metadata for Gitlab < 9.5 (Collects basic information about files - their names, their hashes and what happend to them).
     * See https://github.com/tomasbonco/gitlabtree/issues/2
     * @param {HTMLElement[]} rawFilesMetadata - HTML elements of file changed in commit(s)
     */
    GitLabTree.prototype.obtainMetadata_v9_5 = function (rawFilesMetadata) {
        var metadata = [];
        for (var _i = 0, rawFilesMetadata_3 = rawFilesMetadata; _i < rawFilesMetadata_3.length; _i++) {
            var rawFileMetadata = rawFilesMetadata_3[_i];
            var typeRaw = Array.prototype.slice.call(rawFileMetadata.querySelector('span:first-child').classList);
            var hash = rawFileMetadata.querySelector('a').getAttribute('href');
            var filename = rawFileMetadata.querySelector('a').textContent.trim();
            var type = EFileState.UPDATED;
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
    /**
     * Adds flag 'commented' in metadata to every file that was commented.
     */
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
            var fileHolder = this.fileHolders[i];
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
        root.classList.add(CSS_PREFIX + '-folder-expanded');
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
     * Expands or collapses folder after click.
     *
     * @param {MouseEvent} event - click event on .holder element
     */
    GitLabTree.prototype.toggleExpand = function (event) {
        var folder = event.target.parentElement;
        var isExpanded = folder.classList.contains(CSS_PREFIX + '-folder-expanded');
        var isMainFolder = document.querySelector("." + CSS_PREFIX + "-left > .folder") === folder;
        if (!isMainFolder) {
            folder.classList.remove(CSS_PREFIX + '-folder-collapsed', CSS_PREFIX + '-folder-expanded');
            folder.classList.add(CSS_PREFIX + (isExpanded ? '-folder-collapsed' : '-folder-expanded'));
        }
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
    };
    GitLabTree.prototype.getFileLinkByHash = function (hash) {
        return this.leftElement.querySelector("[href='" + hash + "']");
    };
    return GitLabTree;
}());
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
