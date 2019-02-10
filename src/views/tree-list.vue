<script lang="ts">

import Vue from 'vue'
import File from './file.vue'
import Folder from './folder.vue'
import { mapGetters } from 'vuex'
import { EDisplayModes } from '../store/interface';
import { EActions } from '../store/actions';
import { throttle } from 'lodash'
import Fuse from 'fuse.js'


export default Vue.extend({
	name: 'TreeList',
	components: { File, Folder },

	data: () =>
	({
		fileFilter: '',
		isFilterOpen: false
	}),

	computed:
	{
		plainFiles()
		{
			if ( this.$store.state.fileFilter )
			{
				const list = this.$store.state.filesPlain;

				const options =
				{
					shouldSort: true,
					threshold: 0.4,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 1,
					keys: [{
						name: 'base',
						weight: 0.7
					},
					{
						name: 'path',
						weight: 0.3
					}]
				};

				const fuse = new Fuse( list, options as any );
				const result = fuse.search( this.$store.state.fileFilter );

				const fuse2 = new Fuse( list, Object.assign( {}, options, { includeScore: true } ) as any );
				const result2 = fuse2.search( this.$store.state.fileFilter );

				console.log( result2 );

				return result;
			}

			else
			{
				return this.$store.state.filesPlain
			}
		},

		folderStructure()
		{
			return this.$store.state.folderStructure
		},

		showPlainFiles()
		{
			return this.$store.state.displayMode === EDisplayModes.PLAIN_FILES
		},

		...mapGetters([ 'getFilesCount', 'getTotalAdditions', 'getTotalDeletions' ])
	},

	watch:
	{
		fileFilter()
		{
			this.trottledFilterFiles()
		}
	},

	created()
	{
		this.trottledFilterFiles = throttle( this.filterFiles, 500 )
	},

	methods:
	{
		onFilterFocus()
		{
			this.isFilterOpen = true;
		},

		onFilterBlur()
		{
			if ( this.fileFilter.length === 0 )
			{
				this.isFilterOpen = false;
			}
		},

		clearFileFilter()
		{
			this.fileFilter = '';
			this.isFilterOpen = false;
		},

		switchToList()
		{
			this.$store.dispatch( EActions.SET_DISPLAY_MODE, EDisplayModes.PLAIN_FILES );
		},

		switchToTree()
		{
			this.$store.dispatch( EActions.SET_DISPLAY_MODE, EDisplayModes.FOLDER_STRUCTURE );
		},

		filterFiles()
		{
			this.$store.dispatch( EActions.FILTER_FILES, this.fileFilter )
		}
	}
})

</script>

<template>
	<div class="gitlab-tree-plugin__left">

		<!-- Header -->
		<!-- I copied this from GitLab and changed classes to make it look better and backward compatible. -->
		<div class="gitlab-tree-plugin__header">
			<div class="gitlab-tree-plugin__header__filter-section">
				<svg aria-hidden="true" class="gitlab-tree-plugin__icon gitlab-tree-plugin__header__search-icon" v-show="! isFilterOpen">
					<use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#search"></use>
				</svg>
				<input placeholder="Filter files" type="search" :class="`gitlab-tree-plugin__header__input ${ this.isFilterOpen ? 'gitlab-tree-plugin__header__input--is-open' : '' }`" v-on:focus="onFilterFocus()" v-on:blur="onFilterBlur()" v-model="fileFilter">
				<button aria-label="Clear search" type="button" class="gitlab-tree-plugin__header__clear-btn" v-show="isFilterOpen" v-on:click="clearFileFilter()">
					<svg aria-hidden="true" class="gitlab-tree-plugin__icon">
						<use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#close"></use>
					</svg>
				</button>
			</div>
			<div class="gitlab-tree-plugin__btn-group">
				<button aria-label="List view" type="button" :class="`gitlab-tree-plugin__btn ${ showPlainFiles ? 'gitlab-tree-plugin__btn--is-active' : '' }`" data-original-title="List view" v-on:click="switchToList()">
					<svg aria-hidden="true" class="gitlab-tree-plugin__icon">
						<use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#hamburger"></use>
					</svg>
				</button>
				<button aria-label="Tree view" type="button" :class="`gitlab-tree-plugin__btn ${ ! showPlainFiles ? 'gitlab-tree-plugin__btn--is-active' : '' }`" data-original-title="Tree view" v-on:click="switchToTree()">
					<svg aria-hidden="true" class="gitlab-tree-plugin__icon">
						<use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#file-tree"></use>
					</svg>
				</button>
			</div>
		</div>
		<!-- End of header -->


		<!-- Scroll area (file list) -->
		<div class="gitlab-tree-plugin__list-tree-scroll">

			<div v-if="! showPlainFiles">

				<folder v-for="folder in folderStructure.subfolders" :key="folder.name" :folder="folder" :level="0"></folder>
				<file v-for="file in folderStructure.files" :key="file.path" :file="file" :level="0"></file>
			
			</div>

			<div v-if="showPlainFiles">
				
				<file v-for="file in plainFiles" :key="file.path" :file="file" :level="0" :show-full="true"></file>

			</div>

		</div>
		<!-- End of scroll area -->


		<!-- Footer -->
		<div class="gitlab-tree-plugin__footer">

			<div> {{getFilesCount}} {{ getFilesCount === 1 ? 'file' : `files` }} changed </div>
			<div>
				<span class="gitlab-tree-plugin__stats__additions"> {{ getTotalAdditions }} additions </span>
				<span class="gitlab-tree-plugin__stats__deletions"> {{ getTotalDeletions }} deletions </span>
			</div>
			<div> Enhanced with ❤️ by GitLab Tree View extension </div>

		</div>
		<!-- End of footer -->
		
	</div>
</template>